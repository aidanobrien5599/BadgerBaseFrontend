// Node runtime: this handler reads and rewrites Set-Cookie headers, and
// `Headers.getSetCookie()` must not be polyfilled away.
export const runtime = "nodejs"
// Never cache or statically optimize an auth request.
export const dynamic = "force-dynamic"

import { apiUrl } from "@/lib/api-url"

/**
 * Same-origin proxy for better-auth.
 *
 * Everything the browser sends to `/api/auth/*` is forwarded verbatim to the
 * upstream better-auth server's matching `/api/auth/*` path, and the upstream
 * response — status, headers, and crucially its `Set-Cookie` headers — is
 * relayed straight back.
 *
 * The point is the cookie. better-auth defaults to `sameSite: "lax"`,
 * host-only cookies. In production the API is on a different registrable
 * domain from the frontend, so a cookie set directly by the API is both
 * dropped on the cross-site response and never sent back to the Vercel
 * origin that `lib/server-session.ts` reads cookies on. Because this response
 * comes from the frontend's own origin, the same cookie is first-party: the
 * browser stores it against `badgerbase.app` and sends it on every subsequent
 * request, including the server-side ones. Same-origin also means
 * better-auth's existing credentials and CSRF handling keep working
 * unchanged.
 */

// Hop-by-hop headers plus ones the outbound fetch must compute itself.
// `host` in particular would point at the frontend, not the upstream, and
// `accept-encoding` is dropped because undici decodes the response body for
// us — see the response blocklist below.
const REQUEST_HEADER_BLOCKLIST = new Set([
  // Never let a caller supply this themselves — we set it below from the
  // address Vercel observed. Accepting an inbound value would let anyone
  // pick their own rate-limit bucket.
  "x-client-ip",
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
])

// `content-encoding` and `content-length` describe the *encoded* upstream
// body; we relay the already-decoded stream, so passing them through would
// make the browser try to gunzip plaintext. `set-cookie` is excluded here and
// re-added below via getSetCookie(), because iterating Headers collapses
// multiple Set-Cookie values into one comma-joined string, which silently
// corrupts a multi-cookie response (better-auth sets more than one).
const RESPONSE_HEADER_BLOCKLIST = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "set-cookie",
  "transfer-encoding",
])

const BODYLESS_STATUSES = new Set([101, 204, 205, 304])

// Every auth request in the app flows through here. Without a ceiling, an
// upstream that hangs rather than refusing pins the Vercel function until its
// max duration; a hung upstream should degrade the same way an unreachable
// one already does.
const UPSTREAM_TIMEOUT_MS = 10_000

async function proxy(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  // Preserve any path prefix on the upstream URL rather than clobbering it,
  // and keep the raw (still-encoded) pathname so tokens in magic-link and
  // verification URLs survive the hop untouched.
  const upstream_ = new URL(apiUrl())
  const basePath = upstream_.pathname.replace(/\/+$/, "")
  const target = new URL(
    `${upstream_.origin}${basePath}${incoming.pathname}${incoming.search}`
  )

  // Defense in depth on the one route that proxies to a privileged host. The
  // WHATWG URL parser resolves dot segments, and `%2e%2e` is a dot segment to
  // it, so a crafted catch-all segment could in principle land on a non-auth
  // upstream path if Next's router hasn't already normalized it away. Bounded
  // today (fixed host, no injected credentials, /v2 needs an API key), but the
  // guard is one comparison: anything that escapes /api/auth/ is not ours.
  if (!target.pathname.startsWith(`${basePath}/api/auth/`)) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!REQUEST_HEADER_BLOCKLIST.has(key.toLowerCase())) headers.set(key, value)
  })

  // Hand the upstream one unambiguous client address.
  //
  // better-auth reads `x-forwarded-for`, but only trusts it when it holds a
  // single IP (see getIPFromHeader: `forwardedIps.length !== 1` returns null).
  // By the time a request reaches the API it has been through Vercel and then
  // Railway, so that header is a list and better-auth discards it — falling
  // back to one shared rate-limit bucket for every user, which it warns about
  // on boot. The alternative, `trustedProxies`, needs Vercel's egress CIDRs,
  // which are not static.
  //
  // The upstream reads `x-client-ip` first (see api-local/auth.ts). Anyone
  // hitting the API directly could still set it, so this narrows abuse rather
  // than eliminating it — but a shared bucket protects nobody at all.
  const clientIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim()
  if (clientIp) headers.set("x-client-ip", clientIp)

  // Buffered rather than streamed: auth payloads are tiny, and a streaming
  // body would need `duplex: "half"`, which not every fetch implementation
  // in this codebase's test and runtime matrix accepts.
  const method = request.method.toUpperCase()
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await request.arrayBuffer()

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body,
      // better-auth answers verify-email and magic-link callbacks with a 302.
      // Relay it to the browser instead of following it here, which would
      // both lose the redirect and strip the cookies set alongside it.
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (error) {
    // Covers a refused connection and a timeout alike -- both are "the auth
    // server did not answer", and both should fail fast rather than hang.
    console.error("auth proxy: upstream request failed", error)
    return Response.json({ error: "Auth service unavailable" }, { status: 502 })
  }

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!RESPONSE_HEADER_BLOCKLIST.has(key.toLowerCase()))
      responseHeaders.set(key, value)
  })
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie)
  }

  // A 204/304 response must be constructed with a null body or the Response
  // constructor throws, which would turn a valid upstream reply into a 500.
  const relayedBody = BODYLESS_STATUSES.has(upstream.status)
    ? null
    : upstream.body

  return new Response(relayedBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy
