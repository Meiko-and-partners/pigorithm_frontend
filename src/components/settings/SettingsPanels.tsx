"use client";

import { Badge } from "@/components/ui/Badge";

interface SettingDef {
  title: string;
  sub: string;
}

const ALERT_THRESHOLDS: SettingDef[] = [
  { title: "Fever alert", sub: "Trigger a critical alert when body temperature exceeds a threshold." },
  { title: "Low activity alert", sub: "Flag pigs whose mobility drops well below their baseline." },
  { title: "Feeding anomaly alert", sub: "Notify when a pig misses feed cycles." },
  { title: "Predictive AI warnings", sub: "Surface early-warning signals before thresholds are breached." },
];

const NOTIFICATIONS: SettingDef[] = [
  { title: "Critical alerts", sub: "Push notifications for critical health events." },
  { title: "Daily herd summary", sub: "Email digest of farm health." },
  { title: "Device & connectivity", sub: "Alerts when collars go offline or batteries run low." },
  { title: "Veterinary updates", sub: "Notify when a vet updates a medical case." },
];

/**
 * The design's settings, shown without switches: the API has no settings
 * endpoints, so any on/off state shown here would not be real.
 */
export function SettingsPanels() {
  return (
    <div className="grid2">
      <SettingsCard title="Alert thresholds" defs={ALERT_THRESHOLDS} />
      <SettingsCard title="Notifications" defs={NOTIFICATIONS} />
    </div>
  );
}

function SettingsCard({ title, defs }: { title: string; defs: SettingDef[] }) {
  return (
    <div className="card">
      <h2 className="sectitle">{title}</h2>
      {defs.map((d) => (
        <div className="setrow" key={d.title}>
          <div>
            <div className="settitle">{d.title}</div>
            <div className="setsub">{d.sub}</div>
          </div>
          <Badge tone="mut">Not available</Badge>
        </div>
      ))}
    </div>
  );
}
