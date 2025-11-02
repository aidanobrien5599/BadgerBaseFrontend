"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Clock, MapPin, Star, Calendar, ChevronDown, Users } from "lucide-react"

interface Instructor {
  name: string
  rmp_instructor_id: string | null
  avg_rating: number | null
  avg_difficulty: number | null
  num_ratings: number | null
}

interface Meeting {
  meeting_number: number
  meeting_days: string
  meeting_type: string
  start_time: string
  end_time: string
  building_name: string
  room: string
  location: string
}

interface Section {
  section_id: number
  status: string
  available_seats: number
  waitlist_total: number
  capacity: number
  enrolled: number
  instruction_mode: string
  is_asynchronous: boolean
  section_avg_rating: number
  section_avg_difficulty: number
  section_total_ratings: number
  section_avg_would_take_again: number
  instructors: Instructor[]
  meetings: Meeting[]
  section_requisites: string | null
}

interface HierarchicalSection {
  type: "Lecture" | "Discussion" | "Lab" | "Seminar"
  section: Section
  children: HierarchicalSection[]
}

interface SectionsDisplayProps {
  sections: Section[]
  hideClosedSections: boolean
  hideWaitlistedSections: boolean
}

export function SectionsDisplay({ sections, hideClosedSections, hideWaitlistedSections }: SectionsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const filterSections = (sects: Section[]) => {
    return sects.filter((section) => {
      if (hideClosedSections && section.status.toUpperCase() === "CLOSED") {
        return false
      }
      if (hideWaitlistedSections && section.status.toUpperCase() === "WAITLISTED") {
        return false
      }
      return true
    })
  }

  const buildHierarchy = (sects: Section[]) => {
    const hierarchy: HierarchicalSection[] = []
    const processedIds = new Set<number>()

    // First pass: Find all lectures and create parent nodes
    sects.forEach((section) => {
      const lectureMeeting = section.meetings?.find((m) => m.meeting_type.toUpperCase() === "LEC")
      if (lectureMeeting && !processedIds.has(section.section_id)) {
        const sectionType: "Lecture" | "Discussion" | "Lab" | "Seminar" = "Lecture"
        const children: HierarchicalSection[] = []

        // Find all discussions/labs that might be associated with this lecture
        // Since we don't have explicit parent IDs, we group by proximity or just add non-lecture sections after
        sects.forEach((childSection) => {
          if (childSection.section_id !== section.section_id && !processedIds.has(childSection.section_id)) {
            const childMeetings = childSection.meetings?.filter((m) => !["LEC"].includes(m.meeting_type.toUpperCase()))
            if (childMeetings && childMeetings.length > 0) {
              const childType = getMeetingTypeAsLabel(childMeetings[0]?.meeting_type || "") as
                | "Lecture"
                | "Discussion"
                | "Lab"
                | "Seminar"
              children.push({
                type: childType,
                section: childSection,
                children: [],
              })
              processedIds.add(childSection.section_id)
            }
          }
        })

        hierarchy.push({
          type: sectionType,
          section,
          children,
        })
        processedIds.add(section.section_id)
      }
    })

    // Second pass: Add any non-tiered sections (those without lectures)
    sects.forEach((section) => {
      if (!processedIds.has(section.section_id)) {
        const primaryMeeting = section.meetings?.[0]
        const sectionType = (getMeetingTypeAsLabel(primaryMeeting?.meeting_type || "") || "Lecture") as
          | "Lecture"
          | "Discussion"
          | "Lab"
          | "Seminar"
        hierarchy.push({
          type: sectionType,
          section,
          children: [],
        })
        processedIds.add(section.section_id)
      }
    })

    return hierarchy
  }

  const getMeetingTypeAsLabel = (type: string): "Lecture" | "Discussion" | "Lab" | "Seminar" | null => {
    switch (type.toUpperCase()) {
      case "LEC":
        return "Lecture"
      case "DIS":
        return "Discussion"
      case "LAB":
        return "Lab"
      case "SEM":
        return "Seminar"
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-green-50 text-green-700 border-green-200"
      case "CLOSED":
        return "bg-red-50 text-red-700 border-red-200"
      case "WAITLIST":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  const formatMeetingTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lecture":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Discussion":
        return "bg-green-50 text-green-700 border-green-200"
      case "Lab":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Seminar":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const filteredSections = filterSections(sections)
  const hierarchy = buildHierarchy(filteredSections)

  if (filteredSections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
        No sections match the current filters.
      </div>
    )
  }

  const renderSection = (hierarchical: HierarchicalSection, depth = 0) => {
    const { type, section, children } = hierarchical
    const isChild = depth > 0
    const primaryMeeting = section.meetings?.[0]
    const isExpanded = expandedSections.has(section.section_id)

    return (
      <Collapsible
        key={section.section_id}
        open={isExpanded}
        onOpenChange={() => toggleSection(section.section_id)}
        className={isChild ? "ml-4" : ""}
      >
        <CollapsibleTrigger asChild>
          <button
            className={`w-full text-left border rounded-lg p-3 transition-colors ${
              isChild ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
              {/* Type Label and Status */}
              <div className="flex items-center gap-2 min-w-fit">
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
                <Badge className={`${getTypeColor(type)} border font-medium text-xs`}>{type}</Badge>
                <Badge className={`${getStatusColor(section.status)} border font-medium text-xs`}>
                  {section.status}
                </Badge>
              </div>

              {/* Meeting Times - Compact */}
              {primaryMeeting && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">
                    {primaryMeeting.meeting_days}{" "}
                    {formatMeetingTime(primaryMeeting.start_time, primaryMeeting.end_time)}
                  </span>
                </div>
              )}

              {/* Location - Compact */}
              {primaryMeeting && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">
                    {primaryMeeting.location || `${primaryMeeting.building_name} ${primaryMeeting.room}`}
                  </span>
                </div>
              )}

              {/* Enrollment - Right Aligned */}
              <div className="flex items-center gap-2 ml-auto text-sm">
                <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium text-xs">
                    {section.enrolled}/{section.capacity}
                  </span>
                </div>
                {section.waitlist_total > 0 && (
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium text-xs">
                    {section.waitlist_total} wait
                  </Badge>
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className={`border border-t-0 rounded-b-lg p-4 space-y-4 ${isChild ? "bg-white" : "bg-gray-50"}`}>
            {/* Mode and Async Badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-red-600 text-white font-medium text-xs">{section.instruction_mode}</Badge>
              {section.is_asynchronous && <Badge className="bg-gray-600 text-white font-medium text-xs">Async</Badge>}
            </div>

            {/* Section Requisites */}
            {section.section_requisites && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Requirement:</span> {section.section_requisites}
              </p>
            )}

            {/* Meeting Times (Expanded) */}
            {section.meetings && section.meetings.length > 0 && (
              <div>
                <h6 className="font-bold mb-2 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  Meeting Times
                </h6>
                <div className="space-y-2">
                  {section.meetings.map((meeting, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-white rounded text-sm">
                      <div className="font-semibold text-gray-900">{getMeetingTypeAsLabel(meeting.meeting_type)}</div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <span>
                          {meeting.meeting_days} {formatMeetingTime(meeting.start_time, meeting.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <MapPin className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        <span>{meeting.location || `${meeting.building_name} ${meeting.room}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructors */}
            {section.instructors.length > 0 && (
              <div>
                <h6 className="font-bold mb-2 text-sm text-gray-900">Instructors:</h6>
                <div className="space-y-2">
                  {section.instructors.map((instructor, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-white rounded gap-2 text-sm"
                    >
                      <span className="font-semibold text-gray-900">
                        {instructor.rmp_instructor_id ? (
                          <a
                            target="_blank"
                            className="hover:text-red-600 hover:underline"
                            href={`https://www.ratemyprofessors.com/professor/${instructor.rmp_instructor_id}`}
                            rel="noreferrer"
                          >
                            {instructor.name}
                          </a>
                        ) : (
                          instructor.name
                        )}
                      </span>
                      {instructor.avg_rating && (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-red-500 fill-current" />
                            <span className="font-semibold text-gray-900">{formatRating(instructor.avg_rating)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            <span className="text-gray-700">Diff {formatRating(instructor.avg_difficulty)}</span>
                          </div>
                          <span className="text-gray-500">({instructor.num_ratings})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Child Sections (Discussions/Labs under Lectures) */}
            {children.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h6 className="font-semibold text-gray-900 text-sm mb-3">Associated Sections:</h6>
                <div className="space-y-2">{children.map((child) => renderSection(child, depth + 1))}</div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className="space-y-2">
      {hierarchy.map((hierarchical) => (
        <div key={hierarchical.section.section_id}>{renderSection(hierarchical)}</div>
      ))}
    </div>
  )
}
