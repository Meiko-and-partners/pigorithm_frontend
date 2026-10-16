// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3001${path}`, { headers: cookie ? { cookie } : {} });

describe("route proxy (protected routes)", () => {
  it("redirects signed-out visitors to login, remembering where they were going", () => {
    const res = proxy(request("/pigs/abc?x=1"));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/pigs/abc?x=1");
  });

  it("lets visitors with a session cookie through", () => {
    const res = proxy(request("/dashboard", "pigorithm_session=1"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects onboarding too", () => {
    expect(proxy(request("/onboarding")).status).toBe(307);
  });

  it("leaves public pages alone", () => {
    expect(proxy(request("/login")).headers.get("location")).toBeNull();
    expect(proxy(request("/register")).headers.get("location")).toBeNull();
  });
});
