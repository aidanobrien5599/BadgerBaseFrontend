import { describe, test, expect } from "vitest";
import { resolveApiUrl } from "@/lib/api-url";

describe("resolveApiUrl", () => {
  test("prefers API_URL", () => {
    const r = resolveApiUrl({ API_URL: "https://new", AUTH_UPSTREAM_URL: "https://old" } as any);
    expect(r).toEqual({ url: "https://new", source: "API_URL" });
  });

  test("falls back to AUTH_UPSTREAM_URL so a pre-rename deployment keeps building", () => {
    const r = resolveApiUrl({ AUTH_UPSTREAM_URL: "https://old" } as any);
    expect(r).toEqual({ url: "https://old", source: "AUTH_UPSTREAM_URL" });
  });

  test("falls back to API_BASE_URL", () => {
    const r = resolveApiUrl({ API_BASE_URL: "https://older" } as any);
    expect(r).toEqual({ url: "https://older", source: "API_BASE_URL" });
  });

  test("AUTH_UPSTREAM_URL wins over API_BASE_URL", () => {
    const r = resolveApiUrl({ AUTH_UPSTREAM_URL: "https://a", API_BASE_URL: "https://b" } as any);
    expect(r.source).toBe("AUTH_UPSTREAM_URL");
  });

  // SUBSCRIPTION_URL embedded the /v2 prefix in its value; reusing it as a
  // base would produce /v2/v2/subscriptions.
  test("never accepts SUBSCRIPTION_URL as a base", () => {
    const r = resolveApiUrl({ SUBSCRIPTION_URL: "https://api.example.com/v2" } as any);
    expect(r).toEqual({ url: undefined, source: undefined });
  });

  test("reports nothing when no base is configured", () => {
    expect(resolveApiUrl({} as any)).toEqual({ url: undefined, source: undefined });
  });
});
