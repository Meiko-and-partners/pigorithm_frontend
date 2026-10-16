import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found" sub="This record does not exist in the demo data." />
      <Link href="/dashboard" className="btn btn-ghost">
        Back to the dashboard
      </Link>
    </>
  );
}
