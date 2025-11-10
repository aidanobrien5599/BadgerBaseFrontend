"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Key, ArrowLeft, Clipboard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [useOTP, setUseOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOTPDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("")
    const newDigits = [...digits, ...Array(6 - digits.length).fill("")]
    setOtpDigits(newDigits as string[])

    const nextEmptyIndex = digits.length < 6 ? digits.length : 5
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, "").slice(0, 6).split("")
      const newDigits = [...digits, ...Array(6 - digits.length).fill("")]
      setOtpDigits(newDigits as string[])

      const nextEmptyIndex = digits.length < 6 ? digits.length : 5
      inputRefs.current[nextEmptyIndex]?.focus()
    } catch (error) {
      console.error("Failed to read clipboard:", error)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if error is due to unconfirmed email
        if (error.message.includes("Email not confirmed")) {
          setMessage({
            type: "error",
            text: "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
          })
          setLoading(false)
          return
        }
        throw error
      }

      setMessage({ type: "success", text: "Successfully signed in!" })
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("Login error:", error)
      setMessage({
        type: "error",
        text: error.message || "Failed to sign in. Please check your credentials.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // This sends a magic link OTP for EXISTING users to login
      // shouldCreateUser: false prevents creating new accounts via OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Critical: Only allow existing confirmed users
        },
      })

      if (error) {
        // Handle case where user doesn't exist or isn't confirmed
        if (error.message.includes("User not found") || error.message.includes("not found")) {
          setMessage({
            type: "error",
            text: "No account found with this email. Please sign up first.",
          })
          setLoading(false)
          return
        }
        throw error
      }

      setOtpSent(true)
      setMessage({
        type: "success",
        text: "Check your email for the 6-digit verification code!",
      })
    } catch (error: any) {
      console.error("OTP request error:", error)
      setMessage({
        type: "error",
        text: error.message || "Failed to send verification code.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const otpCode = otpDigits.join("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      })

      if (error) throw error

      setMessage({ type: "success", text: "Successfully signed in!" })
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setMessage({
        type: "error",
        text: error.message || "Invalid verification code.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-gray-600">
              {useOTP
                ? otpSent
                  ? "Enter the verification code sent to your email"
                  : "Sign in with a verification code"
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

          {/* OTP verification form */}
          {useOTP && otpSent ? (
            <form onSubmit={handleOTPVerify} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-sm font-medium">Verification Code</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePaste}
                    disabled={loading}
                    className="h-8 gap-1.5 text-xs hover:bg-gray-100 transition-colors"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Paste
                  </Button>
                </div>
                <div className="flex gap-2 justify-center">
                  {otpDigits.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={handleOTPPaste}
                      className="w-12 h-14 text-center text-2xl font-semibold transition-all duration-200 focus:scale-105 focus:ring-2 focus:ring-red-700"
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="submit"
                  className="w-full h-11 bg-red-700 hover:bg-red-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading || otpDigits.some((d) => !d)}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-10 transition-colors hover:bg-gray-100"
                  onClick={() => {
                    setOtpSent(false)
                    setOtpDigits(["", "", "", "", "", ""])
                    setMessage(null)
                  }}
                  disabled={loading}
                >
                  Back to email
                </Button>
              </div>
            </form>
          ) : (
            /* Password or OTP request form */
            <form onSubmit={useOTP ? handleOTPRequest : handlePasswordLogin} className="space-y-5">
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
                    placeholder="you@wisc.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password (only show if not using OTP) */}
              {!useOTP && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-red-700"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-red-700 hover:bg-red-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {useOTP ? "Send Verification Code" : "Sign In"}
              </Button>

              {/* Toggle OTP / Password */}
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 text-sm transition-colors hover:bg-gray-100"
                onClick={() => {
                  setUseOTP(!useOTP)
                  setMessage(null)
                }}
                disabled={loading}
              >
                {useOTP ? "Use password instead" : "Use verification code instead"}
              </Button>

              {/* Sign up link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-red-700 hover:text-red-800 font-medium transition-colors"
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
