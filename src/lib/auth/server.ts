import { NextResponse, type NextRequest } from "next/server";
import { apiUrl } from "@/lib/api/config";
import type { ApiErrorBody, AuthTokensResponse } from "@/lib/api/types";
import { REFRESH_COOKIE, SESSION_HINT_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";

/**
 * Server-side helpers for the `/api/auth/*` route handlers, which keep the
 * backend refresh token in an httpOnly cookie and hand the browser only the
 * short-lived access token.
 */

const secure = process.env.NODE_ENV === "production";

export function errorJson(statusCode: number, message: string | string[], path: string) {
  const body: ApiErrorBody = { statusCode, timestamp: new Date().toISOString(), path, message };
  return NextResponse.json(body, { status: statusCode });
}

/**
 * Rejects cross-site POSTs. Browsers always send `Origin` on POST, so a
 * mismatch means another site is submitting to the auth routes.
 */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return errorJson(403, "Cross-origin request rejected", request.nextUrl.pathname);
  }
  return null;
}

/** Forwards a JSON POST to the backend, passing the browser's User-Agent for session metadata. */
export async function backendPost(
  request: NextRequest,
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers["User-Agent"] = userAgent;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(apiUrl(path), {
    method: "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
}

/** Relays a backend error response (status and envelope) to the browser. */
export async function relayError(response: Response, path: string): Promise<NextResponse> {
  if (response.status >= 500) {
    return errorJson(502, "The Pigorithm API had a problem. Please try again shortly.", path);
  }
  try {
    const body = (await response.json()) as ApiErrorBody;
    return NextResponse.json(body, { status: response.status });
  } catch {
    return errorJson(response.status, "Request failed", path);
  }
}

export function unreachable(path: string, error: unknown): NextResponse {
  if (error instanceof Error && error.name === "ApiConfigError") {
    return errorJson(500, error.message, path);
  }
  return errorJson(502, "Can't reach the Pigorithm API. Please try again shortly.", path);
}

/** Responds with the access token only, storing the refresh token in cookies. */
export function sessionResponse(tokens: AuthTokensResponse): NextResponse {
  const response = NextResponse.json({ accessToken: tokens.accessToken });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set(SESSION_HINT_COOKIE, "1", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, secure, sameSite: "strict", path: "/api/auth", maxAge: 0 });
  response.cookies.set(SESSION_HINT_COOKIE, "", { secure, sameSite: "lax", path: "/", maxAge: 0 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
