import type { Role } from "@/lib/api/types";

/**
 * Mirrors of the backend's role rules, used only to avoid requests and
 * controls the user can't use. The backend enforces every rule regardless.
 */

/** GET /farms/:farmId/collar-assignments/** is OWNER-only. */
export function canViewCollarAssignments(role: Role | null): boolean {
  return role === "OWNER";
}

/** GET /memberships returns every member only for farms the caller owns. */
export function canSeeAllMembers(role: Role | null): boolean {
  return role === "OWNER";
}
