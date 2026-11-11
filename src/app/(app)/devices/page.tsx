import type { Metadata } from "next";
import { DevicesView } from "@/components/devices/DevicesView";

export const metadata: Metadata = { title: "Collars" };

export default function DevicesPage() {
  return <DevicesView />;
}
