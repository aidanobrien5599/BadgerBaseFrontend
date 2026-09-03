import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

import {
  GET,
  POST,
  DELETE,
  OPTIONS,
} from "@/app/api/auth/[...all]/route";

// API_URL comes from vitest.config.ts's `env` block.
const UPSTREAM = "https://api.example.com";

const fetchMock = vi.fn();

function lastCall() {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return { url: String(url), init: init as RequestInit };
}

function upstreamResponse(
  body: string | null = "{}",
  init: ResponseInit = {}
): Response {
  return new Response(body, { status: 200, ...init });
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(upstreamResponse());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/api/auth/[...all] proxy", () => {
  test("forwards the path and query string to the upstream auth server", async () => {
    await GET(
      new Request("http://localhost:3000/api/auth/get-session?disableCookieCache=true")
    );
    expect(lastCall().url).toBe(
      `${UPSTREAM}/api/auth/get-session?disableCookieCache=true`
    );
  });

  test("forwards a nested catch-all path", async () => {
    await POST(
      new Request("http://localhost:3000/api/auth/sign-in/magic-link", {
        method: "POST",
        body: "{}",
      })
    );
    expect(lastCall().url).toBe(`${UPSTREAM}/api/auth/sign-in/magic-link`);
  });

  test("does not clobber a path prefix on the upstream URL", async () => {
    vi.stubEnv("API_URL", "https://auth.example.com/base/");
    await GET(new Request("http://localhost:3000/api/auth/token"));
    expect(lastCall().url).toBe(
      "https://auth.example.com/base/api/auth/token"
    );
    vi.unstubAllEnvs();
  });

  // The whole reason this route exists: the browser's session cookie has to
  // reach the upstream server, and the upstream's Set-Cookie has to reach the
  // browser from *this* origin so it is stored first-party.
  test("forwards the cookie header", async () => {
    await GET(
      new Request("http://localhost:3000/api/auth/get-session", {
        headers: { cookie: "better-auth.session_token=abc123" },
      })
    );
    const headers = new Headers(lastCall().init.headers);
    expect(headers.get("cookie")).toBe("better-auth.session_token=abc123");
  });

  test("relays every Set-Cookie header separately rather than collapsing them", async () => {
    // Sign-out is the real case: better-auth clears three cookies at once.
    const headers = new Headers();
    headers.append("set-cookie", "better-auth.session_token=; Max-Age=0; Path=/");
    headers.append("set-cookie", "better-auth.session_data=; Max-Age=0; Path=/");
    headers.append("set-cookie", "better-auth.dont_remember=; Max-Age=0; Path=/");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200, headers }));

    const res = await POST(
      new Request("http://localhost:3000/api/auth/sign-out", { method: "POST", body: "{}" })
    );

    const cookies = res.headers.getSetCookie();
    expect(cookies).toHaveLength(3);
    expect(cookies[0]).toContain("better-auth.session_token=");
    expect(cookies[1]).toContain("better-auth.session_data=");
    expect(cookies[2]).toContain("better-auth.dont_remember=");
  });

  test("does not send the frontend's own host header upstream", async () => {
    await GET(
      new Request("http://localhost:3000/api/auth/get-session", {
        headers: { "x-custom": "kept" },
      })
    );
    const headers = new Headers(lastCall().init.headers);
    expect(headers.has("host")).toBe(false);
    expect(headers.get("x-custom")).toBe("kept");
  });

  test("forwards the request method and body", async () => {
    const payload = JSON.stringify({ email: "badger@wisc.edu", password: "hunter22" });
    await POST(
      new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      })
    );
    const { init } = lastCall();
    expect(init.method).toBe("POST");
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe(payload);
  });

  test("sends no body for GET", async () => {
    await GET(new Request("http://localhost:3000/api/auth/token"));
    expect(lastCall().init.body).toBeUndefined();
  });

  test("relays the upstream status code", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: "EMAIL_NOT_VERIFIED" }), { status: 403 })
    );
    const res = await POST(
      new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        body: "{}",
      })
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ code: "EMAIL_NOT_VERIFIED" });
  });

  // better-auth answers verify-email and magic-link callbacks with a 302.
  // Following it here would swallow the redirect and drop its cookies.
  test("relays redirects instead of following them", async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: { location: "https://badgerbase.app/" },
      })
    );
    const res = await GET(
      new Request("http://localhost:3000/api/auth/verify-email?token=t")
    );
    expect(lastCall().init.redirect).toBe("manual");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://badgerbase.app/");
  });

  test("drops content-encoding and content-length from the relayed response", async () => {
    fetchMock.mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: {
          "content-encoding": "gzip",
          "content-length": "999",
          "content-type": "application/json",
        },
      })
    );
    const res = await GET(new Request("http://localhost:3000/api/auth/get-session"));
    expect(res.headers.get("content-encoding")).toBeNull();
    expect(res.headers.get("content-length")).toBeNull();
    expect(res.headers.get("content-type")).toBe("application/json");
  });

  test("constructs a bodyless response for a 204 rather than throwing", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const res = await OPTIONS(
      new Request("http://localhost:3000/api/auth/get-session", { method: "OPTIONS" })
    );
    expect(res.status).toBe(204);
  });

  test("bounds the upstream call with a timeout signal", async () => {
    await GET(new Request("http://localhost:3000/api/auth/get-session"));
    const signal = lastCall().init.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal!.aborted).toBe(false);
  });

  test("returns 502 when the upstream call aborts on timeout", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(
      Object.assign(new Error("The operation was aborted due to timeout"), {
        name: "TimeoutError",
      })
    );
    const res = await GET(new Request("http://localhost:3000/api/auth/token"));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Auth service unavailable" });
    consoleError.mockRestore();
  });

  // The WHATWG URL parser resolves %2e%2e as a dot segment, so a crafted
  // catch-all segment must not be able to walk off /api/auth/ onto another
  // upstream path.
  test("404s without calling upstream when the path escapes /api/auth/", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/auth/%2e%2e/%2e%2e/v2/subscriptions")
    );
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("applies the same guard when the upstream URL has a path prefix", async () => {
    vi.stubEnv("API_URL", "https://auth.example.com/base");
    const res = await GET(
      new Request("http://localhost:3000/api/auth/%2e%2e/v2/subscriptions")
    );
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  test("returns 502 when the upstream auth server is unreachable", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error("fetch failed"));
    const res = await DELETE(
      new Request("http://localhost:3000/api/auth/sign-out", { method: "DELETE" })
    );
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Auth service unavailable" });
    consoleError.mockRestore();
  });
});

describe("client IP forwarding", () => {
  test("sets x-client-ip to the first x-forwarded-for entry", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const { GET } = await import("@/app/api/auth/[...all]/route");
    await GET(new Request("http://localhost/api/auth/get-session", {
      headers: { "x-forwarded-for": "203.0.113.7, 76.76.21.98" },
    }));
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("x-client-ip")).toBe("203.0.113.7");
  });

  // Otherwise a caller could choose their own rate-limit bucket.
  test("ignores an inbound x-client-ip rather than trusting it", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const { GET } = await import("@/app/api/auth/[...all]/route");
    await GET(new Request("http://localhost/api/auth/get-session", {
      headers: { "x-client-ip": "1.2.3.4", "x-forwarded-for": "203.0.113.7" },
    }));
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("x-client-ip")).toBe("203.0.113.7");
  });
})
