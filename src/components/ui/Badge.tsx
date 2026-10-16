import type { ReactNode } from "react";
import type { Tone } from "@/lib/status";
import { Icon } from "./Icon";

interface BadgeProps {
  tone: Tone;
  /** Leading Phosphor icon. */
  icon?: string;
  iconWeight?: "regular" | "fill";
  /** Leading status dot (used instead of an icon). */
  dot?: boolean;
  children: ReactNode;
}

/** Rounded status pill. */
export function Badge({ tone, icon, iconWeight, dot, children }: BadgeProps) {
  return (
    <span className={`badge b-${tone}`}>
      {dot && <StatusDot tone={tone} />}
      {icon && <Icon name={icon} weight={iconWeight} />}
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={`sdot d-${tone}`} />;
}
