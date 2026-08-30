"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, BellRing, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface NotificationButtonProps {
  type: "course" | "section"
  id: number
  isEnabled: boolean
  courseTitle?: string
  sectionNames?: string[]
  compact?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function NotificationButton({ type, id, isEnabled, courseTitle, sectionNames, compact, onSuccess, onError }: NotificationButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      setShowSignupDialog(true)
      return
    }

    if (!isEnabled || subscribed) return

    setSubscribing(true)

    try {
      const endpoint = type === "course"
        ? "/api/subscriptions/course"
        : "/api/subscriptions/section"

      const bodyKey = type === "course" ? "course_id" : "section_id"

      const requestBody: any = {
        [bodyKey]: id,
      }

      if (courseTitle) {
        requestBody.course_title = courseTitle
      }

      if (type === "section" && sectionNames && sectionNames.length > 0) {
        requestBody.section_names = sectionNames
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setSubscribed(true)
      toast.success(`Subscribed to ${type} notifications`)
      onSuccess?.()
    } catch (error: any) {
      const errorMessage = error.message || "Failed to subscribe"
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setSubscribing(false)
    }
  }

  if (loading || !isEnabled) return null

  if (compact) {
    return (
      <>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className={cn(
                  "group inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded-[4px] border text-[11.5px] font-semibold transition-colors cursor-pointer",
                  subscribed
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/[0.14]"
                )}
              >
                {subscribing ? (
                  <>Closed <Loader2 className="h-[13px] w-[13px] animate-spin" /></>
                ) : subscribed ? (
                  <>Subscribed <BellRing className="h-[13px] w-[13px]" /></>
                ) : (
                  <>Closed <Bell className="h-[13px] w-[13px] opacity-70 group-hover:opacity-100 transition-opacity" /></>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] px-2 py-1">
              {subscribed ? "Subscribed" : "Get notified"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Sign up to get notified</DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground">
                Create an account to subscribe to notifications when courses or sections open up.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSignupDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={() => { setShowSignupDialog(false); router.push("/signup") }}>
                Sign Up
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleSubscribe}
        disabled={subscribing || subscribed}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-[5px] border rounded-[4px] font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
          subscribed
            ? "border-success/40 bg-success/10 text-success cursor-default"
            : "border-primary/50 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
          subscribing && "opacity-60"
        )}
      >
        {subscribing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Subscribing
          </>
        ) : subscribed ? (
          <>
            <BellRing className="h-3.5 w-3.5" />
            Subscribed
          </>
        ) : (
          <>
            <Bell className="h-3.5 w-3.5" />
            Notify Me
          </>
        )}
      </button>

      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Sign up to get notified</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              Create an account to subscribe to notifications when courses or sections open up.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignupDialog(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={() => { setShowSignupDialog(false); router.push("/signup") }}>
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
