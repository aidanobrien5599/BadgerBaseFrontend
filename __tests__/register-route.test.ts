import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const post = async (body: unknown) => {
  const { POST } = await import("@/app/api/register/route");
  return POST(new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
};
const VALID = { email: "a@wisc.edu", password: "pw-123456", name: "A" };

describe("POST /api/register", () => {
  beforeEach(() => { fetchMock.mockReset(); vi.resetModules(); vi.stubEnv("API_KEY", "k"); });
  afterEach(() => { vi.unstubAllEnvs(); });

  test("forwards the API key server-side and never to the browser", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ outcome: "CREATED" }), { status: 200 }));
    await post(VALID);
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("k");
  });

  test("passes through 409 ACCOUNT_EXISTS so the UI can offer sign-in", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ outcome: "ACCOUNT_EXISTS" }), { status: 409 }));
    const res = await post(VALID);
    expect(res.status).toBe(409);
    expect((await res.json()).outcome).toBe("ACCOUNT_EXISTS");
  });

  test("passes through VERIFICATION_RESENT", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ outcome: "VERIFICATION_RESENT" }), { status: 200 }));
    expect((await (await post(VALID)).json()).outcome).toBe("VERIFICATION_RESENT");
  });

  test("returns 502 rather than hanging when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ETIMEDOUT"));
    const res = await post(VALID);
    expect(res.status).toBe(502);
  });

  test("rejects a malformed body without calling upstream", async () => {
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(new Request("http://localhost/api/register", { method: "POST", body: "not json" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
