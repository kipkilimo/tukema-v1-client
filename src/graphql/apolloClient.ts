// services/apolloClient.ts
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  type NormalizedCacheObject,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import type { ServerError, ServerParseError } from "@apollo/client/link/utils";

/* ============================================================
 * CONFIG
 * ============================================================ */

const apiUrl = import.meta.env.VITE_API_URL;

const AUTH_CONFIG = {
  loginPath: import.meta.env.VITE_LOGIN_PATH || "/auth/login",
  registerPath: import.meta.env.VITE_REGISTER_PATH || "/auth/register",
  storage: (import.meta.env.VITE_AUTH_STORAGE || "local") as
    "local" | "session" | "memory",
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 0),
  logLevel: (import.meta.env.VITE_AUTH_LOG_LEVEL ||
    (import.meta.env.DEV ? "debug" : "warn")) as LogLevel,
} as const;

/* ============================================================
 * LOGGER
 * ============================================================ */

type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

const LOG_RANK: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};
const rank = LOG_RANK[AUTH_CONFIG.logLevel];

const log = {
  error: (...a: unknown[]) =>
    rank >= LOG_RANK.error && console.error("[Auth]", ...a),
  warn: (...a: unknown[]) =>
    rank >= LOG_RANK.warn && console.warn("[Auth]", ...a),
  info: (...a: unknown[]) =>
    rank >= LOG_RANK.info && console.log("[Auth]", ...a),
  debug: (...a: unknown[]) =>
    rank >= LOG_RANK.debug && console.log("[Auth]", ...a),
};

/* ============================================================
 * STORAGE
 * ============================================================ */

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function memoryStorage(): StorageLike {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  };
}

function createStorage(): StorageLike {
  if (typeof window === "undefined") return memoryStorage();
  if (AUTH_CONFIG.storage === "session") return window.sessionStorage;
  if (AUTH_CONFIG.storage === "memory") return memoryStorage();
  return window.localStorage;
}

const storage = createStorage();

/* ============================================================
 * KEYS
 * ============================================================ */

const ACCESS_TOKEN_KEY = "accessToken";
const TOKEN_EXPIRY_KEY = "tokenExpiry";
const USER_KEY = "user-store";

/* ============================================================
 * GETTERS
 * ============================================================ */

export const getAccessToken = (): string | null =>
  storage.getItem(ACCESS_TOKEN_KEY);

export const getTokenExpiry = (): Date | null => {
  const raw = storage.getItem(TOKEN_EXPIRY_KEY);
  return raw ? new Date(raw) : null;
};

export const getUser = (): any => {
  try {
    const raw = storage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "user" in parsed) {
      return parsed.user ?? null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/* ============================================================
 * SETTERS
 * ============================================================ */

export const setAccessToken = (token: string): void => {
  storage.setItem(ACCESS_TOKEN_KEY, token);
  log.debug("Access token saved");
};

export const setTokenExpiry = (expiresAt: string | Date | number): void => {
  const iso =
    typeof expiresAt === "number"
      ? new Date(expiresAt).toISOString()
      : expiresAt instanceof Date
        ? expiresAt.toISOString()
        : expiresAt;
  storage.setItem(TOKEN_EXPIRY_KEY, iso);
  log.debug(`Expiry set: ${iso}`);
};

/**
 * Mirrors the GraphQL `AuthPayload`:
 *   { user, accessToken, expiresAt }
 *
 * No refresh token, no client-side arithmetic.
 */
export const setTokens = (auth: {
  accessToken: string;
  expiresAt: string | Date | number;
  user?: unknown;
}): void => {
  setAccessToken(auth.accessToken);
  setTokenExpiry(auth.expiresAt);
  if (auth.user) setUser(auth.user);
  log.info("Tokens saved");
};

export const setUser = (user: unknown): void => {
  storage.setItem(USER_KEY, JSON.stringify(user));
  log.debug("User saved");
};

/* ============================================================
 * REMOVERS
 * ============================================================ */

export const removeTokens = (): void => {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(TOKEN_EXPIRY_KEY);
  storage.removeItem(USER_KEY);
  log.warn("All auth data removed");
};

/* ============================================================
 * TOKEN VALIDATION
 * ============================================================ */

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    const buffer = 60;
    return payload.exp > now + buffer;
  } catch (err) {
    log.debug("Token validation failed:", err);
    return false;
  }
};

/**
 * True when there is a stored token AND it's valid AND not within the
 * expiry buffer. **Returns `false` when there is no token at all** —
 * the anonymous state is not "expired", it's just unauthenticated.
 *
 * This is the key fix: the previous version returned `true` for the
 * anonymous case, which triggered the error link to redirect
 * anonymous users to /auth/login on the first public query.
 */
export const isTokenExpired = (): boolean => {
  const token = getAccessToken();
  if (!token) return false; // ← was `true`; now anonymous stays anonymous

  if (!isTokenValid(token)) return true;

  const expiry = getTokenExpiry();
  if (!expiry) return true;

  const bufferMs = 5 * 60 * 1000;
  return expiry.getTime() - bufferMs < Date.now();
};

export const getTokenExpirySeconds = (): number => {
  const expiry = getTokenExpiry();
  if (!expiry) return 0;
  return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
};

/* ============================================================
 * REDIRECT
 * ============================================================ */

let isRedirecting = false;

