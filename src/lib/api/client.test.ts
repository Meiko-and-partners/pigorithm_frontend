import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./client";
import { resetApiConfigForTests } from "./config";
import { ApiError } from "./errors";

const BASE = "https://api.example.test/api/v1";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function envelope(status: number, message: string | string[]) {
  return json(status, { statusCode: status, timestamp: "t", path: "/x", message });
}

function setup(responses: Response[], token: string | null = "access-1") {
  const fetchImpl = vi.fn<typeof fetch>();
  for (const r of responses) fetchImpl.mockResolvedValueOnce(r);
  const deps = {
    getAccessToken: vi.fn(() => token),
    refreshAccessToken: vi.fn(async () => "access-2" as string | null),
    onUnauthorized: vi.fn(),
    fetchImpl,
  };
  return { client: createApiClient(deps), deps, fetchImpl };
}

describe("API client", () => {
  beforeEach(() => {
    resetApiConfigForTests();
    vi.stubEnv("NEXT_PUBLIC_API_URL", BASE);
  });

  it("sends JSON to the configured base URL with the bearer token", async () => {
    const { client, fetchImpl } = setup([json(201, { id: "f1" })]);
    await expect(client.request("/farms", { method: "POST", body: { name: "A" } })).resolves.toEqual({ id: "f1" });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/farms`);
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "A" }));
    expect(init?.credentials).toBe("omit");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer access-1");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("omits the token for public endpoints", async () => {
    const { client, fetchImpl, deps } = setup([json(201, {})], null);
    await client.request("/auth/register", { method: "POST", body: {}, auth: false });
    expect((fetchImpl.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(deps.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("returns undefined for 204 responses", async () => {
    const { client } = setup([new Response(null, { status: 204 })]);
    await expect(client.request("/x", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("surfaces every validation message from the backend envelope", async () => {
    const { client } = setup([envelope(400, ["email must be an email", "password too short"])]);
    const error = await client.request("/auth/register", { method: "POST", body: {}, auth: false }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: "validation",
      status: 400,
      messages: ["email must be an email", "password too short"],
    });
  });

  it.each([
    [403, "forbidden", "You do not have the required role for this action"],
    [404, "not_found", "Pig not found"],
    [409, "conflict", "A record with this email already exists"],
  ] as const)("maps %i to %s", async (status, kind, message) => {
    const { client } = setup([envelope(status, message)]);
    await expect(client.request("/x")).rejects.toMatchObject({ kind, status, message });
  });

  it("hides server error detail", async () => {
    const { client } = setup([envelope(500, "stack trace here")]);
    const error = (await client.request("/x").catch((e: unknown) => e)) as ApiError;
    expect(error).toMatchObject({ kind: "server", status: 500 });
    expect(error.message).not.toContain("stack");
  });

  it("reports network failures as a network error", async () => {
    const { client, fetchImpl } = setup([]);
    fetchImpl.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(client.request("/x")).rejects.toMatchObject({ kind: "network", status: 0 });
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    const { client, fetchImpl, deps } = setup([envelope(401, "Invalid or expired access token"), json(200, [1])]);
    await expect(client.request("/farms")).resolves.toEqual([1]);
    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect((fetchImpl.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe("Bearer access-2");
    expect(deps.onUnauthorized).not.toHaveBeenCalled();
  });

  it("signs out when the session can't be refreshed", async () => {
    const { client, deps } = setup([envelope(401, "Session is no longer valid")]);
    deps.refreshAccessToken.mockResolvedValueOnce(null);
    await expect(client.request("/farms")).rejects.toMatchObject({ kind: "unauthorized" });
    expect(deps.onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("signs out when the retried request is still unauthorized", async () => {
    const { client, deps } = setup([envelope(401, "expired"), envelope(401, "Account is not active")]);
    await expect(client.request("/farms")).rejects.toMatchObject({ message: "Account is not active" });
    expect(deps.onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("restores a missing access token before the first request", async () => {
    const { client, deps, fetchImpl } = setup([json(200, {})], null);
    await client.request("/auth/me");
    expect(deps.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect((fetchImpl.mock.calls[0][1]?.headers as Record<string, string>).Authorization).toBe("Bearer access-2");
  });
});
