"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { RegisterRequest } from "@/lib/api/types";
import { SignInAfterRegisterError, useAuth } from "@/lib/auth/AuthProvider";
import {
  cleanOptional,
  hasErrors,
  PASSWORD_MIN,
  validateRegister,
  type FieldErrors,
} from "@/lib/validation";
import { AuthCard, Field, FormError, FormNote, SubmitButton } from "./FormParts";
import { loginErrorMessages } from "./LoginForm";

const EMPTY: RegisterRequest = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
};

function registerErrorMessages(error: unknown): string[] {
  if (error instanceof ApiError) {
    if (error.kind === "conflict") {
      return ["An account with this email already exists. Sign in instead."];
    }
    return error.messages;
  }
  return [errorMessage(error)];
}

/**
 * Step 1 of onboarding. The backend's register endpoint creates the user only;
 * the user is then signed in and continues to farm setup.
 */
export function RegisterForm() {
  const { register } = useAuth();
  const [values, setValues] = useState<RegisterRequest>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterRequest>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [createdButNotSignedIn, setCreatedButNotSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: e.target.value });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const errors = validateRegister(values);
    setFieldErrors(errors);
    setFormErrors([]);
    if (hasErrors(errors)) return;
    setBusy(true);
    // Passwords are sent exactly as typed; other fields are trimmed.
    const payload = { ...cleanOptional(values, ["phoneNumber"]), password: values.password };
    try {
      await register(payload);
      // Signed in: the AuthGate continues to farm setup.
    } catch (error) {
      if (error instanceof SignInAfterRegisterError) {
        setCreatedButNotSignedIn(true);
        setFormErrors(loginErrorMessages(error.cause));
      } else {
        setFormErrors(registerErrorMessages(error));
      }
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      sub="Step 1 of 2 · Next you'll set up your farm."
      footer={
        <>
          Already have an account? <Link href="/login">Sign in</Link>
        </>
      }
    >
      <div className="steps" aria-hidden="true">
        <div className="step done" />
        <div className="step" />
      </div>
      {createdButNotSignedIn && (
        <FormNote>
          Your account was created, but we couldn&apos;t sign you in.{" "}
          <Link href="/login" className="textlink">
            Sign in
          </Link>{" "}
          to continue.
        </FormNote>
      )}
      <FormError messages={formErrors} />
      <form onSubmit={onSubmit} noValidate>
        <div className="fieldrow">
          <Field id="firstName" label="First name" autoComplete="given-name" value={values.firstName} error={fieldErrors.firstName} onChange={set("firstName")} />
          <Field id="lastName" label="Last name" autoComplete="family-name" value={values.lastName} error={fieldErrors.lastName} onChange={set("lastName")} />
        </div>
        <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} error={fieldErrors.email} onChange={set("email")} />
        <Field id="phoneNumber" label="Phone number" type="tel" autoComplete="tel" optional placeholder="+2348012345678" value={values.phoneNumber} onChange={set("phoneNumber")} />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN} characters.`}
          value={values.password}
          error={fieldErrors.password}
          onChange={set("password")}
        />
        <SubmitButton busy={busy}>{busy ? "Creating account…" : "Create account"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
