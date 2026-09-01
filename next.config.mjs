/** @type {import('next').NextConfig} */

// API_URL names the BadgerBase API (the Hono server on
// Railway). It replaced NEXT_PUBLIC_AUTH_URL, whose meaning no longer holds:
// the browser now authenticates against this app's own origin via the
// same-origin proxy in app/api/auth/[...all]/route.ts, so there is nothing
// left to inline into the client bundle. What is still required is the
// server-side upstream address, read by that proxy and by
// lib/server-session.ts.
//
// If it is unset in production, both fall back to http://localhost:3002 --
// on Vercel that is the serverless function's own loopback, so every auth
// request and every subscription request fails with a connection error and
// no configuration error anywhere to explain it. Fail the build instead,
// since build time is the only point where failing is free; the runtime
// fallback stays in place for local dev, where this variable is set in .env.
if (process.env.NODE_ENV === "production" && !process.env.API_URL) {
  throw new Error(
    "API_URL is required for production builds. It must point at " +
      "the better-auth API (e.g. https://api-local-production.up.railway.app). " +
      "Without it, the /api/auth proxy and lib/server-session.ts both fall " +
      "back to http://localhost:3002 and every authenticated request fails."
  )
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/flags",
        destination: "https://us.i.posthog.com/flags",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
}

export default nextConfig
