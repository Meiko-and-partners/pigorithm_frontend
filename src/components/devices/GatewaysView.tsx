"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable } from "@/components/ui/DataState";
import { DetailRow } from "@/components/ui/DetailRow";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCollars, useGateways } from "@/lib/api/useFarmData";
import { formatRelative } from "@/lib/format";
import { DEVICE_STATUS } from "@/lib/status";

export function GatewaysView() {
  const gateways = useGateways();
  const collars = useCollars();

  const collarCount = (gatewayId: string) =>
    collars.status === "success"
      ? String(collars.data.filter((c) => c.gatewayId === gatewayId).length)
      : "—";

  return (
    <>
      <PageHeader
        title="Gateways"
        sub="Barn-level IoT hubs relaying collar telemetry"
        actions={
          <Button icon="plus" disabled title="Gateways register themselves using the farm's API key">
            Register gateway
          </Button>
        }
      />

      {gateways.status === "loading" ? (
        <Card>
          <LoadingRows rows={3} />
        </Card>
      ) : gateways.status === "error" ? (
        <Card>
          <ErrorState error={gateways.error} onRetry={gateways.reload} />
        </Card>
      ) : gateways.data.length === 0 ? (
        <Card>
          <EmptyState icon="wifi-high" title="No gateways yet" text="A gateway appears here after it registers with the farm's API key." />
        </Card>
      ) : (
        <div className="grid3">
          {gateways.data.map((g) => {
            const meta = DEVICE_STATUS[g.status];
            return (
              <Card key={g.id}>
                <div className="cardhead">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="staticon t-rose size-[42px] text-[21px]">
                      <Icon name="wifi-high" />
                    </div>
                    <div className="min-w-0">
                      <div className="mono truncate font-semibold">{g.gatewayCode}</div>
                      <div className="muted truncate text-[12.5px]">{g.gatewayId}</div>
                    </div>
                  </div>
                  <Badge tone={meta.tone} dot>
                    {meta.label}
                  </Badge>
                </div>
                <DetailRow label="Connected collars">
                  <span className="mono font-semibold">{collarCount(g.id)}</span>
                </DetailRow>
                <DetailRow label="Last seen">
                  <span className="mono font-semibold">{formatRelative(g.lastSeenAt)}</span>
                </DetailRow>
                <DetailRow label="Firmware">
                  <span className="mono font-semibold">{g.firmwareVersion ?? "—"}</span>
                </DetailRow>
                <DetailRow label="Uptime (30d)">
                  <NotAvailable label="Not tracked by the API yet" />
                </DetailRow>
                <DetailRow label="Packet loss">
                  <NotAvailable label="Not tracked by the API yet" />
                </DetailRow>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
