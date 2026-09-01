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
/**
 * Names this variable used to have. API_URL replaced all three, but a
 * deployment's env is updated separately from its code: between merging the
 * rename and editing the Vercel dashboard, only the old names exist. Reading
 * them keeps that window from breaking the build and the running site.
 *
 * SUBSCRIPTION_URL is deliberately NOT accepted. It was the one variable that
 * embedded the API's /v2 mount prefix in its value, so using it as a base
 * would produce /v2/v2/subscriptions — a 404 that looks like a routing bug
 * rather than a config one.
 */
const LEGACY_NAMES = ["AUTH_UPSTREAM_URL", "API_BASE_URL"] as const;

/** Resolves the API base, tolerating the pre-rename variable names. */
export function resolveApiUrl(env: NodeJS.ProcessEnv = process.env): {
  url: string | undefined;
  source: string | undefined;
} {
  if (env.API_URL) return { url: env.API_URL, source: "API_URL" };
  for (const name of LEGACY_NAMES) {
    if (env[name]) return { url: env[name], source: name };
  }
  return { url: undefined, source: undefined };
}

let warned = false;

export function apiUrl(): string {
  const { url, source } = resolveApiUrl();
  if (url && source !== "API_URL" && !warned) {
    warned = true;
    console.warn(
      `[api-url] Using ${source} as the API base. It has been renamed to ` +
        `API_URL; set that instead — support for the old name will be removed.`
    );
  }
  return url ?? "http://localhost:3002";
}
