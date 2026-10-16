import type { NextRequest } from "next/server";
import type { AuthTokensResponse } from "@/lib/api/types";
import {
  assertSameOrigin,
  backendPost,
  errorJson,
  relayError,
  sessionResponse,
  unreachable,
} from "@/lib/auth/server";

const PATH = "/api/auth/login";

/** Signs in through POST /auth/login and starts a cookie-backed session. */
export async function POST(request: NextRequest) {
  const rejected = assertSameOrigin(request);
  if (rejected) return rejected;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson(400, "Expected a JSON body", PATH);
  }
  const { email, password } = (body ?? {}) as Record<string, unknown>;

  let response: Response;
  try {
    // Forward only the fields the backend's LoginDto accepts.
    response = await backendPost(request, "/auth/login", { email, password });
  } catch (error) {
    return unreachable(PATH, error);
  }
  if (!response.ok) return relayError(response, PATH);
  return sessionResponse((await response.json()) as AuthTokensResponse);
}
