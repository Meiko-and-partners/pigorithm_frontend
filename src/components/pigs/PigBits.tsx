import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import type { PigStatus } from "@/lib/api/types";
import { PIG_STATUS } from "@/lib/status";
import type { ReactNode } from "react";

/** Pig record status (Active / Sold / Deceased). */
export function PigStatusBadge({ status }: { status: PigStatus }) {
  const meta = PIG_STATUS[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}

export function pigHref(id: string): string {
  return `/pigs/${id}`;
}

/** One muted line explaining why some values show as "—". */
export function DataNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2 text-[12.5px] text-muted">
      <Icon name="info" className="mt-px text-[15px]" />
      <span>{children}</span>
    </div>
  );
}
