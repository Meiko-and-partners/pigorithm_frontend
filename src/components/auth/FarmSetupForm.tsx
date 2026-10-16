"use client";

import { useState, type FormEvent } from "react";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { CreateFarmRequest } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cleanOptional, hasErrors, validateFarm, type FieldErrors } from "@/lib/validation";
import { AuthCard, Field, FormError, SubmitButton } from "./FormParts";

const EMPTY: CreateFarmRequest = { name: "", location: "", address: "", phoneNumber: "", email: "" };
const OPTIONAL: (keyof CreateFarmRequest)[] = ["location", "address", "phoneNumber", "email"];

/**
 * Step 2 of onboarding. POST /farms creates the farm and makes the caller its
 * ACTIVE OWNER in one transaction; the user then enters the dashboard.
 */
export function FarmSetupForm() {
  const { createFarm, logout, state } = useAuth();
  const [values, setValues] = useState<CreateFarmRequest>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<CreateFarmRequest>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof CreateFarmRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [key]: e.target.value });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const errors = validateFarm(values);
    setFieldErrors(errors);
    setFormErrors([]);
    if (hasErrors(errors)) return;
    setBusy(true);
    try {
      await createFarm(cleanOptional(values, OPTIONAL));
      // The AuthGate moves on to the dashboard once the farm exists.
    } catch (error) {
      setFormErrors(error instanceof ApiError ? error.messages : [errorMessage(error)]);
      setBusy(false);
    }
  }

  const firstName = state.status === "authenticated" ? state.user.firstName : "";

  return (
    <AuthCard
      title="Set up your farm"
      sub={`Step 2 of 2 · ${firstName ? `Welcome, ${firstName}. ` : ""}You'll be the farm's owner.`}
      footer={
        <>
          Not you?{" "}
          <button type="button" className="textlink" onClick={() => void logout()}>
            Sign out
          </button>
        </>
      }
    >
      <div className="steps" aria-hidden="true">
        <div className="step done" />
        <div className="step done" />
      </div>
      <FormError messages={formErrors} />
      <form onSubmit={onSubmit} noValidate>
        <Field id="name" label="Farm name" placeholder="Green Valley Farm" value={values.name} error={fieldErrors.name} onChange={set("name")} />
        <Field id="location" label="Location" optional placeholder="Region or GPS coordinates" value={values.location} onChange={set("location")} />
        <Field id="address" label="Address" optional autoComplete="street-address" value={values.address} onChange={set("address")} />
        <div className="fieldrow">
          <Field id="phoneNumber" label="Farm phone" type="tel" optional value={values.phoneNumber} onChange={set("phoneNumber")} />
          <Field id="email" label="Farm email" type="email" optional value={values.email} error={fieldErrors.email} onChange={set("email")} />
        </div>
        <SubmitButton busy={busy}>{busy ? "Creating farm…" : "Create farm"}</SubmitButton>
      </form>
    </AuthCard>
  );
}
