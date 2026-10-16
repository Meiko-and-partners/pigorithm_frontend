"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable, Unavailable } from "@/components/ui/DataState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { ViewAllLink } from "@/components/ui/ViewAllLink";
import { useCollars, useGateways, usePigs } from "@/lib/api/useFarmData";
import { useFarmContext } from "@/lib/auth/AuthProvider";
import { formatCount, formatLongDate, formatRelative, percent } from "@/lib/format";
import { DEVICE_STATUS } from "@/lib/status";

export function DashboardView() {
  const { farm } = useFarmContext();
  const pigs = usePigs();
  const collars = useCollars();
  const gateways = useGateways();

  const activePigs = pigs.status === "success" ? pigs.data.filter((p) => p.status === "ACTIVE") : [];
  const activeCollars =
    collars.status === "success" ? collars.data.filter((c) => c.status === "ACTIVE").length : null;

  const summary =
    gateways.status === "success" && activeCollars !== null
      ? ` — ${gateways.data.length} ${gateways.data.length === 1 ? "gateway" : "gateways"}, ${formatCount(activeCollars)} active collars`
      : "";

  return (
    <>
      <PageHeader
        title="Farm Overview"
        sub={`${formatLongDate(new Date())} · ${farm.name}${summary}`}
        actions={
          <>
            <Button icon="export" disabled title="Export isn't available yet">
              Export
            </Button>
            <Button variant="primary" icon="plus" disabled title="Adding pigs from the dashboard isn't available yet">
              Add pig
            </Button>
          </>
        }
      />

      <div className="statgrid">
        <StatCard
          label="Pigs monitored"
          value={pigs.status === "success" ? formatCount(activePigs.length) : <NotAvailable label="Loading" />}
          icon="scan"
          tint="t-rose"
          footer={
            <span className="muted">
              {pigs.status === "success"
                ? `${formatCount(pigs.data.length)} on record`
                : pigs.status === "error"
                  ? "Couldn't load pigs"
                  : "Loading…"}
            </span>
          }
        />
        <StatCard label="Need attention" value={<NotAvailable />} icon="first-aid-kit" tint="t-warn" footer={<span className="muted">Needs pig health data</span>} />
        <StatCard label="Active alerts" value={<NotAvailable />} icon="warning" tint="t-err" footer={<span className="muted">Alerts aren&apos;t available yet</span>} />
        <StatCard label="Avg activity index" value={<NotAvailable />} icon="pulse" tint="t-info" footer={<span className="muted">Needs telemetry data</span>} />
      </div>

      <div className="grid3">
        <Card>
          <CardHeader title="Herd Health" sub={pigs.status === "success" ? `${formatCount(activePigs.length)} pigs monitored` : undefined} />
          <Unavailable title="Health status isn't available yet" text="The API doesn't provide per-pig health status (healthy, monitor, alert)." />
        </Card>
        <Card>
          <CardHeader title="Herd Activity Index" sub="Last 7 days · mobility & feeding" />
          <Unavailable title="Activity data isn't available yet" text="The API stores collar telemetry but doesn't provide a way to read it." />
        </Card>
        <Card>
          <CardHeader title="Active Alerts" action={<ViewAllLink href="/alerts">View all</ViewAllLink>} />
          <Unavailable title="Alerts aren't available yet" text="The API has no alerts endpoint." />
        </Card>
      </div>

      <div className="grid2">
        <Card>
          <CardHeader title="Pigs needing attention" action={<ViewAllLink href="/pigs">All pigs</ViewAllLink>} />
          <Unavailable title="Needs health data" text="Pigs can be flagged here once the API provides health status." />
        </Card>

        <Card>
          <CardHeader title="Barn Connectivity" action={<ViewAllLink href="/gateways">Gateways</ViewAllLink>} />
          {gateways.status === "loading" || collars.status === "loading" ? (
            <LoadingRows rows={3} />
          ) : gateways.status === "error" ? (
            <ErrorState error={gateways.error} onRetry={gateways.reload} />
          ) : collars.status === "error" ? (
            <ErrorState error={collars.error} onRetry={collars.reload} />
          ) : gateways.data.length === 0 ? (
            <EmptyState icon="wifi-high" title="No gateways yet" text="Gateways appear here once they register with the farm's API key." />
          ) : (
            gateways.data.map((g) => {
              const meta = DEVICE_STATUS[g.status];
              const own = collars.data.filter((c) => c.gatewayId === g.id);
              const online = own.filter((c) => c.status === "ACTIVE").length;
              return (
                <div key={g.id} className="border-b border-line2 py-3">
                  <div className="mb-[9px] flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mono truncate text-[13.5px] font-semibold">{g.gatewayCode}</div>
                      <div className="text-xs text-muted">Last seen {formatRelative(g.lastSeenAt)}</div>
                    </div>
                    <Badge tone={meta.tone} dot>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      percent={percent(online, own.length)}
                      color={`var(--${meta.tone === "mut" ? "muted2" : meta.tone})`}
                      label={`${g.gatewayCode}: active collars`}
                    />
                    <div className="mono whitespace-nowrap text-[12.5px] text-muted">
                      {online}/{own.length} collars
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </>
  );
}
