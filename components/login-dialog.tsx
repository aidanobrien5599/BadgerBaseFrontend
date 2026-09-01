"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Key, User } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  const formatErrorMessage = (errorMessage: string): string => {
    // Clean up better-auth password error messages
    if (errorMessage.includes("Password should be at least") && errorMessage.includes("abcdefghijklmnopqrstuvwxyz")) {
      return "Password must be at least 8 characters and include a lowercase letter, uppercase letter, and number."
    }
    return errorMessage
  }

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === "signup") {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: fullName,
      })

      if (error) {
        setMessage({ type: "error", text: formatErrorMessage(error.message ?? "Sign up failed") })
        setLoading(false)
        return
      }

      // token is null when email verification is required (no session yet)
      if (data?.user && !data.token) {
        setMessage({
          type: "success",
          text: "Check your email for the confirmation link!",
        })
        setLoading(false)
      } else {
        setMessage({ type: "success", text: "Account created successfully!" })
        setLoading(false)
        setTimeout(() => {
          onOpenChange(false)
          resetForm()
        }, 1000)
      }
    } else {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setMessage({ type: "error", text: formatErrorMessage(error.message ?? "Authentication failed") })
        setLoading(false)
        return
      }

      setMessage({ type: "success", text: "Successfully signed in!" })
      setLoading(false)
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 1000)
    }
  }

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: typeof window !== "undefined" ? window.location.origin : "/",
    })

    if (error) {
      setMessage({ type: "error", text: formatErrorMessage(error.message ?? "Failed to send magic link") })
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

  const resetForm = () => {
    setFullName("")
    setEmail("")
    setPassword("")
    setMessage(null)
    setMagicLinkSent(false)
    setUseMagicLink(false)
    setMode("signin")
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-6">
          <DialogHeader className="space-y-3 text-center">
            <DialogTitle className="text-2xl font-bold">
              {useMagicLink ? "Sign in with Magic Link" : mode === "signin" ? "Sign in" : "Sign up"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {useMagicLink
                ? magicLinkSent
                  ? "Click the link we sent to your email to finish signing in"
                  : "Enter your email to receive a magic sign-in link"
                : mode === "signin"
                ? "Enter your email and password to sign in"
                : "Create a new account with your email and password"}
            </DialogDescription>
          </DialogHeader>

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className="my-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertDescription className="text-sm break-words leading-relaxed">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {useMagicLink && magicLinkSent ? (
            <div className="space-y-2.5 pt-2 mt-6">
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 transition-colors"
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
            <form onSubmit={useMagicLink ? handleMagicLinkRequest : handleEmailPasswordAuth} className="space-y-5 mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {!useMagicLink && mode === "signup" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2"
                  disabled={loading}
                />
              </div>
            </div>

            {!useMagicLink && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <Button
                type="submit"
                className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {useMagicLink
                  ? "Send Magic Link"
                  : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 text-sm transition-colors hover:bg-accent"
                onClick={() => {
                  setUseMagicLink(!useMagicLink)
                  setMessage(null)
                }}
                disabled={loading}
              >
                {useMagicLink ? "Use password instead" : "Use a magic link instead"}
              </Button>

              {!useMagicLink && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-10 text-sm transition-colors hover:bg-accent"
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin")
                    setMessage(null)
                  }}
                  disabled={loading}
                >
                  {mode === "signin"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              )}
            </div>
          </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
