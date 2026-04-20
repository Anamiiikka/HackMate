export const BASE_URL = "/api/v1";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
  /** Internal: used to prevent refresh recursion. */
  _isRetry?: boolean;
}

// ── token helpers ────────────────────────────────────────
const readToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const readRefreshToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;

const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const here = window.location.pathname + window.location.search;
  // Avoid a redirect loop if we're already on /login.
  if (window.location.pathname.startsWith("/login")) return;
  const next = here && here !== "/" ? `?next=${encodeURIComponent(here)}` : "";
  window.location.replace(`/login${next}`);
};

// ── refresh: single-flight ────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  const refresh_token = readRefreshToken();
  if (!refresh_token) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken: string | undefined = data?.access_token;
      if (!newToken) return null;
      localStorage.setItem("access_token", newToken);
      return newToken;
    } catch {
      return null;
    } finally {
      // Drop the cached promise on next tick so fresh refreshes can happen later.
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

// ── core fetch ────────────────────────────────────────────
export const apiFetch = async (
  endpoint: string,
  options: FetchOptions = {},
): Promise<any> => {
  const { requireAuth = false, _isRetry = false, ...customOptions } = options;
  const headers = new Headers(customOptions.headers);

  if (!headers.has("Content-Type") && !(customOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (requireAuth) {
    const token = readToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // No access token — try to refresh silently, otherwise bounce to login.
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
      } else {
        clearAuth();
        redirectToLogin();
        throw new Error("Authentication required. Please log in again.");
      }
    }
  }

  const url = `${BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, { ...customOptions, headers });
  } catch (networkErr) {
    console.error("❌ Network error:", networkErr, "URL:", url);
    throw networkErr;
  }

  if (response.ok) return response.json();

  // Try to parse an error body once.
  const rawText = await response.text().catch(() => "");
  let errorData: any = {};
  try {
    errorData = rawText ? JSON.parse(rawText) : {};
  } catch {
    // non-JSON
  }

  // ── auto-refresh on expired access token ────────────────
  const isExpired =
    response.status === 401 &&
    typeof errorData?.error === "string" &&
    /expired/i.test(errorData.error);

  if (requireAuth && isExpired && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry once with the new token.
      return apiFetch(endpoint, { ...options, _isRetry: true });
    }
    // Refresh failed — nuke session and send user to login.
    clearAuth();
    redirectToLogin();
    throw new Error("Your session expired. Please sign in again.");
  }

  // Other 401s → clear session but don't auto-redirect for non-auth endpoints.
  if (response.status === 401) {
    clearAuth();
    if (requireAuth) redirectToLogin();
  }

  const message =
    errorData.error ||
    `Request failed with status ${response.status}. Raw: ${rawText.substring(0, 80)}`;
  console.error("❌ API Error:", message, "URL:", url);
  throw new Error(message);
};

// Helper object for common HTTP methods
export const api = {
  get: (endpoint: string, options: FetchOptions = {}) =>
    apiFetch(endpoint, { ...options, method: "GET", requireAuth: true }),

  post: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),

  patch: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),

  delete: (endpoint: string, options: FetchOptions = {}) =>
    apiFetch(endpoint, { ...options, method: "DELETE", requireAuth: true }),

  put: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),
};
