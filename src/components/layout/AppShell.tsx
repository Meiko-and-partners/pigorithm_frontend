"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Sidebar + top bar + scrolling content area. Below 1024px the sidebar becomes
 * a drawer opened from the top bar's menu button.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <div className={`shell${navOpen ? " navopen" : ""}`}>
      <Sidebar onClose={closeNav} />
      <button
        type="button"
        className="sbscrim"
        aria-label="Close navigation"
        tabIndex={-1}
        onClick={closeNav}
      />
      <div className="main">
        <Topbar navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
