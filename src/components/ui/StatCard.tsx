import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  /** Icon tile tint class: `t-rose`, `t-ok`, `t-warn`, `t-err` or `t-info`. */
  tint: string;
  footer: ReactNode;
}

/** KPI card: label and icon tile, large value, footer line. */
export function StatCard({ label, value, icon, tint, footer }: StatCardProps) {
  return (
    <div className="stat card">
      <div className="flex items-center justify-between">
        <div className="statlabel">{label}</div>
        <div className={`staticon ${tint}`}>
          <Icon name={icon} />
        </div>
      </div>
      <div className="statval">{value}</div>
      <div className="statfoot">{footer}</div>
    </div>
  );
}

/** The design's "+4.2% vs last week" style footer. */
export function Delta({
  up,
  icon,
  children,
}: {
  up: boolean;
  icon: string;
  children: ReactNode;
}) {
  return (
    <span className={`delta ${up ? "delta-up" : "delta-down"}`}>
      <Icon name={icon} />
      {children}
    </span>
  );
}
