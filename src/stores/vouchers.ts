// stores/vouchers.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { gql } from "graphql-tag";
import { apolloClient } from "@/graphql/apolloClient";

export const TOKEN_RE = /(?<!\d)\d{7}(?!\d)/;

const REDEEM_VOUCHER = gql`
  mutation RedeemVoucher($input: RedeemVoucherInput!) {
    redeemVoucher(input: $input) {
      success
      message
      remainingUses
      sessionEndsAt
      voucher {
        id
        code
        status
        durationMins
        expiresAt
        redeemedAt
        redeemedUntil
        active
      }
    }
  }
`;

const VOUCHER_BY_CODE = gql`
  query VoucherByCode($code: String!) {
    voucherByCode(code: $code) {
      id
      code
      status
      isImpression
      durationMins
      expiresAt
      redeemedAt
      redeemedUntil
      active
    }
  }
`;

export type RedeemStatus =
  "idle" | "checking" | "redeeming" | "redeemed" | "expired" | "error";

export interface RedeemResult {
  success: boolean;
  message: string;
  code?: string | null;
  /** Epoch ms when the granted window ends; null when not active. */
  activeUntil?: number | null;
  voucher?: any | null;
}

const STORAGE_KEY = "tukema.voucher.session";
const TERMINAL_ID = "web-explorer";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const useVoucherStore = defineStore("vouchers", () => {
  const status = ref<RedeemStatus>("idle");
  const error = ref<string | null>(null);
  const code = ref<string | null>(null);
  const voucher = ref<any | null>(null);
  /** Absolute epoch ms when the granted window ends. */
  const activeUntil = ref<number | null>(null);
  /** Ticks every second so any "time remaining" UI re-renders. */
  const nowMs = ref<number>(Date.now());

  const isRedeemed = computed(
    () =>
      status.value === "redeemed" &&
      activeUntil.value !== null &&
      activeUntil.value > nowMs.value,
  );

  const remainingMs = computed(() =>
    activeUntil.value === null
      ? 0
      : Math.max(0, activeUntil.value - nowMs.value),
  );

  const remainingLabel = computed(() => {
    const ms = remainingMs.value;
    if (ms <= 0) return "";
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  });

  // ---------- internal timer plumbing ----------
  let expiryTimer: ReturnType<typeof setTimeout> | null = null;
  let tickTimer: ReturnType<typeof setInterval> | null = null;

  function stopTimers() {
    if (expiryTimer) {
      clearTimeout(expiryTimer);
      expiryTimer = null;
    }
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function startTimers() {
    stopTimers();
    if (!activeUntil.value || activeUntil.value <= Date.now()) return;

    // 1s ticker for countdown UIs
    tickTimer = setInterval(() => {
      nowMs.value = Date.now();
    }, 1000);

    // the kick-out — flip to "expired" exactly when the window ends
    const delay = activeUntil.value - Date.now();
    expiryTimer = setTimeout(
      () => {
        nowMs.value = Date.now();
        status.value = "expired";
        activeUntil.value = null;
        voucher.value = null;
        code.value = null;
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        stopTimers();
      },
      Math.max(0, delay),
    );
  }

  // ---------- persistence ----------
  function persist() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          code: code.value,
          voucher: voucher.value,
          activeUntil: activeUntil.value,
        }),
      );
    } catch {
      /* ignore */
    }
  }

  function clearPersisted() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function restore(): boolean {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!saved?.code) return false;

      const until: number =
        typeof saved.activeUntil === "number" ? saved.activeUntil : 0;
      if (until <= Date.now()) {
        // Session lapsed while away — do NOT restore.
        clearPersisted();
        return false;
      }

      code.value = saved.code;
      voucher.value = saved.voucher ?? null;
      activeUntil.value = until;
      status.value = "redeemed";
      nowMs.value = Date.now();
      startTimers();
      return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  // Synchronous hydrate on module init (prevents gate flash).
  (() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const until: number =
        typeof saved?.activeUntil === "number" ? saved.activeUntil : 0;
      if (saved?.code && until > Date.now()) {
        code.value = saved.code;
        voucher.value = saved.voucher ?? null;
        activeUntil.value = until;
        status.value = "redeemed";
        startTimers();
      } else if (saved?.code) {
        clearPersisted();
      }
    } catch {
      /* ignore */
    }
  })();

  // ---------- peek (non-consuming check) ----------
  async function peek(token: string): Promise<any | null> {
    status.value = "checking";
    error.value = null;
    code.value = token;
    try {
      const { data } = await withTimeout(
        apolloClient.query({
          query: VOUCHER_BY_CODE,
          variables: { code: token },
          fetchPolicy: "network-only",
        }),
        12_000,
        { data: null } as any,
      );
      if (!data) {
        error.value = "Couldn't reach the ticket service.";
        voucher.value = null;
        return null;
      }
      voucher.value = data?.voucherByCode ?? null;
      if (!voucher.value) error.value = "We couldn't find that ticket.";
      return voucher.value;
    } catch (e: any) {
      voucher.value = null;
      error.value = e?.message ?? "Couldn't check that ticket.";
      return null;
    } finally {
      if (status.value === "checking") status.value = "idle";
    }
  }

  // ---------- redeem (consuming) ----------
  async function redeem(token: string): Promise<RedeemResult> {
    status.value = "redeeming";
    error.value = null;
    code.value = token;
    try {
      const { data } = await withTimeout(
        apolloClient.mutate({
          mutation: REDEEM_VOUCHER,
          variables: { input: { code: token, terminalId: TERMINAL_ID } },
          fetchPolicy: "network-only",
        }),
        12_000,
        { data: null } as any,
      );

      if (!data) {
        status.value = "error";
        error.value = "The ticket service didn't respond. Please try again.";
        return { success: false, message: error.value, code: token };
      }

      const res = data?.redeemVoucher;
      if (!res?.success) {
        status.value = "error";
        error.value = res?.message ?? "Voucher could not be redeemed.";
        voucher.value = res?.voucher ?? null;
        return {
          success: false,
          message: error.value!,
          code: token,
          voucher: voucher.value,
        };
      }

      // Success — compute the session window from server's `sessionEndsAt`
      // (fall back to redeemedUntil, then durationMins on the client).
      const endsAtRaw = res.sessionEndsAt ?? res.voucher?.redeemedUntil ?? null;
      let endsAt = endsAtRaw ? new Date(endsAtRaw).getTime() : NaN;
      if (!Number.isFinite(endsAt)) {
        const mins = Math.max(1, Number(res.voucher?.durationMins ?? 15));
        endsAt = Date.now() + mins * 60_000;
      }

      voucher.value = res.voucher;
      activeUntil.value = endsAt;
      nowMs.value = Date.now();
      status.value = "redeemed";
      persist();
      startTimers();

      return {
        success: true,
        message: res.message,
        code: token,
        activeUntil: endsAt,
        voucher: res.voucher,
      };
    } catch (e: any) {
      status.value = "error";
      error.value = e?.message ?? "Voucher could not be redeemed.";
      return { success: false, message: error.value!, code: token };
    }
  }

  // ---------- enter (gate entry) ----------
  async function enter(rawQuery: string): Promise<RedeemResult> {
    const raw = rawQuery.trim();

    if (!raw) {
      const ok = restore();
      return {
        success: ok,
        message: ok ? "Session restored" : "",
        activeUntil: ok ? activeUntil.value : null,
      };
    }

    const token = raw.match(TOKEN_RE)?.[0];
    if (!token) {
      status.value = "error";
      error.value =
        "Voucher code should be 7 digits. Please scan the QR code again or " +
        "enter the code from your email.";
      return { success: false, message: error.value };
    }

    // Same token already active this session → no-op.
    if (restore() && code.value === token && isRedeemed.value) {
      return {
        success: true,
        code: token,
        message: "Session restored",
        activeUntil: activeUntil.value,
      };
    }

    // Peek first — the server will tell us if the session is still running.
    const found = await peek(token);
    if (!found) {
      status.value = "error";
      error.value ??=
        "We couldn't verify that ticket. Please check the link or try again.";
      return { success: false, message: error.value };
    }

    const v: any = found;
    const active: boolean = v.active === true;
    const st: string = String(v.status ?? "");

    // Case A: currently active session (e.g. user re-opened the tab mid-session)
    if (active && v.redeemedUntil) {
      const until = new Date(v.redeemedUntil).getTime();
      voucher.value = v;
      activeUntil.value = until;
      nowMs.value = Date.now();
      status.value = "redeemed";
      code.value = token;
      persist();
      startTimers();
      return {
        success: true,
        code: token,
        message: "Session still active",
        activeUntil: until,
      };
    }

    // Case B: previously redeemed but window lapsed → kick out.
    if (st === "redeemed" && v.redeemedUntil) {
      status.value = "expired";
      error.value =
        "Your access window has ended. Please purchase a new ticket.";
      activeUntil.value = null;
      voucher.value = null;
      clearPersisted();
      return { success: false, message: error.value };
    }

    if (st === "expired") {
      status.value = "expired";
      error.value = "This ticket has expired. Please purchase a new one.";
      return { success: false, message: error.value };
    }

    if (st === "cancelled" || st === "revoked") {
      status.value = "error";
      error.value = "This ticket is no longer valid.";
      return { success: false, message: error.value };
    }

    // Case C: untouched ticket → redeem.
    return redeem(token);
  }

  // ---------- reset ----------
  function reset() {
    stopTimers();
    status.value = "idle";
    error.value = null;
    code.value = null;
    voucher.value = null;
    activeUntil.value = null;
    clearPersisted();
  }

  /** Hides the gate immediately (e.g. on logout). */
  function forceExpire() {
    stopTimers();
    status.value = "expired";
    activeUntil.value = null;
    voucher.value = null;
    code.value = null;
    clearPersisted();
  }

  /** For future callers that pass the raw purchase payload. */
  async function redeemPayload(payload: any): Promise<RedeemResult> {
    const raw =
      payload?.code ??
      payload?.token ??
      payload?.voucher?.code ??
      payload?.codes?.[0];
    const token = typeof raw === "string" ? raw.match(TOKEN_RE)?.[0] : null;
    if (!token) {
      status.value = "error";
      error.value =
        "Purchase confirmation was malformed — no ticket code received.";
      return { success: false, message: error.value };
    }
    return redeem(token);
  }

  return {
    status,
    error,
    code,
    voucher,
    activeUntil,
    nowMs,
    isRedeemed,
    remainingMs,
    remainingLabel,
    restore,
    peek,
    redeem,
    redeemPayload,
    enter,
    reset,
    forceExpire,
  };
});
