"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface LinkRowProps {
  href: string;
  label: string;
  children: ReactNode;
}

/** A table row that opens `href` on click or Enter. */
export function LinkRow({ href, label, children }: LinkRowProps) {
  const router = useRouter();
  return (
    <tr
      className="clickable"
      tabIndex={0}
      aria-label={label}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
    >
      {children}
    </tr>
  );
}
