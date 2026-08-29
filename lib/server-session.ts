import { authUpstreamUrl } from "@/lib/auth-upstream"

/**
 * Exchanges the incoming better-auth session cookie for a signed JWT that the
 * API can verify against JWKS. Returns null when the caller is anonymous.
 *
 * The cookie this reads is first-party to the frontend's origin, because
 * app/api/auth/[...all]/route.ts relayed the upstream Set-Cookie from this
 * origin. It is then forwarded straight back to the upstream better-auth
 * server: better-auth looks the session up by the token *value* in the
 * cookie, and does not care which host the request carrying it came from, so
 * a direct upstream call works and saves a pointless extra hop through our
 * own proxy. Verified against a running server, not assumed.
 */
export async function getServerSession(
  request: Request
): Promise<{ token: string; email: string } | null> {
  const cookie = request.headers.get("cookie")
  if (!cookie) return null

  const AUTH_URL = authUpstreamUrl()
  const [sessionRes, tokenRes] = await Promise.all([
    fetch(`${AUTH_URL}/api/auth/get-session`, { headers: { cookie } }),
    fetch(`${AUTH_URL}/api/auth/token`, { headers: { cookie } }),
  ])
  if (!sessionRes.ok || !tokenRes.ok) {
    console.error(
      "getServerSession: auth server request failed",
      `get-session -> ${sessionRes.status}`,
      `token -> ${tokenRes.status}`
    )
    return null
  }

  const session = await sessionRes.json()
  const { token } = await tokenRes.json()
  const email = session?.user?.email
  if (!token || !email) return null

  return { token, email }
}
