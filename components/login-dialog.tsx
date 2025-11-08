"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { Loader2, Mail, Key, Clipboard } from "lucide-react"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [useOTP, setUseOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const supabase = createClient()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOTPDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1) // Only take the last digit
    setOtpDigits(newDigits)

    // Auto-focus next input
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
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, "").slice(0, 6).split("")
      const newDigits = [...digits, ...Array(6 - digits.length).fill("")]
      setOtpDigits(newDigits as string[])
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = digits.length < 6 ? digits.length : 5
      inputRefs.current[nextEmptyIndex]?.focus()
    } catch (error) {
      console.error("Failed to read clipboard:", error)
    }
  }

  const formatErrorMessage = (errorMessage: string): string => {
    // Clean up Supabase password error messages
    if (errorMessage.includes("Password should be at least") && errorMessage.includes("abcdefghijklmnopqrstuvwxyz")) {
      return "Password must be at least 8 characters and include a lowercase letter, uppercase letter, and number."
    }
    return errorMessage
  }

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setMessage({
            type: "success",
            text: "Check your email for the confirmation link!",
          })
        } else {
          setMessage({ type: "success", text: "Account created successfully!" })
          setTimeout(() => {
            onOpenChange(false)
            resetForm()
          }, 1000)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage({ type: "success", text: "Successfully signed in!" })
        setTimeout(() => {
          onOpenChange(false)
          resetForm()
        }, 1000)
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setMessage({ type: "error", text: formatErrorMessage(error.message) || "Authentication failed" })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) throw error

      setOtpSent(true)
      setMessage({
        type: "success",
        text: "Check your email for the 6-digit code!",
      })
    } catch (error: any) {
      console.error("OTP request error:", error)
      setMessage({ type: "error", text: formatErrorMessage(error.message) || "Failed to send OTP" })
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
        type: 'email',
      })

      if (error) throw error

      setMessage({ type: "success", text: "Successfully signed in!" })
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 1000)
    } catch (error: any) {
      console.error("OTP verification error:", error)
      setMessage({ type: "error", text: formatErrorMessage(error.message) || "Invalid code" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setOtpDigits(["", "", "", "", "", ""])
    setMessage(null)
    setOtpSent(false)
    setUseOTP(false)
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
              {useOTP ? "Sign in with Magic Link" : mode === "signin" ? "Sign in" : "Sign up"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {useOTP
                ? otpSent
                  ? "Enter the 6-digit code sent to your email"
                  : "Enter your email to receive a verification code"
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

          {useOTP && otpSent ? (
            <form onSubmit={handleOTPVerify} className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <Label className="text-sm font-medium">Verification Code</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePaste}
                  disabled={loading}
                  className="h-8 gap-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  Paste
                </Button>
              </div>
              <div className="flex gap-2 justify-center px-2">
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
                    className="w-12 h-14 text-center text-2xl font-semibold transition-all duration-200 focus:scale-105 focus:ring-2 focus:ring-ring"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading || otpDigits.some(d => !d)}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 transition-colors"
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
            <form onSubmit={useOTP ? handleOTPRequest : handleEmailPasswordAuth} className="space-y-5 mt-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-primary" />
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

            {!useOTP && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-primary" />
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
                {useOTP
                  ? "Send Verification Code"
                  : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 text-sm transition-colors hover:bg-accent"
                onClick={() => {
                  setUseOTP(!useOTP)
                  setMessage(null)
                }}
                disabled={loading}
              >
                {useOTP ? "Use password instead" : "Use verification code instead"}
              </Button>

              {!useOTP && (
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