/**
 * Origins permitted to call the server-side API proxy routes. Shared by
 * every route under `app/api/` so a new domain is added in exactly one
 * place.
 */
export const ALLOWED_ORIGINS = [
  "https://sconniegrades.com",
  "https://www.sconniegrades.com",
  "https://badgerbase.app",
  "https://www.badgerbase.app",
  "http://localhost:3000",
  "http://localhost:3001",
] as const

/**
 * Matches on prefix because the value may be a `referer` (a full URL with a
 * path) rather than a bare `origin`.
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))
}
