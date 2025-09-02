"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Clock, X } from "lucide-react"

interface TimeSlot {
  start: number // minutes from midnight
  end: number // minutes from midnight
}

interface WeeklyAvailability {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
}

interface AvailabilityCalendarProps {
  onApply: (params: Record<string, string>) => void
  initialAvailability?: WeeklyAvailability
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const HOURS_IN_DAY = 24
const MINUTES_PER_HOUR = 60

export function AvailabilityCalendar({ onApply, initialAvailability }: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<WeeklyAvailability>(
    initialAvailability || {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    },
  )

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingDay, setDrawingDay] = useState<string | null>(null)
  const [drawingStart, setDrawingStart] = useState<number | null>(null)
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null)

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`
  }

  const cstToUtcMilliseconds = (minutes: number): number => {
    const today = new Date()
    const cstDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    cstDate.setMinutes(minutes)
    const utcDate = new Date(cstDate.getTime() + 6 * 60 * 60 * 1000)
    const utcMidnight = new Date(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate())
    return utcDate.getTime() - utcMidnight.getTime()
  }

  const getMinutesFromMousePosition = (e: React.MouseEvent, dayElement: HTMLElement): number => {
    const rect = dayElement.getBoundingClientRect()
    const y = e.clientY - rect.top
    const percentage = Math.max(0, Math.min(1, y / rect.height))
    const rawMinutes = Math.round(percentage * HOURS_IN_DAY * MINUTES_PER_HOUR)
    return Math.round(rawMinutes / 5) * 5
  }

  const handleMouseDown = (e: React.MouseEvent, day: string) => {
    e.preventDefault()
    const dayElement = e.currentTarget as HTMLElement
    const minutes = getMinutesFromMousePosition(e, dayElement)

    setIsDrawing(true)
    setDrawingDay(day)
    setDrawingStart(minutes)

    setAvailability((prev) => {
      const newSlots = [...prev[day as keyof WeeklyAvailability], { start: minutes, end: minutes }]
      setCurrentSlotIndex(newSlots.length - 1)
      return {
        ...prev,
        [day]: newSlots,
      }
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, day: string) => {
      if (!isDrawing || drawingDay !== day || drawingStart === null || currentSlotIndex === null) return

      const dayElement = e.currentTarget as HTMLElement
      const currentMinutes = getMinutesFromMousePosition(e, dayElement)

      const start = Math.min(drawingStart, currentMinutes)
      const end = Math.max(drawingStart, currentMinutes)

      if (end - start < 30) return

      setAvailability((prev) => {
        const daySlots = [...prev[day as keyof WeeklyAvailability]]
        daySlots[currentSlotIndex] = { start, end }
        return {
          ...prev,
          [day]: daySlots,
        }
      })
    },
    [isDrawing, drawingDay, drawingStart, currentSlotIndex],
  )

  const handleMouseUp = () => {
    if (!isDrawing || !drawingDay || drawingStart === null) return

    setAvailability((prev) => {
      const daySlots = prev[drawingDay as keyof WeeklyAvailability]
      const mergedSlots = mergeOverlappingSlots(daySlots)

      return {
        ...prev,
        [drawingDay]: mergedSlots,
      }
    })

    setIsDrawing(false)
    setDrawingDay(null)
    setDrawingStart(null)
    setCurrentSlotIndex(null)
  }

  const mergeOverlappingSlots = (slots: TimeSlot[]): TimeSlot[] => {
    if (slots.length <= 1) return slots

    const sorted = [...slots].sort((a, b) => a.start - b.start)
    const merged: TimeSlot[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]
      const last = merged[merged.length - 1]

      if (current.start <= last.end + 30) {
        last.end = Math.max(last.end, current.end)
      } else {
        merged.push(current)
      }
    }

    return merged
  }

  const clearDay = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [],
    }))
  }

  const clearAll = () => {
    setAvailability({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    })
  }

  const generateApiParams = (): Record<string, string> => {
    const params: Record<string, string> = {}

    DAYS.forEach((day) => {
      const slots = availability[day as keyof WeeklyAvailability]
      if (slots.length > 0) {
        const startTimes = slots.map((slot) => cstToUtcMilliseconds(slot.start).toString())
        const endTimes = slots.map((slot) => cstToUtcMilliseconds(slot.end).toString())

        params[`${day}StartTime`] = startTimes.join(",")
        params[`${day}EndTime`] = endTimes.join(",")
      }
    })

    return params
  }

  const handleApplyAvailability = () => {
    const params = generateApiParams()
    onApply(params)
  }

  const hourLabels = Array.from({ length: HOURS_IN_DAY }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i
    const period = i < 12 ? "AM" : "PM"
    return `${hour}${period}`
  })

  const hasAvailability = DAYS.some((day) => availability[day as keyof WeeklyAvailability].length > 0)

  const deleteTimeSlot = (day: string, slotIndex: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day as keyof WeeklyAvailability].filter((_, index) => index !== slotIndex),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Click and drag to select your available time slots. You can create multiple separate time blocks per day for
        split availability (e.g., morning and evening classes). Times are in CST and snap to 5-minute intervals.
      </div>

      <div className="grid grid-cols-6 gap-1 border rounded-lg overflow-hidden bg-white" onMouseLeave={handleMouseUp}>
        <div className="bg-gray-50 border-r">
          <div className="h-8 border-b bg-gray-100"></div>
          {hourLabels.map((hour, i) => (
            <div
              key={i}
              className="h-4 border-b text-xs text-gray-500 text-center leading-4 border-gray-200"
              style={{ fontSize: "10px" }}
            >
              {i % 2 === 0 ? hour : ""}
            </div>
          ))}
        </div>

        {DAYS.map((day, dayIndex) => (
          <div key={day} className="relative border-r last:border-r-0">
            <div className="h-8 bg-gray-100 border-b flex items-center justify-center px-2">
              <span className="text-xs font-medium">{DAY_LABELS[dayIndex]}</span>
            </div>

            <div
              className="relative cursor-crosshair select-none"
              onMouseDown={(e) => handleMouseDown(e, day)}
              onMouseMove={(e) => handleMouseMove(e, day)}
              onMouseUp={handleMouseUp}
            >
              {Array.from({ length: HOURS_IN_DAY }, (_, i) => (
                <div key={i} className="h-4 border-b border-gray-200 hover:bg-blue-50" />
              ))}

              {availability[day as keyof WeeklyAvailability].map((slot, slotIndex) => {
                const top = (slot.start / (HOURS_IN_DAY * MINUTES_PER_HOUR)) * 100
                const height = ((slot.end - slot.start) / (HOURS_IN_DAY * MINUTES_PER_HOUR)) * 100

                return (
                  <div
                    key={slotIndex}
                    className="absolute left-0 right-0 bg-blue-500 bg-opacity-70 border border-blue-600 rounded-sm group hover:bg-opacity-80"
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      minHeight: "8px",
                    }}
                    title={`${minutesToTime(slot.start)} - ${minutesToTime(slot.end)}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTimeSlot(day, slotIndex)
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      title="Delete this time slot"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {hasAvailability && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Availability:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs max-h-32 overflow-y-auto">
            {DAYS.map((day, index) => {
              const slots = availability[day as keyof WeeklyAvailability]
              if (slots.length === 0) return null

              return (
                <div key={day} className="space-y-1">
                  <div className="font-medium text-gray-700">{DAY_LABELS[index]}</div>
                  {slots.map((slot, i) => (
                    <div key={i} className="text-gray-600">
                      {minutesToTime(slot.start)} - {minutesToTime(slot.end)}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleApplyAvailability} className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Apply Availability
        </Button>
        <Button onClick={clearAll} variant="outline" disabled={!hasAvailability}>
          Clear All
        </Button>
      </div>
    </div>
  )
}
