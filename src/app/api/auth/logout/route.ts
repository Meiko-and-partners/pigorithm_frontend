import { NextResponse, type NextRequest } from "next/server";
import type { AuthTokensResponse } from "@/lib/api/types";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { assertSameOrigin, backendPost, clearSessionCookies } from "@/lib/auth/server";

/**
 * Ends the session: revokes it on the backend (POST /auth/logout) and clears
 * the session cookies. The backend's logout needs an access token, so one is
 * obtained from the refresh cookie first. Cookies are cleared even when the
 * backend can't be reached.
 */
export async function POST(request: NextRequest) {
  const rejected = assertSameOrigin(request);
  if (rejected) return rejected;

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const refreshed = await backendPost(request, "/auth/refresh", { refreshToken });
      if (refreshed.ok) {
        const { accessToken } = (await refreshed.json()) as AuthTokensResponse;
        await backendPost(request, "/auth/logout", undefined, accessToken);
      }
    } catch {
      // Best effort: the session expires on its own if revocation failed.
    }
  }
  return clearSessionCookies(new NextResponse(null, { status: 204 }));
}
