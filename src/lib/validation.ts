import type { CreateFarmRequest, LoginRequest, RegisterRequest } from "@/lib/api/types";

/**
 * Client-side checks that mirror the backend DTO rules (LoginDto, RegisterDto,
 * CreateFarmDto) so users get instant feedback. The backend validates again
 * and its messages are shown when it disagrees.
 */

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

// A pragmatic email shape check; the backend's IsEmail is authoritative.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

const blank = (value: string | undefined) => !value || value.trim() === "";

export function validateLogin(input: LoginRequest): FieldErrors<LoginRequest> {
  const errors: FieldErrors<LoginRequest> = {};
  if (blank(input.email)) errors.email = "Enter your email address.";
  else if (!EMAIL.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

export function validateRegister(input: RegisterRequest): FieldErrors<RegisterRequest> {
  const errors: FieldErrors<RegisterRequest> = {};
  if (blank(input.firstName)) errors.firstName = "Enter your first name.";
  if (blank(input.lastName)) errors.lastName = "Enter your last name.";
  if (blank(input.email)) errors.email = "Enter your email address.";
  else if (!EMAIL.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (input.password.length < PASSWORD_MIN) {
    errors.password = `Use at least ${PASSWORD_MIN} characters.`;
  } else if (input.password.length > PASSWORD_MAX) {
    errors.password = `Use at most ${PASSWORD_MAX} characters.`;
  }
  return errors;
}

export function validateFarm(input: CreateFarmRequest): FieldErrors<CreateFarmRequest> {
  const errors: FieldErrors<CreateFarmRequest> = {};
  if (blank(input.name)) errors.name = "Enter your farm's name.";
  if (!blank(input.email) && !EMAIL.test(input.email!.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

/** Trims every string and drops optional fields left empty. */
export function cleanOptional<T extends object>(input: T, optional: (keyof T)[]): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const trimmed = typeof value === "string" ? value.trim() : value;
    if (optional.includes(key as keyof T) && trimmed === "") continue;
    out[key] = trimmed;
  }
  return out as T;
}
