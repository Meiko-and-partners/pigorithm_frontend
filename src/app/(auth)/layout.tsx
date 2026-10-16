import { Suspense } from "react";
import { AuthGate } from "@/components/auth/AuthGate";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGate area="auth">{children}</AuthGate>
    </Suspense>
  );
}
