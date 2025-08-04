"use client"

import { Badge } from "@/components/ui/badge"
import { Bell, Users, TrendingUp, Zap } from "lucide-react"
import { useState, useEffect } from "react"

interface Notification {
  id: string
  type: "course" | "social" | "achievement" | "trending"
  message: string
  icon: any
  color: string
}

export function NotificationTicker() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "course",
      message: "CS 540 just opened 3 new spots!",
      icon: Bell,
      color: "bg-blue-500",
    },
    {
      id: "2",
      type: "social",
      message: "127 students are currently browsing courses",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "3",
      type: "trending",
      message: "MATH 221 is trending - 89% satisfaction rate!",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ])

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [notifications.length])

  useEffect(() => {
    const newNotifications = [
      "New: ECON 101 professor rating updated!",
      "Alert: Only 2 spots left in popular BIO 152 section",
      "Trending: Students love PSYC 202 this semester",
      "Update: CHEM 109 curve just announced - +7 points!",
      "Hot: CS 300 waitlist moving fast - 15 spots opened",
    ]

    const addRandomNotification = () => {
      const randomMsg = newNotifications[Math.floor(Math.random() * newNotifications.length)]
      const newNotif: Notification = {
        id: Date.now().toString(),
        type: "trending",
        message: randomMsg,
        icon: Zap,
        color: "bg-purple-500",
      }

      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)])
    }

    const interval = setInterval(addRandomNotification, 8000)
    return () => clearInterval(interval)
  }, [])

  const currentNotif = notifications[currentIndex]

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <Badge className={`${currentNotif?.color} text-white px-4 py-2 text-sm font-medium animate-pulse shadow-lg`}>
        <currentNotif.icon className="h-4 w-4 mr-2 animate-bounce" />
        {currentNotif?.message}
      </Badge>
    </div>
  )
}