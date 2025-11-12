"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bell, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface NotificationButtonProps {
  type: "course" | "section"
  id: number
  isEnabled: boolean // Only show/enable when course status is 0 or section status is CLOSED
  courseTitle?: string // For course subscriptions
  sectionNames?: string[] // For section subscriptions (e.g., ["LEC 001", "DIS 302"])
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function NotificationButton({ type, id, isEnabled, courseTitle, sectionNames, onSuccess, onError }: NotificationButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    
    if (!user) {
      toast.error("Please log in to subscribe to notifications")
      onError?.("Please log in to subscribe to notifications")
      return
    }

    if (!isEnabled) {
      return
    }

    setSubscribing(true)

    try {
      const endpoint = type === "course" 
        ? "/api/subscriptions/course" 
        : "/api/subscriptions/section"
      
      const bodyKey = type === "course" ? "course_id" : "section_id"
      
      const requestBody: any = {
        [bodyKey]: id,
      }
      
      // Add course_title for course subscriptions
      if (type === "course" && courseTitle) {
        requestBody.course_title = courseTitle
      }
      
      // Add course_title and section_names for section subscriptions
      if (type === "section") {
        if (courseTitle) {
          requestBody.course_title = courseTitle
        }
        if (sectionNames && sectionNames.length > 0) {
          requestBody.section_names = sectionNames
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      toast.success(`Successfully subscribed to ${type === "course" ? "course" : "section"} notifications!`)
      onSuccess?.()
    } catch (error: any) {
      console.error("Subscription error:", error)
      const errorMessage = error.message || "Failed to subscribe to notifications"
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setSubscribing(false)
    }
  }

  // Don't show button if user is not signed in or if notifications are not enabled
  if (loading || !user || !isEnabled) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSubscribe}
      disabled={subscribing}
      className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      {subscribing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Subscribing...
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Notify Me
        </>
      )}
    </Button>
  )
}

