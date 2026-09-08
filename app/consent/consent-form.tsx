"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Plain-language description of each scope this server can grant. Keyed by
// the exact scope string better-auth passes through. What a scope CANNOT do
// is the point of this page, so every entry says both halves.
const SCOPE_DESCRIPTIONS: Record<string, { can: string; cannot: string }> = {
  "courses:read": {
    can: "search UW–Madison courses on your behalf",
    cannot:
      "It cannot see your subscriptions, change your account, or send email.",
  },
}

/**
 * Parses `client_id` into something a person can actually judge. better-auth
 * requires OAuth `client_id` values to be absolute URLs, so this is the same
 * shape the server already validated -- but the value is still
 * attacker-chosen text and must never be trusted or rendered as markup, only
 * as plain text.
 */
function parseClient(raw: string | null): { hostname: string; href: string } | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return { hostname: url.hostname, href: url.href }
  } catch {
    return null
  }
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

export function ConsentForm() {
  const searchParams = useSearchParams()
  const clientIdRaw = searchParams.get("client_id")
  const scopeRaw = searchParams.get("scope")
  const client = parseClient(clientIdRaw)
  const scopes = (scopeRaw ?? "").split(/[\s,]+/).filter(Boolean)

  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const respond = async (accept: boolean) => {
    setSubmitting(accept ? "approve" : "deny")
    setError(null)
    try {
      // better-auth signs the query parameters it attaches when redirecting
      // here, and needs that exact string back to verify the signature and
      // tie this answer to the pending authorization request. Re-serializing
      // via URLSearchParams (searchParams.toString()) can reorder or
      // re-encode bytes, so the raw literal query string from the address
      // bar is used instead of a reconstructed one.
      const oauthQuery = window.location.search.replace(/^\?/, "")

      const res = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accept,
          ...(scopeRaw ? { scope: scopeRaw } : {}),
          oauth_query: oauthQuery,
        }),
      })

      if (!res.ok) {
        throw new Error(`request failed with status ${res.status}`)
      }

      const data: { redirect_uri?: string } = await res.json()
      if (!data.redirect_uri) {
        throw new Error("response did not include a redirect_uri")
      }

      // The response carries the authorization code (on approve) or the
      // denial back to the client; only a real browser navigation delivers
      // that to the client's own redirect endpoint.
      window.location.href = data.redirect_uri
    } catch {
      setSubmitting(null)
      setError(
        accept
          ? "Something went wrong approving this request. Please try again."
          : "Something went wrong declining this request. Please try again."
      )
    }
  }

  if (!client) {
    return (
      <PageShell>
        <Card>
          <CardHeader>
            <CardTitle>This link isn&apos;t valid</CardTitle>
            <CardDescription>
              This authorization request is missing information needed to
              continue. Go back to the app that sent you here and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    )
  }

  const busy = submitting !== null

  return (
    <PageShell>
      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="/BadgerBaseTransparent.png"
              alt="BadgerBase"
              width={64}
              height={64}
              className="h-14 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-center text-2xl">
            Allow access to your BadgerBase account?
          </CardTitle>
          <CardDescription className="text-center text-base">
            <span className="font-semibold text-foreground" title={client.href}>
              {client.hostname}
            </span>{" "}
            wants to connect to your BadgerBase account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-surface p-4 space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-success-strong" />
              This app will be able to:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {scopes.length === 0 && (
                <li>No specific permissions were requested.</li>
              )}
              {scopes.map((scope) => {
                const description = SCOPE_DESCRIPTIONS[scope]
                return (
                  <li key={scope}>
                    {description ? (
                      <>
                        <span className="text-foreground">{description.can}</span>.{" "}
                        {description.cannot}
                      </>
                    ) : (
                      <>Use the &quot;{scope}&quot; permission.</>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => respond(false)}
            disabled={busy}
          >
            {submitting === "deny" && <Loader2 className="h-4 w-4 animate-spin" />}
            Deny
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => respond(true)}
            disabled={busy}
          >
            {submitting === "approve" && <Loader2 className="h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  )
}
