"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TableCard } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable } from "@/components/ui/DataState";
import { LinkRow } from "@/components/ui/LinkRow";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PigStatus } from "@/lib/api/types";
import { usePigs } from "@/lib/api/useFarmData";
import { useFarmContext } from "@/lib/auth/AuthProvider";
import { formatCount, formatRelative } from "@/lib/format";
import { DataNote, PigStatusBadge, pigHref } from "./PigBits";

const FILTERS: { key: string; label: string; status?: PigStatus }[] = [
  { key: "all", label: "All pigs" },
  { key: "active", label: "Active", status: "ACTIVE" },
  { key: "sold", label: "Sold", status: "SOLD" },
  { key: "deceased", label: "Deceased", status: "DECEASED" },
];

const NO_TELEMETRY = "Not available: the API doesn't provide telemetry readings yet";

export function PigsView() {
  const { farm } = useFarmContext();
  const pigs = usePigs();
  const searchParams = useSearchParams();
  const active = FILTERS.find((f) => f.key === searchParams.get("status")) ?? FILTERS[0];

  const all = pigs.status === "success" ? pigs.data : [];
  const shown = all.filter((p) => !active.status || p.status === active.status);
  const count = (f: (typeof FILTERS)[number]) =>
    f.status ? all.filter((p) => p.status === f.status).length : all.length;

  return (
    <>
      <PageHeader
        title="Pigs"
        sub={
          pigs.status === "success"
            ? `${formatCount(count(FILTERS[1]))} active on ${farm.name}`
            : farm.name
        }
        actions={
          <Button variant="primary" icon="plus" disabled title="Adding pigs isn't available in the web app yet">
            Add pig
          </Button>
        }
      />

      <div className="chiprow" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/pigs" : `/pigs?status=${f.key}`}
            className={`chip${f === active ? " on" : ""}`}
            aria-current={f === active ? "true" : undefined}
            scroll={false}
          >
            {f.label}
            {pigs.status === "success" && <span className="chipnum">{formatCount(count(f))}</span>}
          </Link>
        ))}
      </div>

      <DataNote>
        Temperature, heart rate and activity need a telemetry read API, and pens aren&apos;t
        tracked yet, so those columns show “—”.
      </DataNote>

      <TableCard>
        {pigs.status === "loading" ? (
          <div className="p-3">
            <LoadingRows rows={6} />
          </div>
        ) : pigs.status === "error" ? (
          <ErrorState error={pigs.error} onRetry={pigs.reload} />
        ) : shown.length === 0 ? (
          <EmptyState
            icon="scan"
            title={all.length === 0 ? "No pigs yet" : `No ${active.label.toLowerCase()} pigs`}
            text={
              all.length === 0
                ? "Pigs are registered automatically when a gateway syncs collar data for them."
                : undefined
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Pig ID</th>
                <th>Breed</th>
                <th>Pen</th>
                <th>Weight</th>
                <th>Temp</th>
                <th>Heart rate</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <LinkRow key={p.id} href={pigHref(p.id)} label={`Open ${p.pigTag}`}>
                  <td>
                    <div className="pigid">{p.pigTag}</div>
                    {p.name && <div className="muted text-xs">{p.name}</div>}
                  </td>
                  <td>{p.breed ?? <NotAvailable label="Breed not set" />}</td>
                  <td>
                    <NotAvailable label="Pens aren't tracked yet" />
                  </td>
                  <td className="mono whitespace-nowrap">
                    {p.weight !== null ? `${p.weight.toFixed(1)} kg` : <NotAvailable label="Weight not set" />}
                  </td>
                  <td><NotAvailable label={NO_TELEMETRY} /></td>
                  <td><NotAvailable label={NO_TELEMETRY} /></td>
                  <td><NotAvailable label={NO_TELEMETRY} /></td>
                  <td>
                    <PigStatusBadge status={p.status} />
                  </td>
                  <td className="muted whitespace-nowrap text-[12.5px]">{formatRelative(p.updatedAt)}</td>
                </LinkRow>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </>
  );
}
