const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:3002"

/**
 * Exchanges the incoming better-auth session cookie for a signed JWT that the
 * API can verify against JWKS. Returns null when the caller is anonymous.
 */
export async function getServerSession(
  request: Request
): Promise<{ token: string; email: string } | null> {
  const cookie = request.headers.get("cookie")
  if (!cookie) return null

  const [sessionRes, tokenRes] = await Promise.all([
    fetch(`${AUTH_URL}/api/auth/get-session`, { headers: { cookie } }),
    fetch(`${AUTH_URL}/api/auth/token`, { headers: { cookie } }),
  ])
  if (!sessionRes.ok || !tokenRes.ok) return null

  const session = await sessionRes.json()
  const { token } = await tokenRes.json()
  const email = session?.user?.email
  if (!token || !email) return null

  return { token, email }
}
