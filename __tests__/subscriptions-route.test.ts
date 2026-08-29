import { describe, test, expect, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("@/lib/server-session", () => ({ getServerSession: () => getServerSession() }));
vi.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: vi.fn(async () => new Response(JSON.stringify({ subscriptions: [] }), { status: 200 })),
}));

import { GET } from "@/app/api/subscriptions/route";
import { POST as coursePOST, DELETE as courseDELETE } from "@/app/api/subscriptions/course/route";
import { POST as sectionPOST, DELETE as sectionDELETE } from "@/app/api/subscriptions/section/route";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

const SESSION = { token: "jwt-token", email: "badger@wisc.edu" };

function jsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function forwardedEmail() {
  const call = (fetchWithRetry as ReturnType<typeof vi.fn>).mock.calls[0];
  const init = call[1] as RequestInit;
  const forwardedBody = JSON.parse(init.body as string);
  return forwardedBody.email;
}

describe("GET /api/subscriptions", () => {
  beforeEach(() => {
    getServerSession.mockReset();
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockClear();
  });

  test("returns 401 when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost:3000/api/subscriptions"));
    expect(res.status).toBe(401);
  });

  test("forwards the better-auth token as a bearer credential", async () => {
    getServerSession.mockResolvedValue({ token: "jwt-token", email: "badger@wisc.edu" });
    await GET(new Request("http://localhost:3000/api/subscriptions"));
    expect(fetchWithRetry).toHaveBeenCalledWith(
      expect.stringContaining("badger%40wisc.edu"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }),
      })
    );
  });
});

describe.each([
  {
    name: "POST /api/subscriptions/course",
    handler: coursePOST,
    url: "http://localhost:3000/api/subscriptions/course",
    method: "POST",
    body: { course_id: "comp-sci-300", course_title: "Programming II", email: "attacker@evil.com" },
    unauthorizedMessage: "Unauthorized: Please log in to subscribe to courses",
  },
  {
    name: "DELETE /api/subscriptions/course",
    handler: courseDELETE,
    url: "http://localhost:3000/api/subscriptions/course",
    method: "DELETE",
    body: { course_id: "comp-sci-300", email: "attacker@evil.com" },
    unauthorizedMessage: "Unauthorized: Please log in to unsubscribe from courses",
  },
  {
    name: "POST /api/subscriptions/section",
    handler: sectionPOST,
    url: "http://localhost:3000/api/subscriptions/section",
    method: "POST",
    body: { section_id: "12345", course_title: "Programming II", email: "attacker@evil.com" },
    unauthorizedMessage: "Unauthorized: Please log in to subscribe to sections",
  },
  {
    name: "DELETE /api/subscriptions/section",
    handler: sectionDELETE,
    url: "http://localhost:3000/api/subscriptions/section",
    method: "DELETE",
    body: { section_id: "12345", email: "attacker@evil.com" },
    unauthorizedMessage: "Unauthorized: Please log in to unsubscribe from sections",
  },
])("$name", ({ handler, url, method, body }) => {
  beforeEach(() => {
    getServerSession.mockReset();
    (fetchWithRetry as ReturnType<typeof vi.fn>).mockClear();
  });

  test("returns 401 and never calls fetchWithRetry when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    const res = await handler(jsonRequest(url, method, body));
    expect(res.status).toBe(401);
    expect(fetchWithRetry).not.toHaveBeenCalled();
  });

  test("forwards Authorization bearer token and X-API-Key when authenticated", async () => {
    getServerSession.mockResolvedValue(SESSION);
    await handler(jsonRequest(url, method, body));
    expect(fetchWithRetry).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${SESSION.token}`,
          "X-API-Key": "test-key",
        }),
      })
    );
  });

  test("forwards the session's email, not the request body's email", async () => {
    getServerSession.mockResolvedValue(SESSION);
    await handler(jsonRequest(url, method, body));
    expect(await forwardedEmail()).toBe(SESSION.email);
    expect(await forwardedEmail()).not.toBe(body.email);
  });
});
