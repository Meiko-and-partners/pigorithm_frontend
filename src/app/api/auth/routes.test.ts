// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetApiConfigForTests } from "@/lib/api/config";
import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";
import { POST as refresh } from "./refresh/route";

const BASE = "https://api.example.test/api/v1";
const ORIGIN = "http://localhost:3001";

function post(path: string, body?: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { origin: ORIGIN, "content-type": "application/json", "user-agent": "test-agent", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function backendJson(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const tokens = { accessToken: "a.b.c", refreshToken: "r.e.f", tokenType: "Bearer" };

describe("auth route handlers", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetApiConfigForTests();
    vi.stubEnv("NEXT_PUBLIC_API_URL", BASE);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  describe("login", () => {
    it("forwards credentials, keeps the refresh token in an httpOnly cookie and returns only the access token", async () => {
      fetchMock.mockResolvedValueOnce(backendJson(200, tokens));
      const res = await login(post("/api/auth/login", { email: "a@b.co", password: "pw", extra: "x" }));

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ accessToken: "a.b.c" });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE}/auth/login`);
      expect(JSON.parse(init?.body as string)).toEqual({ email: "a@b.co", password: "pw" });
      expect((init?.headers as Record<string, string>)["User-Agent"]).toBe("test-agent");

      const refreshCookie = res.cookies.get("pigorithm_rt");
      expect(refreshCookie).toMatchObject({ value: "r.e.f", httpOnly: true, sameSite: "strict", path: "/api/auth" });
      expect(res.cookies.get("pigorithm_session")?.value).toBe("1");
    });

    it("relays invalid credentials without setting cookies", async () => {
      fetchMock.mockResolvedValueOnce(
        backendJson(401, { statusCode: 401, timestamp: "t", path: "/api/v1/auth/login", message: "Invalid credentials" }),
      );
      const res = await login(post("/api/auth/login", { email: "a@b.co", password: "bad" }));
      expect(res.status).toBe(401);
      expect((await res.json()).message).toBe("Invalid credentials");
      expect(res.cookies.get("pigorithm_rt")).toBeUndefined();
    });

    it("rejects cross-origin requests", async () => {
      const res = await login(post("/api/auth/login", {}, { origin: "https://evil.example" }));
      expect(res.status).toBe(403);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns 502 when the backend is unreachable", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
      const res = await login(post("/api/auth/login", { email: "a@b.co", password: "pw" }));
      expect(res.status).toBe(502);
    });
  });

  describe("refresh", () => {
    it("returns 401 and clears cookies without a refresh cookie", async () => {
      const res = await refresh(post("/api/auth/refresh"));
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(res.cookies.get("pigorithm_session")?.value).toBe("");
    });

    it("rotates the refresh cookie and returns a new access token", async () => {
      fetchMock.mockResolvedValueOnce(backendJson(200, { ...tokens, accessToken: "new.access", refreshToken: "new.refresh" }));
      const res = await refresh(post("/api/auth/refresh", undefined, { cookie: "pigorithm_rt=old.refresh" }));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ accessToken: "new.access" });
      expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({ refreshToken: "old.refresh" });
      expect(res.cookies.get("pigorithm_rt")?.value).toBe("new.refresh");
    });

    it("clears the session when the backend rejects the refresh token", async () => {
      fetchMock.mockResolvedValueOnce(
        backendJson(401, { statusCode: 401, timestamp: "t", path: "/x", message: "Session is no longer valid" }),
      );
      const res = await refresh(post("/api/auth/refresh", undefined, { cookie: "pigorithm_rt=old" }));
      expect(res.status).toBe(401);
      expect(res.cookies.get("pigorithm_rt")?.value).toBe("");
    });

    it("keeps the session when the backend is temporarily unreachable", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
      const res = await refresh(post("/api/auth/refresh", undefined, { cookie: "pigorithm_rt=old" }));
      expect(res.status).toBe(502);
      expect(res.cookies.get("pigorithm_rt")).toBeUndefined();
    });
  });

  describe("logout", () => {
    it("revokes the backend session and clears cookies", async () => {
      fetchMock
        .mockResolvedValueOnce(backendJson(200, tokens))
        .mockResolvedValueOnce(new Response(null, { status: 204 }));
      const res = await logout(post("/api/auth/logout", undefined, { cookie: "pigorithm_rt=old" }));

      expect(res.status).toBe(204);
      expect(fetchMock.mock.calls[1][0]).toBe(`${BASE}/auth/logout`);
      expect((fetchMock.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe("Bearer a.b.c");
      expect(res.cookies.get("pigorithm_rt")?.value).toBe("");
      expect(res.cookies.get("pigorithm_session")?.value).toBe("");
    });

    it("clears cookies even when the backend is unreachable", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
      const res = await logout(post("/api/auth/logout", undefined, { cookie: "pigorithm_rt=old" }));
      expect(res.status).toBe(204);
      expect(res.cookies.get("pigorithm_rt")?.value).toBe("");
    });
  });
});
