import type { Metadata } from "next";
import { PigProfileView } from "@/components/pigs/PigProfileView";

export const metadata: Metadata = { title: "Pig profile" };

export default async function PigProfilePage({ params }: PageProps<"/pigs/[id]">) {
  const { id } = await params;
  return <PigProfileView pigId={id} />;
}
