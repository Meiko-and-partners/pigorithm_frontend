import type { Metadata } from "next";
import { DataNote } from "@/components/pigs/PigBits";
import { SettingsPanels } from "@/components/settings/SettingsPanels";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" sub="Alert thresholds, notifications and platform preferences" />
      <DataNote>Settings can&apos;t be viewed or saved yet: the API has no settings endpoints.</DataNote>
      <SettingsPanels />
    </>
  );
}
