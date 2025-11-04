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

    // Find lectures first
    const lectures = sects.filter(section => 
      section.meetings?.some(m => m.meeting_type.toUpperCase() === "LEC")
    )

    if (lectures.length > 0) {
      // For each lecture, find its associated discussions/labs
      lectures.forEach((lecture) => {
        const children: HierarchicalSection[] = []
        
        // Find discussions and labs that belong to this specific lecture
        // Use section numbering logic: if lecture is 001, look for 301, 401, etc.
        const lectureBase = Math.floor(lecture.section_id / 100) * 100
        
        sects.forEach((section) => {
          if (section.section_id !== lecture.section_id && !processedIds.has(section.section_id)) {
            const sectionBase = Math.floor(section.section_id / 100) * 100
            const hasDiscussion = section.meetings?.some(m => m.meeting_type.toUpperCase() === "DIS")
            const hasLab = section.meetings?.some(m => m.meeting_type.toUpperCase() === "LAB")
            
            // Associate if same base number and is discussion/lab
            if (sectionBase === lectureBase && (hasDiscussion || hasLab)) {
              const childType = hasDiscussion ? "Discussion" : "Lab"
              children.push({
                type: childType as "Discussion" | "Lab",
                section,
                children: []
              })
              processedIds.add(section.section_id)
            }
          }
        })

        hierarchy.push({
          type: "Lecture",
          section: lecture,
          children
        })
        processedIds.add(lecture.section_id)
      })
    }

    // Add any remaining standalone sections
    sects.forEach((section) => {
      if (!processedIds.has(section.section_id)) {
        const primaryMeeting = section.meetings?.[0]
        const sectionType = getMeetingTypeAsLabel(primaryMeeting?.meeting_type || "") || "Discussion"
        
        hierarchy.push({
          type: sectionType as "Lecture" | "Discussion" | "Lab" | "Seminar",
          section,
          children: []
        })
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

  const renderParentRow = (hierarchical: HierarchicalSection) => {
    const { type, section, children } = hierarchical
    const lectureMeeting = section.meetings?.find(m => m.meeting_type.toUpperCase() === "LEC")
    const isExpanded = expandedSections.has(section.section_id)

    return (
      <Collapsible
        key={section.section_id}
        open={isExpanded}
        onOpenChange={() => toggleSection(section.section_id)}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full text-left border rounded-lg p-3 bg-blue-50 hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={`h-4 w-4 text-blue-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
                <Badge className="bg-blue-600 text-white font-medium text-sm">Lecture</Badge>
                <Badge className={`${getStatusColor(section.status)} border font-medium text-sm`}>
                  {section.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {/* Meeting Time */}
                {lectureMeeting && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {lectureMeeting.meeting_days} {formatMeetingTime(lectureMeeting.start_time, lectureMeeting.end_time)}
                    </span>
                  </div>
                )}

                {/* Location */}
                {lectureMeeting && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {lectureMeeting.location || `${lectureMeeting.building_name} ${lectureMeeting.room}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg p-4 bg-gray-50 space-y-4">
            {/* Lecture Details - Only shown when expanded */}
            <div className="bg-white rounded p-3 space-y-3">
              {/* Instructors */}
              {section.instructors.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-900 text-sm mb-2">Instructors:</h6>
                  <div className="space-y-2">
                    {section.instructors.map((instructor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
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
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-red-500 fill-current" />
                              <span>{formatRating(instructor.avg_rating)}</span>
                            </div>
                            <span>Diff {formatRating(instructor.avg_difficulty)}</span>
                            <span>({instructor.num_ratings} reviews)</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits */}
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white font-medium text-xs">{section.instruction_mode}</Badge>
                {section.is_asynchronous && <Badge className="bg-gray-600 text-white font-medium text-xs">Async</Badge>}
              </div>

              {/* Requirements */}
              {section.section_requisites && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Requirement:</span> {section.section_requisites}
                </p>
              )}
            </div>

            {/* Child Sections */}
            {children.length > 0 && (
              <div>
                <h6 className="font-semibold text-gray-900 text-sm mb-3">Associated Sections:</h6>
                <div className="space-y-2">
                  {children.map((child) => renderChildRow(child))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const renderChildRow = (hierarchical: HierarchicalSection) => {
    const { type, section } = hierarchical
    const primaryMeeting = section.meetings?.[0]

    return (
      <div key={section.section_id} className="ml-6 border rounded-lg p-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${getTypeColor(type)} border font-medium text-sm`}>
              {type}
            </Badge>
            <Badge className={`${getStatusColor(section.status)} border font-medium text-sm`}>
              {section.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Meeting Time - Child level only */}
            {primaryMeeting && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-red-600" />
                <span className="font-medium">
                  {primaryMeeting.meeting_days} {formatMeetingTime(primaryMeeting.start_time, primaryMeeting.end_time)}
                </span>
              </div>
            )}

            {/* Location - Child level only */}
            {primaryMeeting && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="font-medium">
                  {primaryMeeting.location || `${primaryMeeting.building_name} ${primaryMeeting.room}`}
                </span>
              </div>
            )}

            {/* Enrollment */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs">
                <Users className="h-3 w-3" />
                <span className="font-medium">{section.enrolled}/{section.capacity}</span>
              </div>
              {section.waitlist_total > 0 && (
                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium text-xs">
                  {section.waitlist_total} wait
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStandaloneSection = (hierarchical: HierarchicalSection) => {
    const { type, section } = hierarchical
    const primaryMeeting = section.meetings?.[0]
    const isExpanded = expandedSections.has(section.section_id)

    return (
      <Collapsible
        key={section.section_id}
        open={isExpanded}
        onOpenChange={() => toggleSection(section.section_id)}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full text-left border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
                <Badge className={`${getTypeColor(type)} border font-medium text-sm`}>
                  {type}
                </Badge>
                <Badge className={`${getStatusColor(section.status)} border font-medium text-sm`}>
                  {section.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                {/* Meeting Time */}
                {primaryMeeting && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {primaryMeeting.meeting_days} {formatMeetingTime(primaryMeeting.start_time, primaryMeeting.end_time)}
                    </span>
                  </div>
                )}

                {/* Location */}
                {primaryMeeting && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {primaryMeeting.location || `${primaryMeeting.building_name} ${primaryMeeting.room}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg p-4 bg-gray-50 space-y-3">
            {/* Instructors */}
            {section.instructors.length > 0 && (
              <div className="bg-white rounded p-3">
                <h6 className="font-semibold text-gray-900 text-sm mb-2">Instructors:</h6>
                <div className="space-y-2">
                  {section.instructors.map((instructor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
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
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-red-500 fill-current" />
                            <span>{formatRating(instructor.avg_rating)}</span>
                          </div>
                          <span>Diff {formatRating(instructor.avg_difficulty)}</span>
                          <span>({instructor.num_ratings} reviews)</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white font-medium text-xs">{section.instruction_mode}</Badge>
                {section.is_asynchronous && <Badge className="bg-gray-600 text-white font-medium text-xs">Async</Badge>}
              </div>

              {section.section_requisites && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Requirement:</span> {section.section_requisites}
                </p>
              )}

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{section.enrolled}/{section.capacity}</span>
                </div>
                {section.waitlist_total > 0 && (
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium text-xs">
                    {section.waitlist_total} waitlisted
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className="space-y-2">
      {hierarchy.map((hierarchical) => (
        <div key={hierarchical.section.section_id}>
          {hierarchical.type === "Lecture" && hierarchical.children.length > 0
            ? renderParentRow(hierarchical)
            : renderStandaloneSection(hierarchical)}
        </div>
      ))}
    </div>
  )
}
