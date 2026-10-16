/**
 * The single source of the backend base URL. Every API request — from the
 * browser and from the auth route handlers — is built from `apiUrl()`.
 *
 * `NEXT_PUBLIC_API_URL` must be the backend's versioned API root, e.g.
 * `http://localhost:3000/api/v1`. It is inlined into the client bundle at
 * build time, so it is public: never put a secret in it.
 */

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

/** Validates a configured base URL and returns it without a trailing slash. */
export function parseApiBaseUrl(raw: string | undefined): string {
  if (!raw || raw.trim() === "") {
    throw new ApiConfigError(
      "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (see .env.example), " +
        "e.g. NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1",
    );
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ApiConfigError(`NEXT_PUBLIC_API_URL is not a valid URL: "${raw}"`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ApiConfigError(`NEXT_PUBLIC_API_URL must use http or https: "${raw}"`);
  }
  if (url.search || url.hash) {
    throw new ApiConfigError(
      `NEXT_PUBLIC_API_URL must not contain a query string or fragment: "${raw}"`,
    );
  }
  return url.toString().replace(/\/+$/, "");
}

let cached: string | undefined;

/** The validated API base URL. Throws `ApiConfigError` when misconfigured. */
export function getApiBaseUrl(): string {
  // Referenced literally so Next.js can inline it into the client bundle.
  cached ??= parseApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  return cached;
}

/** Absolute URL for an API path such as `/farms` or `/auth/login`. */
export function apiUrl(path: string): string {
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Test hook: forget the cached value after changing the environment. */
export function resetApiConfigForTests(): void {
  cached = undefined;
}
