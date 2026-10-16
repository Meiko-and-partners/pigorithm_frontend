import { createApiClient } from "@/lib/api/client";
import { ApiError, errorFromResponse } from "@/lib/api/errors";
import type { LoginRequest } from "@/lib/api/types";
import { SESSION_HINT_COOKIE } from "./constants";

/**
 * Browser-side session state. The access token lives only in memory (lost on
 * reload, then restored from the httpOnly refresh cookie via
 * `/api/auth/refresh`). Nothing sensitive is written to localStorage.
 */

export const SESSION_EXPIRED_EVENT = "pigorithm:session-expired";

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

/** True when the non-secret session hint cookie is present. */
export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_HINT_COOKIE}=1`));
}

async function postAuth(path: string, body?: unknown): Promise<Response> {
  try {
    return await fetch(path, {
      method: "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("network", 0, []);
  }
}

async function doRefresh(): Promise<string | null> {
  const response = await postAuth("/api/auth/refresh");
  if (response.status === 401 || response.status === 400) {
    accessToken = null;
    return null;
  }
  if (!response.ok) throw await errorFromResponse(response);
  const { accessToken: token } = (await response.json()) as { accessToken: string };
  accessToken = token;
  return token;
}

/**
 * Exchanges the refresh cookie for a new access token, or returns null when
 * there is no valid session. Concurrent calls share one request, and the Web
 * Locks API serialises refreshes across tabs: the backend rotates the refresh
 * token on every use, so two tabs refreshing at once would invalidate each
 * other.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= (async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.locks) {
        return await navigator.locks.request("pigorithm-refresh", doRefresh);
      }
      return await doRefresh();
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Signs in; throws ApiError (e.g. 401 "Invalid credentials") on failure. */
export async function login(credentials: LoginRequest): Promise<void> {
  const response = await postAuth("/api/auth/login", credentials);
  if (!response.ok) throw await errorFromResponse(response);
  const { accessToken: token } = (await response.json()) as { accessToken: string };
  accessToken = token;
}

/** Revokes the session on the backend and clears the cookies. */
export async function logout(): Promise<void> {
  accessToken = null;
  try {
    await postAuth("/api/auth/logout");
  } catch {
    // Cookies are cleared server-side when reachable; nothing else to do.
  }
}

function notifyExpired(): void {
  accessToken = null;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

/** The app-wide client for authenticated backend calls. */
export const api = createApiClient({
  getAccessToken,
  refreshAccessToken,
  onUnauthorized: notifyExpired,
});
