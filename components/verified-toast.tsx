"use client"

import { useEffect } from "react"
import { toast } from "sonner"

/**
 * Reports the outcome of an emailed verification link.
 *
 * better-auth redirects to the callbackURL it was given either way, adding an
 * `error` parameter when the token is bad. Both cases therefore arrive with
 * `verified=1`, so success cannot be inferred from that flag alone — an
 * expired link would otherwise be announced as a confirmed email, which is
 * worse than saying nothing.
 *
 * Both parameters are stripped afterwards so a refresh or a shared link does
 * not re-announce the result.
 */
const MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "That confirmation link is invalid. Try signing up again to get a new one.",
  TOKEN_EXPIRED: "That confirmation link has expired. Sign up again to get a new one.",
}

export function VerifiedToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("verified") !== "1") return

    const error = params.get("error")
    if (error) {
      toast.error(
        MESSAGES[error] ??
          "We couldn't confirm your email. Try signing up again to get a new link."
      )
    } else {
      toast.success("Email confirmed — you're signed in.")
    }

    params.delete("verified")
    params.delete("error")
    const query = params.toString()
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "")
    )
  }, [])

  return null
}
