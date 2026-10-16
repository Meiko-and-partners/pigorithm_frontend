import type { ApiErrorBody } from "./types";

export type ApiErrorKind =
  | "network"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "server"
  | "http";

/** A failed API call, normalised from the backend's error envelope. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status; 0 when the request never got a response. */
  readonly status: number;
  /** Every message the backend returned (validation errors can be several). */
  readonly messages: string[];

  constructor(kind: ApiErrorKind, status: number, messages: string[]) {
    super(messages[0] ?? defaultMessage(kind));
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.messages = messages.length ? messages : [defaultMessage(kind)];
  }
}

export function kindForStatus(status: number): ApiErrorKind {
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status >= 500) return "server";
  return "http";
}

function defaultMessage(kind: ApiErrorKind): string {
  switch (kind) {
    case "network":
      return "Can't reach the Pigorithm API. Check your connection and try again.";
    case "unauthorized":
      return "Your session has ended. Please sign in again.";
    case "forbidden":
      return "You don't have permission to do this.";
    case "not_found":
      return "Not found.";
    case "server":
      return "The Pigorithm API had a problem. Please try again shortly.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    (typeof (value as ApiErrorBody).message === "string" ||
      Array.isArray((value as ApiErrorBody).message))
  );
}

/** Builds an ApiError from a non-OK response, reading the backend envelope if present. */
export async function errorFromResponse(response: Response): Promise<ApiError> {
  const kind = kindForStatus(response.status);
  let messages: string[] = [];
  try {
    const body: unknown = await response.json();
    if (isErrorBody(body)) {
      messages = Array.isArray(body.message) ? body.message : [body.message];
    }
  } catch {
    // Not JSON (e.g. a proxy error page): fall back to the default message.
  }
  // Never show raw 5xx detail; the backend already hides it, proxies may not.
  if (kind === "server") messages = [];
  return new ApiError(kind, response.status, messages);
}

/** A readable message for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.name === "ApiConfigError") return error.message;
  return "Something went wrong. Please try again.";
}
