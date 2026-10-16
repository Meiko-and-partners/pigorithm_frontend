"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { Unavailable } from "@/components/ui/DataState";
import { PageHeader } from "@/components/ui/PageHeader";

const NO_TELEMETRY = "The API stores collar telemetry but doesn't provide a way to read it.";

/** Keeps the design's chart layout; every chart needs telemetry or alert APIs. */
export function AnalyticsView() {
  return (
    <>
      <PageHeader
        title="Analytics"
        sub="Behaviour, health and telemetry trends"
        actions={<ChipGroup options={["7d", "30d", "90d"] as const} defaultValue="30d" label="Time range" className="m-0" />}
      />
      <div className="grid2">
        <Card>
          <CardHeader title="Herd activity index" sub="Mobility & feeding average" />
          <Unavailable title="Activity data isn't available yet" text={NO_TELEMETRY} />
        </Card>
        <Card>
          <CardHeader title="Average body temperature" sub="Herd mean (°C)" />
          <Unavailable title="Temperature data isn't available yet" text={NO_TELEMETRY} />
        </Card>
      </div>
      <div className="grid2">
        <Card>
          <CardHeader title="Activity index by gateway" sub="Higher is better · index of 100" />
          <Unavailable title="Activity data isn't available yet" text={NO_TELEMETRY} />
        </Card>
        <Card>
          <CardHeader title="Alerts by type · last 30 days" />
          <Unavailable title="Alerts aren't available yet" text="The API has no alerts endpoint." />
        </Card>
      </div>
    </>
  );
}