const redirectToLogin = (): void => {
  if (typeof window === "undefined" || isRedirecting) return;
  const { pathname, search } = window.location;
  if (
    pathname.includes(AUTH_CONFIG.loginPath) ||
    pathname.includes(AUTH_CONFIG.registerPath)
  ) {
    return;
  }
  isRedirecting = true;
  const redirect = encodeURIComponent(pathname + search);
  window.location.href = `${AUTH_CONFIG.loginPath}?redirect=${redirect}`;
};

/* ============================================================
 * ENSURE-TOKEN — does NOT redirect anonymous users
 * ============================================================ */

/**
 * Ensures the current session is valid **if one exists**.
 * - No token → returns `null` (anonymous, do nothing)
 * - Token expired → clears + redirects (only if the token *was* there)
 * - Token valid → returns it
 *
 * Call this from the app shell, not on every request.
 */
export const ensureValidToken = async (): Promise<string | null> => {
  const token = getAccessToken();
  if (!token) {
    log.debug("No token — anonymous mode");
    return null;
  }
  if (isTokenExpired()) {
    log.debug("Token expired — clearing session");
    removeTokens();
    redirectToLogin();
    return null;
  }
  return token;
};

/* ============================================================
 * SESSION-FATAL CLASSIFICATION
 * ============================================================ */

const SESSION_FATAL_CODES = new Set<string>([
  "UNAUTHENTICATED",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
]);

interface GraphQLErrorLike {
  message?: string;
  extensions?: { code?: string } & Record<string, unknown>;
  path?: ReadonlyArray<string | number>;
}

function isSessionFatal(err: GraphQLErrorLike): boolean {
  const code = err.extensions?.code;
  if (typeof code === "string") return SESSION_FATAL_CODES.has(code);
  // Match the server's exact thrown messages
  return (
    err.message === "Not authenticated" ||
    err.message === "Unauthorized" ||
    /^UNAUTHENTICATED:/.test(err.message ?? "") ||
    /^FORBIDDEN:/.test(err.message ?? "")
  );
}

/* ============================================================
 * ERROR LINK
 * ============================================================ */

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  // Capture whether a token existed *when this request was made*.
  // If it didn't, an UNAUTHENTICATED response is expected (anonymous
  // user hitting a protected field) — do not redirect.
  const hadToken = !!getAccessToken();

  if (graphQLErrors?.length) {
    for (const err of graphQLErrors) {
      log.error(`[${operation?.operationName || "unknown"}]`, {
        message: err.message,
        path: err.path,
        code: err.extensions?.code,
      });

      if (isSessionFatal(err) && hadToken) {
        removeTokens();
        redirectToLogin();
        return;
      }
    }
  }

  if (networkError) {
    const ne = networkError as ServerError | ServerParseError;
    const status = "statusCode" in ne ? ne.statusCode : undefined;
    log.error("[network]", { message: ne.message, status });

    if (status === 401 && hadToken) {
      removeTokens();
      redirectToLogin();
      return;
    }
    if (status === 0) {
      log.warn("Network offline or CORS error");
    }
  }
});

/* ============================================================
 * AUTH LINK
 * ============================================================ */

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

/* ============================================================
 * HTTP LINK
 * ============================================================ */

const httpLink = new HttpLink({
  uri: `${apiUrl}/graphql`,
  credentials: "include",
  ...(AUTH_CONFIG.requestTimeoutMs > 0
    ? {
        fetchOptions: {
          signal: AbortSignal.timeout(AUTH_CONFIG.requestTimeoutMs),
        },
      }
    : {}),
});

/* ============================================================
 * CLIENT
 * ============================================================ */

export const apolloClient = new ApolloClient<NormalizedCacheObject>({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: { keyFields: ["id"] },
      Payment: { keyFields: ["id"] },
      VoucherBatch: { keyFields: ["id"] },
      Query: { keyFields: false },
      Mutation: { keyFields: false },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network", errorPolicy: "all" },
    query: { fetchPolicy: "network-only", errorPolicy: "all" },
    mutate: { errorPolicy: "all" },
  },
  queryDeduplication: true,
});

/* ============================================================
 * CACHE UTILITIES
 * ============================================================ */

export const resetApolloCache = async (): Promise<void> => {
  await apolloClient.resetStore();
  log.info("Apollo store reset");
};

export const clearApolloCache = async (): Promise<void> => {
  await apolloClient.clearStore();
  log.info("Apollo store cleared");
};

export const evictFromCache = (fieldName: string, id?: string): void => {
  const cache = apolloClient.cache;
  if (id) cache.evict({ id, fieldName });
  else cache.evict({ fieldName });
  cache.gc();
  log.debug(`Evicted: ${fieldName}${id ? ` (${id})` : ""}`);
};

export const clearAuthAndReset = async (): Promise<void> => {
  removeTokens();
  await resetApolloCache();
  log.info("Complete auth cleanup done");
};

/* ============================================================
 * EXPORTS
 * ============================================================ */

export const client = apolloClient;
export default apolloClient;
export type ApolloClientType = typeof apolloClient;

/* ============================================================
 * DEV HELPERS
 * ============================================================ */

if (import.meta.env.DEV) {
  (window as any).__APOLLO_CLIENT__ = apolloClient;
  (window as any).__AUTH__ = {
    getAccessToken,
    getTokenExpiry,
    getUser,
    isTokenValid,
    isTokenExpired,
    removeTokens,
    ensureValidToken,
    setTokens,
    config: AUTH_CONFIG,
  };
  log.info("Dev tools: window.__APOLLO_CLIENT__ / window.__AUTH__");
}
