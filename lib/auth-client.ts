import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

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
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
