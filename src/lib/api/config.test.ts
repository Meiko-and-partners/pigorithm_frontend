import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, ApiConfigError, parseApiBaseUrl, resetApiConfigForTests } from "./config";

describe("API configuration", () => {
  afterEach(() => resetApiConfigForTests());

  it("accepts an http(s) base URL and strips trailing slashes", () => {
    expect(parseApiBaseUrl("http://localhost:3000/api/v1/")).toBe("http://localhost:3000/api/v1");
    expect(parseApiBaseUrl(" https://pigorithm.onrender.com/api/v1 ")).toBe(
      "https://pigorithm.onrender.com/api/v1",
    );
  });

  it.each([undefined, "", "   "])("rejects a missing value (%j) with a clear error", (value) => {
    expect(() => parseApiBaseUrl(value)).toThrow(ApiConfigError);
    expect(() => parseApiBaseUrl(value)).toThrow(/NEXT_PUBLIC_API_URL is not set/);
  });

  it.each(["not a url", "ftp://example.com/api", "http://x/api?debug=1"])(
    "rejects an invalid value (%s)",
    (value) => {
      expect(() => parseApiBaseUrl(value)).toThrow(ApiConfigError);
    },
  );

  it("builds endpoint URLs from NEXT_PUBLIC_API_URL only", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test/api/v1");
    expect(apiUrl("/farms")).toBe("https://api.example.test/api/v1/farms");
    expect(apiUrl("auth/me")).toBe("https://api.example.test/api/v1/auth/me");
  });

  it("does not fall back to a hardcoded URL when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(() => apiUrl("/farms")).toThrow(ApiConfigError);
  });
});
