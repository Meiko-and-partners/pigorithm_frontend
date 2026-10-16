import type { ReactNode } from "react";

/** Label / value row used on device, gateway and collar cards. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="devrow">
      <span className="muted">{label}</span>
      {children}
    </div>
  );
}
