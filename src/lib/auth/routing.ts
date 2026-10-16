import { safeNextPath } from "./constants";

/** What the guard knows about the session. */
export type SessionSnapshot =
  | { status: "loading" }
  | { status: "error" }
  | { status: "unauthenticated"; expired?: boolean }
  | { status: "authenticated"; farmCount: number };

/** Which kind of page is being guarded. */
export type PageArea = "auth" | "onboarding" | "app";

/**
 * Where a page should send the user, or null to render it.
 *
 * - App pages need a session and at least one farm.
 * - Onboarding needs a session and no farm yet.
 * - Login and registration are for signed-out users.
 */
export function redirectFor(
  session: SessionSnapshot,
  area: PageArea,
  currentPath: string,
  next?: string | null,
): string | null {
  if (session.status === "loading" || session.status === "error") return null;

  if (session.status === "unauthenticated") {
    if (area === "auth") return null;
    const params = new URLSearchParams({ next: currentPath });
    if (session.expired) params.set("expired", "1");
    return `/login?${params.toString()}`;
  }

  const hasFarm = session.farmCount > 0;
  if (area === "app") return hasFarm ? null : "/onboarding";
  if (area === "onboarding") return hasFarm ? "/dashboard" : null;
  // Signed in on login/register: continue to the app.
  if (!hasFarm) return "/onboarding";
  return safeNextPath(next) ?? "/dashboard";
}
