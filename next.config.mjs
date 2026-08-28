/** @type {import('next').NextConfig} */

// NEXT_PUBLIC_AUTH_URL is inlined into the client bundle at build time. If it
// is unset in production, the shipped bundle silently falls back to
// http://localhost:3002 inside lib/auth-client.ts, so every visitor's
// browser tries to authenticate against their own machine -- auth fails
// with no server-side error and nothing in the logs. Fail the build instead,
// since build time is the only point where failing is free; the runtime
// fallback stays in place for local dev, where this variable is set in .env.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_AUTH_URL) {
  throw new Error(
    "NEXT_PUBLIC_AUTH_URL is required for production builds. Without it, " +
      "the client bundle falls back to http://localhost:3002 and every " +
      "visitor's browser will try to authenticate against their own " +
      "machine, silently breaking auth in production."
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
