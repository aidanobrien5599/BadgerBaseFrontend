"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()
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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { 
            full_name: fullName,
            display_name: fullName,
          },
        },
      })

      if (error) throw error

      // Debug logging to understand Supabase behavior
      console.log("Sign up response:", {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userEmail: data.user?.email,
        userConfirmed: data.user?.email_confirmed_at ? "Yes" : "No",
      })

      // Check if email confirmation is required
      // If data.session exists, user was auto-confirmed (email confirmation is disabled in Supabase)
      // If data.session is null, email confirmation is required (user needs to click email link)
      if (data.user && !data.session) {
        // Email confirmation required - user needs to verify email
        const isWisconsinEmail = email.toLowerCase().endsWith("@wisc.edu")
        
        if (isWisconsinEmail) {
          setMessage({
            type: "success",
            text: "Success! Check your email (and spam folder) for a confirmation link. ⚠️ Note: @wisc.edu emails may be blocked by the university. We're actively working to fix this issue.",
          })
        } else {
          setMessage({
            type: "success",
            text: "Success! Check your email for a confirmation link. If you don't see it, please check your spam folder.",
          })
        }
      } else if (data.user && data.session) {
        // User was auto-confirmed - this means email confirmation is DISABLED in Supabase
        console.warn("⚠️ User was auto-confirmed. Email confirmation is likely disabled in Supabase dashboard.")
        setMessage({ type: "success", text: "Account created successfully!" })
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        // Fallback case
        setMessage({ type: "success", text: "Account created successfully!" })
        setTimeout(() => {
          router.push("/")
        }, 1500)
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      setMessage({
        type: "error",
        text: error.message || "Failed to create account. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Auth card */}
        <div className="bg-white rounded-lg shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm text-gray-600">
              Join BadgerBase with your email
            </p>
          </div>

          {/* Wisconsin Email Blocking Warning */}
          <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
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
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-red-700" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
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
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-red-700" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
                  disabled={loading}
                />
              </div>
              {/* TEMPORARILY REMOVED: Wisconsin email restriction */}
              {/* <p className="text-xs text-gray-500">Must be a valid @wisc.edu email</p> */}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative group">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-red-700" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
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
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-red-700" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11 bg-red-700 hover:bg-red-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>

            {/* Sign in link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-red-700 hover:text-red-800 font-medium transition-colors"
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
