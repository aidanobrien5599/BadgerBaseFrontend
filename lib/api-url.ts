/**
 * Base URL of the BadgerBase API (the Hono server, on Railway in production).
 *
 * One variable serves every call into that API — course queries, autocomplete,
 * subscriptions, and the better-auth proxy — because they are all the same
 * service. Each call site appends its own full path, including the `/v2`
 * prefix where the API mounts one. Keeping `/v2` in code rather than in the
 * env value is deliberate: it used to live in `SUBSCRIPTION_URL`, where
 * setting the obvious bare-host value made every subscription request 404.
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
export function apiUrl(): string {
  return process.env.API_URL ?? "http://localhost:3002"
}
