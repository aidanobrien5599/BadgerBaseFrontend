import { describe, test, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware, config } from "@/middleware";

describe("middleware", () => {
  test("passes an anonymous request through rather than redirecting", async () => {
    const res = await middleware(new NextRequest("http://localhost:3000/"));
    expect(res.status).toBeLessThan(300);
  });

  test("still excludes static assets from the matcher", () => {
    expect(config.matcher[0]).toContain("_next/static");
  });
});
