import { describe, expect, it } from "vitest";
import { roleOn } from "./auth/AuthProvider";
import { canSeeAllMembers, canViewCollarAssignments } from "./permissions";
import type { Membership } from "./api/types";

const membership = (over: Partial<Membership>): Membership => ({
  id: "m",
  userId: "u1",
  farmId: "f1",
  role: "WORKER",
  status: "ACTIVE",
  createdAt: "",
  updatedAt: "",
  ...over,
});

describe("role-based UI rules", () => {
  it("shows collar assignments and the full member list only to owners", () => {
    expect(canViewCollarAssignments("OWNER")).toBe(true);
    expect(canViewCollarAssignments("WORKER")).toBe(false);
    expect(canViewCollarAssignments("VETERINARIAN")).toBe(false);
    expect(canViewCollarAssignments(null)).toBe(false);
    expect(canSeeAllMembers("OWNER")).toBe(true);
    expect(canSeeAllMembers("VETERINARIAN")).toBe(false);
  });

  it("resolves the caller's ACTIVE role on the current farm", () => {
    const list = [
      membership({ farmId: "f1", role: "OWNER" }),
      membership({ farmId: "f2", role: "VETERINARIAN" }),
      membership({ farmId: "f3", role: "OWNER", status: "INACTIVE" }),
      membership({ farmId: "f1", userId: "someone-else", role: "WORKER" }),
    ];
    expect(roleOn(list, "u1", "f1")).toBe("OWNER");
    expect(roleOn(list, "u1", "f2")).toBe("VETERINARIAN");
    expect(roleOn(list, "u1", "f3")).toBeNull();
  });
});
