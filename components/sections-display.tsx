"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Users, Clock, MapPin, Star, Calendar, ChevronDown } from "lucide-react"

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

  const groupSectionsByLecture = (sects: Section[]) => {
    const grouped: { [key: number]: { lecture: Section; discussions: Section[] } } = {}
    const nonTiered: Section[] = []

    sects.forEach((section) => {
      const lectureMeeting = section.meetings?.find((m) => m.meeting_type.toUpperCase() === "LEC")

      if (lectureMeeting) {
        // This section has a lecture
        const lectureId = section.section_id
        if (!grouped[lectureId]) {
          grouped[lectureId] = { lecture: section, discussions: [] }
        }
      } else {
        // Non-tiered section (no lecture)
        nonTiered.push(section)
      }
    })

    // Also group discussions/labs with their lectures
    sects.forEach((section) => {
      const lectureMeeting = section.meetings?.find((m) => m.meeting_type.toUpperCase() === "LEC")
      if (!lectureMeeting) {
        // This is a discussion/lab - find its parent lecture
        // In a real scenario, we'd have a parent_section_id field
        // For now, we'll check if this is a discussion/lab without a lecture
        const hasDissOrLab = section.meetings?.some((m) => ["DIS", "LAB", "SEM"].includes(m.meeting_type.toUpperCase()))
        if (hasDissOrLab && Object.keys(grouped).length > 0) {
          // Try to associate with the first lecture (this would need better logic with parent IDs)
          nonTiered.push(section)
        }
      }
    })

    return { grouped, nonTiered }
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

  const getMeetingTypeLabel = (type: string) => {
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
        return type
    }
  }

  const filteredSections = filterSections(sections)
  const { grouped, nonTiered } = groupSectionsByLecture(filteredSections)

  if (filteredSections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
        No sections match the current filters.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([_, { lecture, discussions }]) => (
        <Collapsible
          key={lecture.section_id}
          open={expandedSections.has(lecture.section_id)}
          onOpenChange={() => toggleSection(lecture.section_id)}
        >
          {/* Lecture Header Row - Compact Display */}
          <CollapsibleTrigger asChild>
            <button className="w-full text-left border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                {/* Section ID and Status */}
                <div className="flex items-center gap-3 min-w-fit">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform ${
                      expandedSections.has(lecture.section_id) ? "rotate-180" : ""
                    }`}
                  />
                  <span className="font-semibold text-gray-900">Section {lecture.section_id}</span>
                  <Badge className={`${getStatusColor(lecture.status)} border font-medium text-xs`}>
                    {lecture.status}
                  </Badge>
                </div>

                {/* Meeting Times - Compact */}
                <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
                  {lecture.meetings
                    ?.filter((m) => m.meeting_type.toUpperCase() === "LEC")
                    .map((meeting, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {meeting.meeting_days} {formatMeetingTime(meeting.start_time, meeting.end_time)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Location - Compact */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {lecture.meetings
                    ?.filter((m) => m.meeting_type.toUpperCase() === "LEC")
                    .map((meeting, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">
                          {meeting.location || `${meeting.building_name} ${meeting.room}`}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Enrollment Info - Right Aligned */}
                <div className="flex items-center gap-2 ml-auto text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium text-xs">
                      {lecture.enrolled}/{lecture.capacity}
                    </span>
                  </div>
                  {lecture.waitlist_total > 0 && (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium text-xs">
                      {lecture.waitlist_total} wait
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Expandable Details */}
          <CollapsibleContent>
            <div className="border border-t-0 rounded-b-lg p-4 bg-gray-50 space-y-4">
              {/* Mode and Async Badge */}
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white font-medium text-xs">{lecture.instruction_mode}</Badge>
                {lecture.is_asynchronous && <Badge className="bg-gray-600 text-white font-medium text-xs">Async</Badge>}
              </div>

              {/* Section Requisites */}
              {lecture.section_requisites && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Requirement:</span> {lecture.section_requisites}
                </p>
              )}

              {/* Meeting Times (Expanded) */}
              {lecture.meetings && lecture.meetings.length > 0 && (
                <div>
                  <h6 className="font-bold mb-2 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    Meeting Times
                  </h6>
                  <div className="space-y-2">
                    {lecture.meetings.map((meeting, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-white rounded text-sm">
                        <div className="font-semibold text-gray-900">{getMeetingTypeLabel(meeting.meeting_type)}</div>
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
              {lecture.instructors.length > 0 && (
                <div>
                  <h6 className="font-bold mb-2 text-sm text-gray-900">Instructors:</h6>
                  <div className="space-y-2">
                    {lecture.instructors.map((instructor, idx) => (
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
            </div>

            {/* Discussion/Lab Sections */}
            {discussions.length > 0 && (
              <div className="border border-t-0 border-l-4 border-l-red-300 rounded-b-lg p-4 bg-white space-y-2">
                <h6 className="font-semibold text-gray-900 text-sm mb-3">Associated Sections:</h6>
                {discussions.map((section) => (
                  <div key={section.section_id} className="border rounded p-3 bg-gray-50 text-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {section.meetings?.[0]?.meeting_type
                            ? getMeetingTypeLabel(section.meetings[0].meeting_type)
                            : "Section"}{" "}
                          {section.section_id}
                        </span>
                        <Badge className={`${getStatusColor(section.status)} border font-medium text-xs`}>
                          {section.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        {section.meetings?.map((meeting, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3 text-red-600" />
                            <span>
                              {meeting.meeting_days} {formatMeetingTime(meeting.start_time, meeting.end_time)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-gray-700 text-xs ml-auto">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">
                          {section.enrolled}/{section.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {nonTiered.map((section) => (
        <Collapsible
          key={section.section_id}
          open={expandedSections.has(section.section_id)}
          onOpenChange={() => toggleSection(section.section_id)}
        >
          <CollapsibleTrigger asChild>
            <button className="w-full text-left border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                <div className="flex items-center gap-3 min-w-fit">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform ${
                      expandedSections.has(section.section_id) ? "rotate-180" : ""
                    }`}
                  />
                  <span className="font-semibold text-gray-900">
                    {section.meetings?.[0]?.meeting_type
                      ? getMeetingTypeLabel(section.meetings[0].meeting_type)
                      : "Section"}{" "}
                    {section.section_id}
                  </span>
                  <Badge className={`${getStatusColor(section.status)} border font-medium text-xs`}>
                    {section.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
                  {section.meetings?.map((meeting, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">
                        {meeting.meeting_days} {formatMeetingTime(meeting.start_time, meeting.end_time)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  {section.meetings?.map((meeting, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">
                        {meeting.location || `${meeting.building_name} ${meeting.room}`}
                      </span>
                    </div>
                  ))}
                </div>
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
            <div className="border border-t-0 rounded-b-lg p-4 bg-gray-50 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600 text-white font-medium text-xs">{section.instruction_mode}</Badge>
                {section.is_asynchronous && <Badge className="bg-gray-600 text-white font-medium text-xs">Async</Badge>}
              </div>
              {section.section_requisites && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Requirement:</span> {section.section_requisites}
                </p>
              )}
              {section.meetings && section.meetings.length > 0 && (
                <div>
                  <h6 className="font-bold mb-2 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    Meeting Times
                  </h6>
                  <div className="space-y-2">
                    {section.meetings.map((meeting, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-white rounded text-sm">
                        <div className="font-semibold text-gray-900">{getMeetingTypeLabel(meeting.meeting_type)}</div>
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
