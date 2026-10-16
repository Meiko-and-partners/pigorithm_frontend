"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NotAvailable, Unavailable } from "@/components/ui/DataState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

const na = <NotAvailable />;
const foot = (text: string) => <span className="muted">{text}</span>;

/** Alerts keep the design's structure; the backend has no alerts endpoint yet. */
export function AlertsView() {
  return (
    <>
      <PageHeader
        title="Alerts"
        sub="Real-time anomalies detected across the herd"
        actions={
          <Button icon="check-circle" disabled title="Alerts aren't available yet">
            Acknowledge all
          </Button>
        }
      />
      <div className="statgrid">
        <StatCard label="Critical" value={na} icon="warning-octagon" tint="t-err" footer={foot("Immediate attention")} />
        <StatCard label="Warnings" value={na} icon="warning" tint="t-warn" footer={foot("Monitor closely")} />
        <StatCard label="Informational" value={na} icon="info" tint="t-info" footer={foot("Low priority")} />
        <StatCard label="Resolved today" value={na} icon="check" tint="t-ok" footer={foot("Auto + manual")} />
      </div>
      <Card>
        <Unavailable
          title="Alerts aren't available yet"
          text="The API doesn't generate or expose alerts. They'll appear here once an alerts endpoint exists."
        />
      </Card>
    </>
  );
}

/** Medical cases keep the design's structure; the backend has no cases endpoint yet. */
export function MedicalCasesView() {
  return (
    <>
      <PageHeader
        title="Medical Cases"
        sub="Veterinary workflows and treatment tracking"
        actions={
          <Button variant="primary" icon="plus" disabled title="Medical cases aren't available yet">
            New case
          </Button>
        }
      />
      <div className="statgrid">
        <StatCard label="Open cases" value={na} icon="folder-open" tint="t-rose" footer={foot("Across the farm")} />
        <StatCard label="In treatment" value={na} icon="pill" tint="t-info" footer={foot("Active protocols")} />
        <StatCard label="Under observation" value={na} icon="eye" tint="t-warn" footer={foot("Awaiting diagnosis")} />
        <StatCard label="Resolved (30d)" value={na} icon="check-circle" tint="t-ok" footer={foot("Recovery rate")} />
      </div>
      <Card>
        <Unavailable
          title="Medical cases aren't available yet"
          text="The API has no medical cases model or endpoint."
        />
      </Card>
    </>
  );
}
