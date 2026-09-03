"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Key, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate email domain
    // TEMPORARILY DISABLED: Wisconsin email blocking issue - allowing all emails for now
    // if (!email.toLowerCase().endsWith("@wisc.edu")) {
    //   setMessage({
    //     type: "error",
    //     text: "You must use a valid @wisc.edu email address to sign up.",
    //   })
    //   setLoading(false)
    //   return
    // }

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match. Please try again.",
      })
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long.",
      })
      setLoading(false)
      return
    }

    // Goes through /api/register rather than better-auth's /sign-up/email:
    // better-auth deliberately returns a decoy success for an address that
    // already exists, writing nothing and sending nothing, which leaves the
    // user with no way to learn why no email ever arrives.
    let res: Response
    try {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          // Where the emailed verification link lands. Auto sign-in is on,
          // so the flag is what lets the page confirm it worked instead of
          // silently dropping them on course search.
          callbackURL:
            typeof window !== "undefined"
              ? `${window.location.origin}/?verified=1`
              : "/?verified=1",
        }),
      })
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." })
      setLoading(false)
      return
    }

    const data = await res.json().catch(() => ({}))

    if (res.status === 409 && data.outcome === "ACCOUNT_EXISTS") {
      setMessage({
        type: "error",
        text: "An account with this email already exists. Sign in instead, or reset your password if you've forgotten it.",
      })
      setLoading(false)
      return
    }

    if (!res.ok) {
      setMessage({
        type: "error",
        text: data.message || data.error || "Failed to create account. Please try again.",
      })
      setLoading(false)
      return
    }

    const resent = data.outcome === "VERIFICATION_RESENT"
    const isWisconsinEmail = email.toLowerCase().endsWith("@wisc.edu")
    const lead = resent
      ? "You'd already signed up but hadn't confirmed your email yet — we've sent a new confirmation link."
      : "Success! Check your email for a confirmation link."
    const tail = isWisconsinEmail
      ? " ⚠️ Note: @wisc.edu emails may be blocked by the university. We're actively working to fix this issue."
      : " If you don't see it, please check your spam folder."

    setMessage({ type: "success", text: lead + tail })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Join BadgerBase with your email
            </p>
          </div>

          {/* Wisconsin Email Blocking Warning */}
          <Alert variant="default" className="mb-6 bg-warning/10 border-warning/30">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm text-warning">
              <strong className="font-semibold">Notice for @wisc.edu users:</strong> We're experiencing email delivery issues with Wisconsin email addresses. This is an issue we're actively fixing. We recommend using your personal email address for the time being.
            </AlertDescription>
          </Alert>

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

          {/* Sign up form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </div>
            </div>

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
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </div>
              {/* TEMPORARILY REMOVED: Wisconsin email restriction */}
              {/* <p className="text-xs text-muted-foreground">Must be a valid @wisc.edu email</p> */}
            </div>

            {/* Password */}
            <div className="space-y-2">
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
                  minLength={8}
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative group">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>

            {/* Sign in link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
