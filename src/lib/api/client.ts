import { apiUrl } from "./config";
import { ApiError, errorFromResponse } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Send the access token (default true). */
  auth?: boolean;
  signal?: AbortSignal;
}

export interface ApiClientDeps {
  /** Current in-memory access token, if any. */
  getAccessToken: () => string | null;
  /** Obtains a new access token, or null when the session is gone. */
  refreshAccessToken: () => Promise<string | null>;
  /** Called once the session is known to be invalid. */
  onUnauthorized: () => void;
  fetchImpl?: typeof fetch;
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
}

/**
 * Talks to the NestJS API at the configured base URL: JSON in and out, bearer
 * authentication, the backend error envelope, and one transparent retry after
 * refreshing an expired access token.
 */
export function createApiClient(deps: ApiClientDeps): ApiClient {
  const fetchImpl = deps.fetchImpl ?? ((...args) => fetch(...args));

  async function send(path: string, options: RequestOptions, token: string | null) {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      return await fetchImpl(apiUrl(path), {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
        // Authentication uses the Authorization header, never cookies.
        credentials: "omit",
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new ApiError("network", 0, []);
    }
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const auth = options.auth ?? true;
    let token = auth ? deps.getAccessToken() : null;
    if (auth && !token) {
      token = await deps.refreshAccessToken();
      if (!token) {
        deps.onUnauthorized();
        throw new ApiError("unauthorized", 401, []);
      }
    }

    let response = await send(path, options, token);

    if (auth && response.status === 401) {
      const fresh = await deps.refreshAccessToken();
      if (!fresh) {
        deps.onUnauthorized();
        throw await errorFromResponse(response);
      }
      response = await send(path, options, fresh);
      if (response.status === 401) {
        deps.onUnauthorized();
        throw await errorFromResponse(response);
      }
    }

    if (!response.ok) throw await errorFromResponse(response);
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  return { request };
}
