import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import { getServerSession } from "@/lib/server-session";

// API_URL comes from vitest.config.ts's `env` block.
const UPSTREAM = "https://api.example.com";
const COOKIE = "better-auth.session_token=abc123";

const fetchMock = vi.fn();

function withCookie(cookie: string | null = COOKIE) {
  return new Request("http://localhost:3000/api/subscriptions", {
    headers: cookie ? { cookie } : {},
  });
}

function respondOk(session: unknown, token: unknown) {
  fetchMock.mockImplementation(async (url: string) =>
    String(url).endsWith("/token")
      ? Response.json({ token })
      : Response.json(session)
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getServerSession", () => {
  test("returns null for an anonymous request without calling the auth server", async () => {
    expect(await getServerSession(withCookie(null))).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The cookie the proxy made first-party is forwarded straight to the
  // upstream better-auth server: better-auth resolves the session from the
  // token value, not from the host the request arrived on.
  test("forwards the incoming cookie to the upstream auth server", async () => {
    respondOk({ user: { email: "badger@wisc.edu" } }, "jwt-token");
    await getServerSession(withCookie());

    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toContain(`${UPSTREAM}/api/auth/get-session`);
    expect(urls).toContain(`${UPSTREAM}/api/auth/token`);
    for (const [, init] of fetchMock.mock.calls) {
      expect((init as RequestInit).headers).toEqual({ cookie: COOKIE });
    }
  });

  test("returns the JWT and the session's email", async () => {
    respondOk({ user: { email: "badger@wisc.edu" } }, "jwt-token");
    expect(await getServerSession(withCookie())).toEqual({
      token: "jwt-token",
      email: "badger@wisc.edu",
    });
  });

  test("reads the upstream URL from API_URL", async () => {
    vi.stubEnv("API_URL", "https://other-auth.example.com");
    respondOk({ user: { email: "badger@wisc.edu" } }, "jwt-token");
    await getServerSession(withCookie());
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "https://other-auth.example.com"
    );
    vi.unstubAllEnvs();
  });

  test("returns null when the session lookup fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockImplementation(async (url: string) =>
      String(url).endsWith("/token")
        ? Response.json({ token: "jwt-token" })
        : new Response("Unauthorized", { status: 401 })
    );
    expect(await getServerSession(withCookie())).toBeNull();
    consoleError.mockRestore();
  });

  test("returns null when the token exchange fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockImplementation(async (url: string) =>
      String(url).endsWith("/token")
        ? new Response("Unauthorized", { status: 401 })
        : Response.json({ user: { email: "badger@wisc.edu" } })
    );
    expect(await getServerSession(withCookie())).toBeNull();
    consoleError.mockRestore();
  });

  // better-auth answers get-session with 200 and a literal `null` body once
  // the session is gone, so an ok status alone does not mean signed in.
  test("returns null when a 200 get-session carries no user", async () => {
    respondOk(null, "jwt-token");
    expect(await getServerSession(withCookie())).toBeNull();
  });

  test("returns null when no JWT comes back", async () => {
    respondOk({ user: { email: "badger@wisc.edu" } }, null);
    expect(await getServerSession(withCookie())).toBeNull();
  });
});
