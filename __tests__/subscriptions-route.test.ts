import { describe, test, expect, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("@/lib/server-session", () => ({ getServerSession: () => getServerSession() }));
vi.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: vi.fn(async () => new Response(JSON.stringify({ subscriptions: [] }), { status: 200 })),
}));

import { GET } from "@/app/api/subscriptions/route";

describe("GET /api/subscriptions", () => {
  beforeEach(() => { getServerSession.mockReset(); });

  test("returns 401 when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost:3000/api/subscriptions"));
    expect(res.status).toBe(401);
  });

  test("forwards the better-auth token as a bearer credential", async () => {
    getServerSession.mockResolvedValue({ token: "jwt-token", email: "badger@wisc.edu" });
    const { fetchWithRetry } = await import("@/lib/fetch-with-retry");
    await GET(new Request("http://localhost:3000/api/subscriptions"));
    expect(fetchWithRetry).toHaveBeenCalledWith(
      expect.stringContaining("badger%40wisc.edu"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }),
      })
    );
  });
});
