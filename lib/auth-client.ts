import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
  // Deliberately the frontend's *own* origin, not the API's. Auth requests go
  // to /api/auth/* on this origin, where app/api/auth/[...all]/route.ts
  // proxies them upstream to the better-auth server. That makes the session
  // cookie first-party — a cookie set directly by the API's own domain is
  // cross-site in production and never reaches the server components that
  // need to read it. See lib/auth-upstream.ts for the full explanation.
  //
  // During SSR there is no window; better-auth then falls back to the
  // relative "/api/auth" base, which is the same target. The client is only
  // ever *called* from the browser, so the fallback is never exercised for a
  // real request.
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
  // Required for authClient.signIn.magicLink() to exist. Must stay in sync
  // with the magicLink() plugin registered on the server in api-local/auth.ts.
  //
  // oauthProviderClient() is required for interrupted-authorize resume to
  // work at all. The API's mcp() plugin (a thin wrapper around
  // @better-auth/oauth-provider) redirects an unauthenticated /authorize
  // request here with a signed oauth_query on the URL. better-auth's
  // server-side "after" hook only resumes that authorization if it sees
  // oauth_query echoed back on the *next* non-GET auth request — and this
  // client plugin is the thing that reads window.location.search and
  // attaches it automatically. Without it, sign-in silently drops the
  // pending authorization and the AI client's window hangs forever. See
  // api-local/auth.ts (the mcp() plugin registration) and
  // @better-auth/oauth-provider/dist/client.mjs in this package.
  //
  // Pinned to the exact version api-local resolves (package.json /
  // bun.lock / node_modules all agree on 1.7.3) — a client/server mismatch
  // on the signed-query format fails in a way that's miserable to debug.
  plugins: [magicLinkClient(), oauthProviderClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
