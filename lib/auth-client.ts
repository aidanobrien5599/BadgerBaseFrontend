import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3002",
  // Required for authClient.signIn.magicLink() to exist. Must stay in sync
  // with the magicLink() plugin registered on the server in api-local/auth.ts.
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
