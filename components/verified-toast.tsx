"use client"

import { useEffect } from "react"
import { toast } from "sonner"

/**
 * Confirms a completed email verification.
 *
 * better-auth's verify-email endpoint redirects to the callbackURL it was
 * given, which is this page. Without something here the user clicked a link
 * in their inbox, landed on the course search, and saw nothing at all — no
 * way to tell whether it had worked. Auto sign-in is on, so by the time this
 * renders they are signed in; this just says so.
 *
 * The query parameter is stripped afterwards so a refresh or a shared link
 * does not re-announce it.
 */
export function VerifiedToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("verified") !== "1") return

    toast.success("Email confirmed — you're signed in.")

    params.delete("verified")
    const query = params.toString()
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "")
    )
  }, [])

  return null
}
