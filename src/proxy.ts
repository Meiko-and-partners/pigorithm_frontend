import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath, SESSION_HINT_COOKIE } from "@/lib/auth/constants";

/**
 * Sends visitors without a session cookie to the login page before any
 * protected page renders. This is a convenience check only: the session itself
 * is validated by the backend on every API call.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();
  if (request.cookies.get(SESSION_HINT_COOKIE)?.value === "1") return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/pigs/:path*",
    "/devices/:path*",
    "/gateways/:path*",
    "/alerts/:path*",
    "/medical/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
