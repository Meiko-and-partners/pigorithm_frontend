import type { Metadata } from "next";
import { PigsView } from "@/components/pigs/PigsView";

export const metadata: Metadata = { title: "Pigs" };

export default function PigsPage() {
  return <PigsView />;
}
