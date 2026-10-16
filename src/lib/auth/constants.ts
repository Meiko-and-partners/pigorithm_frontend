/**
 * Session cookies set by the `/api/auth/*` route handlers.
 *
 * - REFRESH_COOKIE holds the backend refresh token. It is httpOnly (no script
 *   can read it) and scoped to `/api/auth`, so the browser sends it only to
 *   the auth route handlers, never to pages or to the backend.
 * - SESSION_HINT_COOKIE holds no secret ("1"). It lets the route proxy and the
 *   client know a session probably exists; the backend still decides.
 */
export const REFRESH_COOKIE = "pigorithm_rt";
export const SESSION_HINT_COOKIE = "pigorithm_session";

/** Matches the backend's refresh-token lifetime (7 days, renewed on rotation). */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Pages that require a signed-in user. */
export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/analytics",
  "/pigs",
  "/devices",
  "/gateways",
  "/alerts",
  "/medical",
  "/users",
  "/settings",
  "/onboarding",
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Only same-app relative paths are allowed as post-login redirects. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  return isProtectedPath(next.split(/[?#]/)[0]) ? next : null;
}
