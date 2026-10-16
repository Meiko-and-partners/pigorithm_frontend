/** Maps backend enums to the design's badge tones, icons and labels. */
import type {
  CollarStatus,
  GatewayStatus,
  MembershipStatus,
  PigSex,
  PigStatus,
  Role,
} from "@/lib/api/types";

/** Status colour family used by badges, dots and icon tints. */
export type Tone = "ok" | "warn" | "err" | "info" | "mut";

interface StatusMeta {
  tone: Tone;
  label: string;
  icon: string;
}

/** Pig record status (not health — the backend doesn't expose health yet). */
export const PIG_STATUS: Record<PigStatus, StatusMeta> = {
  ACTIVE: { tone: "ok", label: "Active", icon: "check-circle" },
  SOLD: { tone: "mut", label: "Sold", icon: "tag" },
  DECEASED: { tone: "mut", label: "Deceased", icon: "x-circle" },
};

/** Collar and gateway status share the same values. */
export const DEVICE_STATUS: Record<CollarStatus | GatewayStatus, StatusMeta> = {
  ACTIVE: { tone: "ok", label: "Active", icon: "check-circle" },
  OFFLINE: { tone: "err", label: "Offline", icon: "wifi-slash" },
  INACTIVE: { tone: "mut", label: "Inactive", icon: "minus-circle" },
};

export const MEMBERSHIP_STATUS: Record<MembershipStatus, StatusMeta> = {
  ACTIVE: { tone: "ok", label: "Active", icon: "check-circle" },
  INACTIVE: { tone: "mut", label: "Inactive", icon: "minus-circle" },
};

/** Role names as the design writes them. */
export const ROLE_LABEL: Record<Role, string> = {
  OWNER: "Farm Owner",
  WORKER: "Farm Worker",
  VETERINARIAN: "Veterinarian",
};

export const SEX_LABEL: Record<PigSex, string> = { MALE: "Male", FEMALE: "Female" };

export function initials(firstName: string, lastName: string): string {
  return `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase() || "?";
}
