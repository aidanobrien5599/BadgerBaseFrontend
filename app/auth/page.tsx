"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Lock, User } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isOTP, setIsOTP] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is authenticated
  if (user) {
    return null
  }

  const validateWiscEmail = (email: string) => {
    return email.toLowerCase().endsWith("@wisc.edu")
  }

  // Helper function to check if user exists by attempting a password reset
  // This is more reliable than checking the profiles table
  const checkUserExistsByAttemptingOperation = async (email: string, operation: 'otp' | 'reset'): Promise<{ exists: boolean; error?: string }> => {
    try {
      if (operation === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        })
        
        if (error) {
          // Check for specific "user not found" type errors
          if (error.message.includes('User not found') || 
              error.message.includes('Invalid email') ||
              error.message.includes('email not confirmed')) {
            return { exists: false }
          }
          return { exists: true, error: error.message }
        }
        return { exists: true }
      } else {
        // For OTP, we'll try sending it and handle the error
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          }
        })
        
        if (error) {
          if (error.message.includes('User not found') || 
              error.message.includes('Invalid email') ||
              error.message.includes('Signup not allowed')) {
            return { exists: false }
          }
          return { exists: true, error: error.message }
        }
        return { exists: true }
      }
    } catch (err) {
      console.error(`Error checking user existence for ${operation}:`, err)
      return { exists: false, error: 'Network error occurred' }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    // Validate UW email
    if (!validateWiscEmail(email)) {
      setError("Must use wisconsin email!")
      setLoading(false)
      return
    }

    try {
      if (isOTP) {
        // Handle OTP verification
        if (!otpCode) {
          setError("Please enter the verification code!")
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email'
        })

        if (error) {
          setError(error.message)
          return
        }

        if (data.user) {
          setSuccessMessage("Successfully verified! Redirecting...")
          setTimeout(() => router.push('/'), 1500)
        }
      } else if (isLogin) {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Provide more specific error messages
          if (error.message.includes('Invalid login credentials')) {
            setError("Invalid email or password. Please check your credentials.")
          } else {
            setError(error.message)
          }
          return
        }

        if (data.user) {
          setSuccessMessage("Successfully signed in!")
          // Redirect to home page after successful login
          setTimeout(() => router.push('/'), 1500)
        }
      } else {
        // Sign up new user - check if email already exists using a simple approach
        // Try to sign up and handle the "user already exists" error
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })

        if (error) {
          if (error.message.includes('User already registered') || 
              error.message.includes('email already registered') ||
              error.message.includes('already been taken')) {
            setError("An account with this email already exists. Please sign in instead.")
          } else {
            setError(error.message)
          }
          return
        }

        if (data.user) {
          // Don't manually create profile - let the trigger handle it
          if (data.user.email_confirmed_at) {
            setSuccessMessage("Account created successfully! Redirecting...")
            setTimeout(() => router.push('/'), 1500)
          } else {
            setSuccessMessage("Account created! Please check your email to confirm your account.")
          }
        }
      }
    } catch (err) {
      setError("Authentication failed. Please try again.")
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async () => {
    if (!validateWiscEmail(email)) {
      setError("Must use wisconsin email!")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Try to send OTP - Supabase will handle if the user exists
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create user for OTP - must exist
        }
      })

      if (error) {
        if (error.message.includes('User not found') || 
            error.message.includes('Invalid email') ||
            error.message.includes('not registered') ||
            error.message.includes('Unable to validate email address')) {
          setError("No account found with this email. Please create an account first.")
        } else {
          setError(error.message)
        }
      } else {
        setIsOTP(true)
        setSuccessMessage("Check your email for a verification code!")
      }
    } catch (err) {
      setError("Failed to send verification code. Please try again.")
      console.error('OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!validateWiscEmail(email)) {
      setError("Must use wisconsin email!")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Try to send password reset - Supabase will handle if the user exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      })

      if (error) {
        if (error.message.includes('User not found') || 
            error.message.includes('Invalid email') ||
            error.message.includes('not registered')) {
          setError("No account found with this email. Please create an account first.")
        } else {
          setError(error.message)
        }
      } else {
        setSuccessMessage("Password reset email sent! Check your inbox.")
        setIsForgotPassword(false)
      }
    } catch (err) {
      setError("Failed to send password reset email. Please try again.")
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setName("")
    setOtpCode("")
    setError("")
    setSuccessMessage("")
    setIsOTP(false)
    setIsForgotPassword(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Single Card containing everything */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-6 text-center pb-6">
            <div className="flex justify-center">
              <Image
                src="/BadgerBaseTransparent.png"
                alt="BadgerBase"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {isForgotPassword ? "Reset your password" : isOTP ? "Enter verification code" : isLogin ? "Sign in to BadgerBase" : "Create your BadgerBase account"}
              </h2>
              <p className="text-sm text-gray-600">
                {isForgotPassword ? "Enter your email to receive a reset link" : isOTP ? "Check your email for the code" : isLogin ? "Welcome back!" : "Access exclusive features"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isForgotPassword ? (
              // Forgot Password Form
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    UW-Madison Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your-name@wisc.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setError("")
                      setSuccessMessage("")
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            ) : isOTP ? (
              // OTP Verification Form
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otpCode" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="otpCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="pl-10 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Code sent to: {email}
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOTP(false)
                      setOtpCode("")
                      setError("")
                      setSuccessMessage("")
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            ) : (
              // Regular Login/Signup Form
              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      UW-Madison Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your-name@wisc.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                {isLogin && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-50 px-2 text-gray-500">or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOTPLogin}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Use One-Time Password"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true)
                          setError("")
                          setSuccessMessage("")
                        }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="ml-2 text-red-600 hover:text-red-700 font-medium underline"
                    >
                      {isLogin ? "Create one" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Only UW-Madison students/staff with @wisc.edu emails can create an account or sign in.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
