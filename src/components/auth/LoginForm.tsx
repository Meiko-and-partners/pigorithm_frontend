"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasErrors, validateLogin, type FieldErrors } from "@/lib/validation";
import type { LoginRequest } from "@/lib/api/types";
import { AuthCard, Field, FormError, FormNote, SubmitButton } from "./FormParts";

export function loginErrorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    if (error.kind === "unauthorized" && error.message === "Invalid credentials") {
      return ["Email or password is incorrect."];
    }
    if (error.kind === "unauthorized" && error.message === "Account is not active") {
      return ["This account is inactive. Contact your farm owner."];
    }
    return error.messages;
  }
  return [errorMessage(error)];
}

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";
  const next = searchParams.get("next");
  const [values, setValues] = useState<LoginRequest>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginRequest>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const errors = validateLogin(values);
    setFieldErrors(errors);
    setFormErrors([]);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      // On success the AuthGate redirects to the app (or onboarding).
      await login({ email: values.email.trim(), password: values.password });
    } catch (error) {
      setFormErrors(loginErrorMessages(error));
      setBusy(false);
    }
  }

  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

  return (
    <AuthCard
      title="Sign in"
      sub="Welcome back. Sign in to monitor your herd."
      footer={
        <>
          New to Pigorithm? <Link href={registerHref}>Create an account</Link>
        </>
      }
    >
      {expired && <FormNote>Your session ended. Please sign in again.</FormNote>}
      <FormError messages={formErrors} />
      <form onSubmit={onSubmit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={fieldErrors.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          error={fieldErrors.password}
          onChange={(e) => setValues({ ...values, password: e.target.value })}
        />
        <SubmitButton busy={busy}>{busy ? "Signing in…" : "Sign in"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
