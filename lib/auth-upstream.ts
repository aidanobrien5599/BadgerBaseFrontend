/**
 * Base URL of the upstream better-auth server (the Hono API, on Railway in
 * production).
 *
 * The browser never talks to this host directly. In production the API and
 * the frontend sit on different registrable domains
 * (`api-local-production.up.railway.app` vs `badgerbase.app` /
 * `sconniegrades.com`), so a session cookie set on a cross-site response from
 * Railway is dropped by the browser, and even when it isn't, it is never sent
 * back to the Vercel origin where `lib/server-session.ts` reads it. Instead,
 * `app/api/auth/[...all]/route.ts` proxies `/api/auth/*` from the frontend's
 * own origin, which makes the session cookie first-party.
 *
 * Read lazily rather than captured at module load so tests can set it, and
 * so a route handler bundled at build time doesn't freeze a stale value.
 */
export function authUpstreamUrl(): string {
  return process.env.AUTH_UPSTREAM_URL ?? "http://localhost:3002"
}
