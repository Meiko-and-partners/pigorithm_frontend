import { Suspense } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGate area="app">
        <AppShell>{children}</AppShell>
      </AuthGate>
    </Suspense>
  );
}
