import type { NextRequest } from "next/server";
import type { AuthTokensResponse } from "@/lib/api/types";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import {
  assertSameOrigin,
  backendPost,
  clearSessionCookies,
  errorJson,
  relayError,
  sessionResponse,
  unreachable,
} from "@/lib/auth/server";

const PATH = "/api/auth/refresh";

/**
 * Rotates the session through POST /auth/refresh using the httpOnly refresh
 * cookie, and returns a new access token.
 */
export async function POST(request: NextRequest) {
  const rejected = assertSameOrigin(request);
  if (rejected) return rejected;

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return clearSessionCookies(errorJson(401, "Not signed in", PATH));
  }

  let response: Response;
  try {
    response = await backendPost(request, "/auth/refresh", { refreshToken });
  } catch (error) {
    // Transient: keep the cookie so the session survives an outage.
    return unreachable(PATH, error);
  }
  if (response.status === 401 || response.status === 400) {
    // The session was revoked, expired or rotated away: it can't be resumed.
    return clearSessionCookies(await relayError(response, PATH));
  }
  if (!response.ok) return relayError(response, PATH);
  return sessionResponse((await response.json()) as AuthTokensResponse);
}
