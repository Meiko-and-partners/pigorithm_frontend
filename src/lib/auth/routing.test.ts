import { describe, expect, it } from "vitest";
import { safeNextPath } from "./constants";
import { redirectFor } from "./routing";

const signedIn = (farmCount: number) => ({ status: "authenticated" as const, farmCount });

describe("redirectFor", () => {
  it("waits while the session is loading or failed", () => {
    expect(redirectFor({ status: "loading" }, "app", "/dashboard")).toBeNull();
    expect(redirectFor({ status: "error" }, "app", "/dashboard")).toBeNull();
  });

  it("sends signed-out users from app pages to login with a return path", () => {
    expect(redirectFor({ status: "unauthenticated" }, "app", "/pigs?status=sold")).toBe(
      "/login?next=%2Fpigs%3Fstatus%3Dsold",
    );
    expect(redirectFor({ status: "unauthenticated", expired: true }, "app", "/users")).toBe(
      "/login?next=%2Fusers&expired=1",
    );
    expect(redirectFor({ status: "unauthenticated" }, "onboarding", "/onboarding")).toMatch(/^\/login\?/);
  });

  it("lets signed-out users see login and registration", () => {
    expect(redirectFor({ status: "unauthenticated" }, "auth", "/login")).toBeNull();
  });

  it("sends users without a farm to onboarding", () => {
    expect(redirectFor(signedIn(0), "app", "/dashboard")).toBe("/onboarding");
    expect(redirectFor(signedIn(0), "auth", "/login")).toBe("/onboarding");
    expect(redirectFor(signedIn(0), "onboarding", "/onboarding")).toBeNull();
  });

  it("sends users with a farm into the app", () => {
    expect(redirectFor(signedIn(1), "app", "/dashboard")).toBeNull();
    expect(redirectFor(signedIn(1), "onboarding", "/onboarding")).toBe("/dashboard");
    expect(redirectFor(signedIn(1), "auth", "/login")).toBe("/dashboard");
    expect(redirectFor(signedIn(1), "auth", "/login", "/pigs/123")).toBe("/pigs/123");
  });

  it("ignores unsafe return paths", () => {
    expect(redirectFor(signedIn(1), "auth", "/login", "https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example/x")).toBeNull();
    expect(safeNextPath("/api/auth/logout")).toBeNull();
    expect(safeNextPath("/devices")).toBe("/devices");
  });
});
