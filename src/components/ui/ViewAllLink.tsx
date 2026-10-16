import Link from "next/link";
import type { ReactNode } from "react";

/** The small rose "View all" link in a card header. */
export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="viewall">
      {children}
    </Link>
  );
}
