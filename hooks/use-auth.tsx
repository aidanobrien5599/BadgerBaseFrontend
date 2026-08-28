"use client"

import { authClient } from "@/lib/auth-client"

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

/**
 * Same return shape as the Supabase-era hook, so consuming components need no
 * changes beyond their import of the user type.
 */
export function useAuth() {
  const { data, isPending } = authClient.useSession()
  const user = (data?.user as AuthUser | undefined) ?? null

  return { user, loading: isPending, isAuthenticated: !!user }
}
