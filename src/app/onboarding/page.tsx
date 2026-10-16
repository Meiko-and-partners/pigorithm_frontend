import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { FarmSetupForm } from "@/components/auth/FarmSetupForm";

export const metadata: Metadata = { title: "Set up your farm" };

export default function OnboardingPage() {
  return (
    <Suspense>
      <AuthGate area="onboarding">
        <FarmSetupForm />
      </AuthGate>
    </Suspense>
  );
}
