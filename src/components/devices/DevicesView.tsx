"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable } from "@/components/ui/DataState";
import { DetailRow } from "@/components/ui/DetailRow";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useCollars, useGateways } from "@/lib/api/useFarmData";
import { formatCount, formatDate, percent } from "@/lib/format";
import { DEVICE_STATUS } from "@/lib/status";

export function DevicesView() {
  const collars = useCollars();
  const gateways = useGateways();

  const list = collars.status === "success" ? collars.data : [];
  const active = list.filter((c) => c.status === "ACTIVE").length;
  const offline = list.filter((c) => c.status === "OFFLINE").length;
  const loaded = collars.status === "success";
  const gatewayCode = (id: string) =>
    gateways.status === "success" ? gateways.data.find((g) => g.id === id)?.gatewayCode : undefined;

  return (
    <>
      <PageHeader
        title="Devices"
        sub="Smart collars registered on this farm"
        actions={
          <Button icon="arrows-clockwise" onClick={() => { collars.reload(); gateways.reload(); }}>
            Refresh
          </Button>
        }
      />

      <div className="statgrid">
        <StatCard
          label="Collars active"
          value={
            loaded ? (
              <>
                {formatCount(active)}
                <span className="text-base font-medium text-muted">/{formatCount(list.length)}</span>
              </>
            ) : (
              <NotAvailable label="Loading" />
            )
          }
          icon="broadcast"
          tint="t-ok"
          footer={<span className="muted">{loaded ? `${percent(active, list.length)}% active` : "Loading…"}</span>}
        />
        <StatCard label="Avg battery" value={<NotAvailable />} icon="battery-medium" tint="t-info" footer={<span className="muted">Needs telemetry data</span>} />
        <StatCard label="Firmware current" value={<NotAvailable />} icon="arrow-square-up" tint="t-rose" footer={<span className="muted">No firmware release data</span>} />
        <StatCard
          label="Offline collars"
          value={loaded ? formatCount(offline) : <NotAvailable label="Loading" />}
          icon="warning"
          tint="t-warn"
          footer={<span className="muted">Status reported by the API</span>}
        />
      </div>

      {collars.status === "loading" ? (
        <Card>
          <LoadingRows rows={4} />
        </Card>
      ) : collars.status === "error" ? (
        <Card>
          <ErrorState error={collars.error} onRetry={collars.reload} />
        </Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon="cpu" title="No collars yet" text="Collars are registered automatically when a gateway first syncs their data." />
        </Card>
      ) : (
        <div className="devgrid">
          {list.map((c) => {
            const meta = DEVICE_STATUS[c.status];
            return (
              <div className="devcard card" key={c.id}>
                <div className="devhead">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="staticon t-rose size-10 text-xl">
                      <Icon name="cpu" />
                    </div>
                    <div className="min-w-0">
                      <div className="mono truncate font-semibold">{c.collarCode}</div>
                      <div className="muted truncate text-xs">
                        {c.serialNumber ? `S/N ${c.serialNumber}` : "No serial number"}
                      </div>
                    </div>
                  </div>
                  <Badge tone={meta.tone} dot>
                    {meta.label}
                  </Badge>
                </div>
                <DetailRow label="Battery">
                  <NotAvailable label="Needs telemetry data" />
                </DetailRow>
                <DetailRow label="Gateway">
                  <span className="mono font-semibold">{gatewayCode(c.gatewayId) ?? "—"}</span>
                </DetailRow>
                <DetailRow label="Firmware">
                  <span className="mono font-semibold">{c.firmwareVersion ?? "—"}</span>
                </DetailRow>
                <DetailRow label="Registered">
                  <span className="mono font-semibold">{formatDate(c.createdAt)}</span>
                </DetailRow>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
