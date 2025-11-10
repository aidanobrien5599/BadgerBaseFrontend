"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Bell, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CourseSubscription {
  subscription_id: number
  email: string
  course_id: string
  course_title: string
  course_designation: string
  full_course_designation: string
  course_uuid: string
}

interface SectionMeeting {
  label: string
  section_number: string
  meeting_type: string
}

interface SectionSubscription {
  subscription_id: number
  email: string
  section_id: string
  unique_section_id: string
  section_status: string
  available_seats: number
  instruction_mode: string
  course_title: string
  course_designation: string
  full_course_designation: string
  course_uuid: string
  meetings: SectionMeeting[]
}

interface SubscriptionsData {
  course_subscriptions: CourseSubscription[]
  section_subscriptions: SectionSubscription[]
}

type DeleteConfirmation = {
  type: 'course' | 'section'
  subscriptionId: number
  id: string
  name: string
} | null

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<SubscriptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<number | null>(null)
  const [deletingSection, setDeletingSection] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DeleteConfirmation>(null)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const response = await fetch("/api/subscriptions")
        
        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions")
        }

        const data = await response.json()
        setSubscriptions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching subscriptions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [isAuthenticated])

  const handleDeleteClick = (
    type: 'course' | 'section',
    subscriptionId: number,
    id: string,
    name: string
  ) => {
    setConfirmDelete({ type, subscriptionId, id, name })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return

    const { type, subscriptionId, id } = confirmDelete
    
    if (type === 'course') {
      setDeletingCourse(subscriptionId)
    } else {
      setDeletingSection(subscriptionId)
    }

    setConfirmDelete(null)

    try {
      const endpoint = type === 'course' 
        ? '/api/subscriptions/course' 
        : '/api/subscriptions/section'
      
      const bodyKey = type === 'course' ? 'course_id' : 'section_id'

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [bodyKey]: id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete subscription")
      }

      // Remove the subscription from the local state
      setSubscriptions((prev) => {
        if (!prev) return prev
        
        if (type === 'course') {
          return {
            ...prev,
            course_subscriptions: prev.course_subscriptions.filter(
              (sub) => sub.subscription_id !== subscriptionId
            ),
          }
        } else {
          return {
            ...prev,
            section_subscriptions: prev.section_subscriptions.filter(
              (sub) => sub.subscription_id !== subscriptionId
            ),
          }
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subscription")
      console.error("Error deleting subscription:", err)
    } finally {
      if (type === 'course') {
        setDeletingCourse(null)
      } else {
        setDeletingSection(null)
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!subscriptions) {
    return null
  }

  const totalSubscriptions = 
    subscriptions.course_subscriptions.length + 
    subscriptions.section_subscriptions.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Info Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">{user?.user_metadata?.full_name || user?.email}</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-lg text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <span>{user?.email}</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>{totalSubscriptions} active subscription{totalSubscriptions !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Subscriptions</CardTitle>
            <CardDescription>Watching entire courses for openings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscriptions.course_subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Section Subscriptions</CardTitle>
            <CardDescription>Watching specific sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscriptions.section_subscriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Subscriptions Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course Subscriptions</CardTitle>
          <CardDescription>
            You'll be notified when any section in these courses opens up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.course_subscriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No course subscriptions yet. Subscribe to courses to get notified about openings!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.course_subscriptions.map((sub) => (
                    <tr key={sub.subscription_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{sub.course_designation}</div>
                        <div className="text-sm text-muted-foreground">{sub.full_course_designation}</div>
                      </td>
                      <td className="py-3 px-4">{sub.course_title}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick('course', sub.subscription_id, sub.course_id, `${sub.course_designation} - ${sub.course_title}`)}
                          disabled={deletingCourse === sub.subscription_id}
                        >
                          {deletingCourse === sub.subscription_id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Section Subscriptions</CardTitle>
          <CardDescription>
            You'll be notified when these specific sections open up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.section_subscriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No section subscriptions yet. Subscribe to specific sections to get notified!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Course</th>
                    <th className="text-left py-3 px-4 font-semibold">Title</th>
                    <th className="text-left py-3 px-4 font-semibold">Meetings</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Seats</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.section_subscriptions.map((sub) => (
                    <tr key={sub.subscription_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{sub.course_designation}</div>
                        <div className="text-sm text-muted-foreground">{sub.full_course_designation}</div>
                      </td>
                      <td className="py-3 px-4">{sub.course_title}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.meetings.length > 0 ? (
                            sub.meetings.map((meeting, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {meeting.label}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No meetings</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={sub.section_status === "OPEN" ? "default" : "destructive"}
                          className={sub.section_status === "OPEN" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {sub.section_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={sub.available_seats > 0 ? "text-green-600 font-semibold" : ""}>
                          {sub.available_seats}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick('section', sub.subscription_id, sub.section_id, `${sub.course_designation} - ${sub.course_title}`)}
                          disabled={deletingSection === sub.subscription_id}
                        >
                          {deletingSection === sub.subscription_id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Unsubscribe
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unsubscribe from <strong>{confirmDelete?.name}</strong>?
              <br />
              <br />
              You will no longer receive notifications when this {confirmDelete?.type === 'course' ? 'course' : 'section'} opens up.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Unsubscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

