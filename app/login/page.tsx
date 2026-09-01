"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Key, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      // Check if error is due to unverified email
      if (error.code === "EMAIL_NOT_VERIFIED" || error.message?.toLowerCase().includes("not verified")) {
        setMessage({
          type: "error",
          text: "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
        })
        setLoading(false)
        return
      }
      setMessage({
        type: "error",
        text: error.message || "Failed to sign in. Please check your credentials.",
      })
      setLoading(false)
      return
    }

    setMessage({ type: "success", text: "Successfully signed in!" })
    setLoading(false)
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // NOTE: better-auth's magic-link client does not accept a per-call
    // "existing users only" flag (the Supabase shouldCreateUser: false
    // equivalent). Whether this link can create a new account is controlled
    // server-side by the magicLink() plugin's `disableSignUp` option.
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: typeof window !== "undefined" ? window.location.origin : "/",
    })

    if (error) {
      // Handle case where user doesn't exist or isn't confirmed
      if (error.message?.toLowerCase().includes("not found")) {
        setMessage({
          type: "error",
          text: "No account found with this email. Please sign up first.",
        })
        setLoading(false)
        return
      }
      setMessage({
        type: "error",
        text: error.message || "Failed to send sign-in link.",
      })
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setMessage({
      type: "success",
      text: "Check your email for the sign-in link!",
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Auth card */}
        <div className="bg-surface rounded-lg shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/BadgerBaseTransparent.png"
              alt="BadgerBase"
              width={84}
              height={84}
              className="h-20 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              {useMagicLink
                ? magicLinkSent
                  ? "Click the link sent to your email to finish signing in"
                  : "Sign in with a magic link"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Alert message */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertDescription className="text-sm break-words leading-relaxed">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Magic link sent state */}
          {useMagicLink && magicLinkSent ? (
            <div className="space-y-2.5">
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 transition-colors hover:bg-muted"
                onClick={() => {
                  setMagicLinkSent(false)
                  setMessage(null)
                }}
                disabled={loading}
              >
                Back to email
              </Button>
            </div>
          ) : (
            /* Password or magic link request form */
            <form onSubmit={useMagicLink ? handleMagicLinkRequest : handlePasswordLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@wisc.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password (only show if not using magic link) */}
              {!useMagicLink && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {useMagicLink ? "Send Magic Link" : "Sign In"}
              </Button>

              {/* Toggle magic link / password */}
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  setUseMagicLink(!useMagicLink)
                  setMessage(null)
                }}
                disabled={loading}
              >
                {useMagicLink ? "Use password instead" : "Use a magic link instead"}
              </Button>

              {/* Sign up link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-primary hover:text-primary/90 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
