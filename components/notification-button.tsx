"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
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
  /**
   * Sent to the API as-is. Section ids are numeric, but a course_id is a
   * zero-padded string ("024794") that the /v2 handler matches exactly, so it
   * must not be coerced through a number on the way here.
   */
  id: string | number
  isEnabled: boolean
  courseTitle?: string
  sectionNames?: string[]
  compact?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function NotificationButton({ type, id, isEnabled, courseTitle, sectionNames, compact, onSuccess, onError }: NotificationButtonProps) {
  const { user, loading } = useAuth()
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const router = useRouter()

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
    // Sized against the container (the table's status cell), not the viewport: that
    // cell's width swings with the sidebar, so it is narrower at 1024px than at 900px.
    return (
      <>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className={cn(
                  "group inline-flex items-center gap-[3px] @[72px]:gap-[5px] px-1.5 @[72px]:px-2.5 py-[6px] @[72px]:py-[3px] rounded-[4px] border text-[9px] @[72px]:text-[11.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  subscribed
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/[0.14]"
                )}
              >
                {subscribing ? (
                  <><span className="sr-only @[54px]:not-sr-only">Closed</span> <Loader2 className="h-[11px] w-[11px] @[72px]:h-[13px] @[72px]:w-[13px] animate-spin" /></>
                ) : subscribed ? (
                  <><span className="sr-only @[99px]:not-sr-only">Subscribed</span> <BellRing className="h-[11px] w-[11px] @[72px]:h-[13px] @[72px]:w-[13px]" /></>
                ) : (
                  <><span className="sr-only @[54px]:not-sr-only">Closed</span> <Bell className="h-[11px] w-[11px] @[72px]:h-[13px] @[72px]:w-[13px] opacity-70 group-hover:opacity-100 transition-opacity" /></>
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
