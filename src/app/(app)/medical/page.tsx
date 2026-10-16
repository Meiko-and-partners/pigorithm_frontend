import type { Metadata } from "next";
import { MedicalCasesView } from "@/components/operations/UnavailableViews";

export const metadata: Metadata = { title: "Medical Cases" };

export default function MedicalCasesPage() {
  return <MedicalCasesView />;
}
