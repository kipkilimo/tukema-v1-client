// src/sockets/webSocket.ts
//
// Thin transport wrapper around a single WebSocket connection to
// `path`. It does exactly four things:
//
//   1. Build the socket URL (base + query bag).
//   2. Open one socket and resolve on `onopen`.
//   3. Dispatch inbound frames to `on()` listeners.
//   4. Expose `send()` that serializes `{type, ...data}` frames.
//
// It intentionally does NOT:
//   • retry / schedule reconnects
//   • enforce idle timeouts beyond what the browser's WebSocket gives
//   • manage auth, heartbeats, session state, or focus
//
// All of that is the composable's job (`usePaperSocket`). Trying to
// own it in two places is exactly what produced the double-socket /
// 5s-timeout races this file used to exhibit.

import { ref } from "vue";

export interface WebSocketClient {
  connect: (token?: string, config?: any) => Promise<void>;
  disconnect: () => void;
  send: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
  /**
   * True when a socket exists and is mid-handshake. The composable
   * uses this to decide whether it can safely tear down and
   * recreate, or whether it must reuse the in-flight socket.
   */
  isConnecting: () => boolean;
}

export function getWebSocketClient(
  path: string = "/revision",
): WebSocketClient {
  // ── Instance state ────────────────────────────────────────────────
  // Everything below is closure-scoped, so each call to
  // getWebSocketClient() produces an independent transport. The
  // composable holds exactly one instance (module-level `client` ref).
  let socket: WebSocket | null = null;
  let connectionPromise: Promise<void> | null = null;
  let resolveConnection: (() => void) | null = null;
  let rejectConnection: ((err: Error) => void) | null = null;
  let isManuallyClosed = false;

  const eventHandlers: Record<string, Array<(data: any) => void>> = {};

  // ── URL building ──────────────────────────────────────────────────
  //
  // VITE_BASE_WS_URL is authoritative when set — it lets us point at
  // a separate WebSocket origin (e.g. wss://api.example.com) that is
  // NOT the page origin. Falls back to page-origin, protocol-matched,
  // which is correct only when a reverse proxy is upgrading /paper on
  // the same host:port as the page.

  const baseWsUrl =
    import.meta.env.VITE_BASE_WS_URL ||
    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseFullUrl = `${baseWsUrl}${normalizedPath}`;

  console.log(`🔌 WebSocket base URL: ${baseFullUrl}`);

  function buildFinalUrl(token: string | undefined, config: any): string {
    try {
      const url = new URL(baseFullUrl);

      const query =
        config && typeof config.query === "object" && config.query
          ? (config.query as Record<string, unknown>)
          : undefined;

      if (query) {
        for (const [k, v] of Object.entries(query)) {
          if (v === undefined || v === null) continue;
          const s = String(v);
          if (s.length === 0) continue;
          url.searchParams.set(k, s);
        }
      }

      // Legacy positional token arg — only set if the query bag
      // didn't already provide one.
      if (token && !url.searchParams.has("token")) {
        url.searchParams.set("token", token);
      }

      return url.toString();
    } catch (err) {
      console.error("❌ Failed to build WebSocket URL with query params:", err);
      return baseFullUrl;
    }
  }

  // ── Event dispatch ────────────────────────────────────────────────

  function emit(event: string, data: any): void {
    const handlers = eventHandlers[event];
    if (!handlers) return;
    // Snapshot to survive mutation during iteration.
    for (const callback of [...handlers]) {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in event handler for ${event}:`, error);
      }
    }
  }

  // ── Socket factory ────────────────────────────────────────────────

  function createSocket(url: string): WebSocket {
    console.log(`🔌 Creating WebSocket connection to: ${url}`);

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      // `new WebSocket()` throws synchronously on a malformed URL or
      // on mixed-content (ws:// from https://) in some browsers.
      console.error("❌ new WebSocket() threw:", err);
      throw err;
    }

    ws.onopen = () => {
      console.log(`✅ WebSocket connected: ${url}`);
      isManuallyClosed = false;

      // Resolve the connect() promise, then notify listeners.
      // We resolve first so `await connect()` continuations run
      // before user code in `on("connected")` handlers — but note
      // that resolve() only queues a microtask, so `emit("connected")`
      // below runs *synchronously* in the same tick, before that
      // microtask drains. That ordering is what usePaperSocket relies
      // on: by the time `await ws.connect(...)` resolves, the
      // `"connected"` event has already fired and flipped
      // connectionStatus. Do NOT change the order without also
      // updating the composable.
      if (resolveConnection) {
        const resolve = resolveConnection;
        resolveConnection = null;
        rejectConnection = null;
        connectionPromise = null;
        resolve();
      }

      emit("connected", {});
    };

    ws.onclose = (event) => {
      console.log(
        `🔌 WebSocket closed: ${event.code} ${event.reason || "No reason"}`,
      );

      // If the socket closes before onopen, reject the connect()
      // promise so the caller sees a real error instead of hanging.
      if (rejectConnection) {
        const reject = rejectConnection;
        rejectConnection = null;
        resolveConnection = null;
        connectionPromise = null;
        reject(
          new Error(
            `WebSocket closed before it finished opening (code ${event.code})`,
          ),
        );
      }

      socket = null;

      // Notify listeners. The composable decides whether to
      // schedule a reconnect — this wrapper never retries on its
      // own.
      emit("disconnected", { code: event.code, reason: event.reason });
    };

    ws.onerror = (event) => {
      console.error(`❌ WebSocket error for ${url}:`, event);

      // Same as onclose: fail fast if we never got to onopen.
      if (rejectConnection) {
        const reject = rejectConnection;
        rejectConnection = null;
        resolveConnection = null;
        connectionPromise = null;
        reject(new Error("WebSocket connection failed"));
      }

      emit("error", event);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Server frames use `{ type, ...payload }` (see send()). Some
        // legacy paths emit `{ event, data }`. Support both.
        const eventType = message.type || message.event;

        if (eventType) {
          const data = message.payload ?? message.data ?? {};
          emit(eventType, data);
        }

        // Generic escape hatch for anything that wants the raw frame.
        emit("message", message);
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
        console.error("Raw message:", event.data);
      }
    };

    return ws;
  }

  // ── Public API ────────────────────────────────────────────────────

  /**
   * Open a socket. Idempotent:
   *   • OPEN      → resolves immediately
   *   • CONNECTING → returns the in-flight promise
   *   • CLOSED / null → creates a new socket
   *
   * Rejects on `onerror` or on `onclose` before `onopen`. There is no
   * internal timeout — the composable owns timeout policy via
   * `SOCKET_OPEN_TIMEOUT_MS` and its own open-waiter mechanism.
   */
  async function connect(token?: string, config?: any): Promise<void> {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (connectionPromise) {
      return connectionPromise;
    }

    isManuallyClosed = false;

    const finalUrl = buildFinalUrl(token, config);
    console.log(`🔌 Connecting to: ${finalUrl}`);

    connectionPromise = new Promise<void>((resolve, reject) => {
      // If a stale socket is lying around in a non-OPEN state, drop it.
      if (socket) {
        try {
          socket.close();
        } catch {
          /* ignore */
        }
        socket = null;
      }

      let settled = false;
      const settleResolve = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const settleReject = (err: Error) => {
        if (settled) return;
        settled = true;
        reject(err);
      };

      resolveConnection = () => {
        resolveConnection = null;
        rejectConnection = null;
        connectionPromise = null;
        settleResolve();
      };

      rejectConnection = (err: Error) => {
        resolveConnection = null;
        rejectConnection = null;
        connectionPromise = null;
        settleReject(err);
      };

      try {
        socket = createSocket(finalUrl);
      } catch (err) {
        // new WebSocket() threw synchronously — surface it now so
        // the caller sees a real error instead of a silent hang.
        rejectConnection(err instanceof Error ? err : new Error(String(err)));
      }
    });

    return connectionPromise;
  }

  function disconnect(): void {
    console.log("🔌 Disconnecting WebSocket");
    isManuallyClosed = true;

    // Reject any in-flight connect so awaiters don't hang.
    if (rejectConnection) {
      const reject = rejectConnection;
      rejectConnection = null;
      resolveConnection = null;
      connectionPromise = null;
      reject(new Error("Manually disconnected"));
    }

    if (socket) {
      try {
        // 1000 = normal closure. isManuallyClosed above tells onclose
        // not to interpret this as a failure.
        socket.close(1000, "Manual disconnect");
      } catch {
        /* ignore */
      }
      socket = null;
    }
  }

  function send(event: string, data: any): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn(
        `⚠️ Cannot send ${event}: WebSocket not open (state: ${
          socket?.readyState ?? "null"
        })`,
      );
      return;
    }

    const message = {
      type: event,
      ...(data && typeof data === "object" ? data : {}),
    };

    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`❌ Failed to send ${event}:`, error);
    }
  }

  function on(event: string, callback: (data: any) => void): () => void {
    if (!eventHandlers[event]) {
      eventHandlers[event] = [];
    }
    eventHandlers[event].push(callback);

    return () => {
      const handlers = eventHandlers[event];
      if (!handlers) return;
      const index = handlers.indexOf(callback);
      if (index !== -1) handlers.splice(index, 1);
      if (handlers.length === 0) delete eventHandlers[event];
    };
  }

  function isConnecting(): boolean {
    return socket?.readyState === WebSocket.CONNECTING;
  }

  return {
    connect,
    disconnect,
    send,
    on,
    isConnecting,
  };
}
