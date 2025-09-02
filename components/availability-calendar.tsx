"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface TimeSlot {
  start: number // minutes from midnight
  end: number // minutes from midnight
}

interface DayAvailability {
  [key: string]: TimeSlot[]
}

interface AvailabilityCalendarProps {
  onAvailabilityChange: (availability: {
    mondayStartDate: string
    mondayEndDate: string
    tuesdayStartDate: string
    tuesdayEndDate: string
    wednesdayStartDate: string
    wednesdayEndDate: string
    thursdayStartDate: string
    thursdayEndDate: string
    fridayStartDate: string
    fridayEndDate: string
  }) => void
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"]
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function AvailabilityCalendar({ onAvailabilityChange }: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<DayAvailability>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  })
  const [isSelecting, setIsSelecting] = useState(false)
  const [currentSelection, setCurrentSelection] = useState<{
    day: string
    startHour: number
    endHour: number
  } | null>(null)

  // Convert minutes to UTC milliseconds (CST is UTC-6, so add 6 hours)
  const minutesToUTCMilliseconds = (minutes: number): number => {
    const cstOffsetMinutes = 6 * 60 // CST is UTC-6
    const utcMinutes = minutes + cstOffsetMinutes
    return utcMinutes * 60 * 1000 // Convert to milliseconds
  }

  // Format time slots as comma-separated UTC milliseconds
  const formatTimeSlots = (slots: TimeSlot[]): string => {
    return slots
      .map((slot) => `${minutesToUTCMilliseconds(slot.start)}-${minutesToUTCMilliseconds(slot.end)}`)
      .join(",")
  }

  // Update availability and notify parent
  const updateAvailability = useCallback(
    (newAvailability: DayAvailability) => {
      setAvailability(newAvailability)

      const formattedAvailability = {
        mondayStartDate: newAvailability.monday
          .map((slot) => minutesToUTCMilliseconds(slot.start).toString())
          .join(","),
        mondayEndDate: newAvailability.monday.map((slot) => minutesToUTCMilliseconds(slot.end).toString()).join(","),
        tuesdayStartDate: newAvailability.tuesday
          .map((slot) => minutesToUTCMilliseconds(slot.start).toString())
          .join(","),
        tuesdayEndDate: newAvailability.tuesday.map((slot) => minutesToUTCMilliseconds(slot.end).toString()).join(","),
        wednesdayStartDate: newAvailability.wednesday
          .map((slot) => minutesToUTCMilliseconds(slot.start).toString())
          .join(","),
        wednesdayEndDate: newAvailability.wednesday
          .map((slot) => minutesToUTCMilliseconds(slot.end).toString())
          .join(","),
        thursdayStartDate: newAvailability.thursday
          .map((slot) => minutesToUTCMilliseconds(slot.start).toString())
          .join(","),
        thursdayEndDate: newAvailability.thursday
          .map((slot) => minutesToUTCMilliseconds(slot.end).toString())
          .join(","),
        fridayStartDate: newAvailability.friday
          .map((slot) => minutesToUTCMilliseconds(slot.start).toString())
          .join(","),
        fridayEndDate: newAvailability.friday.map((slot) => minutesToUTCMilliseconds(slot.end).toString()).join(","),
      }

      onAvailabilityChange(formattedAvailability)
    },
    [onAvailabilityChange],
  )

  const handleMouseDown = (day: string, hour: number) => {
    setIsSelecting(true)
    setCurrentSelection({ day, startHour: hour, endHour: hour })
  }

  const handleMouseEnter = (day: string, hour: number) => {
    if (isSelecting && currentSelection && currentSelection.day === day) {
      setCurrentSelection({
        ...currentSelection,
        endHour: hour,
      })
    }
  }

  const handleMouseUp = () => {
    if (currentSelection && isSelecting) {
      const { day, startHour, endHour } = currentSelection
      const start = Math.min(startHour, endHour) * 60 // Convert to minutes
      const end = (Math.max(startHour, endHour) + 1) * 60 // Convert to minutes, +1 for full hour

      const newSlot: TimeSlot = { start, end }
      const newAvailability = {
        ...availability,
        [day]: [...availability[day], newSlot].sort((a, b) => a.start - b.start),
      }

      updateAvailability(newAvailability)
    }

    setIsSelecting(false)
    setCurrentSelection(null)
  }

  const clearAvailability = () => {
    const emptyAvailability = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    }
    updateAvailability(emptyAvailability)
  }

  const isHourSelected = (day: string, hour: number): boolean => {
    const hourMinutes = hour * 60
    return availability[day].some((slot) => hourMinutes >= slot.start && hourMinutes < slot.end)
  }

  const isHourInCurrentSelection = (day: string, hour: number): boolean => {
    if (!currentSelection || currentSelection.day !== day) return false
    const minHour = Math.min(currentSelection.startHour, currentSelection.endHour)
    const maxHour = Math.max(currentSelection.startHour, currentSelection.endHour)
    return hour >= minHour && hour <= maxHour
  }

  const formatTime = (hour: number): string => {
    if (hour === 0) return "12 AM"
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Weekly Availability (CST)</Label>
        <Button variant="outline" size="sm" onClick={clearAvailability} className="text-xs bg-transparent">
          Clear All
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-3">Click and drag to select available time slots</div>

          <div className="grid grid-cols-6 gap-1 text-xs">
            {/* Header row */}
            <div></div>
            {DAY_LABELS.map((day) => (
              <div key={day} className="text-center font-medium p-1">
                {day}
              </div>
            ))}

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="text-right pr-2 py-1 text-xs text-muted-foreground">{formatTime(hour)}</div>
                {DAYS.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className={`
                      h-6 border border-gray-200 cursor-pointer transition-colors
                      ${isHourSelected(day, hour) ? "bg-primary/80" : "bg-gray-50 hover:bg-gray-100"}
                      ${isHourInCurrentSelection(day, hour) ? "bg-primary/60" : ""}
                    `}
                    onMouseDown={() => handleMouseDown(day, hour)}
                    onMouseEnter={() => handleMouseEnter(day, hour)}
                    onMouseUp={handleMouseUp}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 space-y-2">
            {DAYS.map((day, index) => {
              const slots = availability[day]
              if (slots.length === 0) return null

              return (
                <div key={day} className="text-xs">
                  <span className="font-medium capitalize">{DAY_LABELS[index]}:</span>{" "}
                  {slots.map((slot, i) => (
                    <span key={i} className="text-muted-foreground">
                      {formatTime(Math.floor(slot.start / 60))}-{formatTime(Math.floor(slot.end / 60))}
                      {i < slots.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
