"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
  MapPin,
  Star,
  Calendar,
} from "lucide-react"

// Type definitions
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

// Grouped section types for hierarchy
interface LectureSection {
  type: "lecture"
  section: Section
  lectureMeeting: Meeting
  children: SectionGroup[]
}

interface SectionGroup {
  types: string[]
  title: string
  section: Section
  meetings: Meeting[]
  instructorsByType: Record<string, Instructor[]>
}

interface StandaloneSection {
  type: "standalone"
  section: Section
  meetings: Meeting[]
  dynamicTypes: string[]
}

type HierarchicalSection = LectureSection | StandaloneSection

interface HierarchicalSectionsProps {
  sections: Section[]
}

export function HierarchicalSections({ sections }: HierarchicalSectionsProps) {
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Helper functions
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

  const formatMeetingTime = (startTime: string, endTime: string) => {
    return `${startTime}–${endTime}`
  }

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  const formatMeetingDisplay = (meetings: Meeting[]) => {
    return meetings.map(meeting => 
      `${meeting.meeting_days} ${formatMeetingTime(meeting.start_time, meeting.end_time)} (${meeting.location || `${meeting.building_name} ${meeting.room}`})`
    ).join(", ")
  }

  const getDynamicSectionLabel = (types: string[]) => {
    if (types.length === 0) return "Section"
    if (types.length === 1) return getMeetingTypeLabel(types[0])
    return types.map(getMeetingTypeLabel).join(" + ")
  }

  // Group sections into hierarchy
  const groupSections = (): HierarchicalSection[] => {
    const lectureMap = new Map<string, LectureSection>()
    const standaloneSection: StandaloneSection[] = []

    sections.forEach(section => {
      const lectureMeeting = section.meetings?.find(m => m.meeting_type.toUpperCase() === "LEC")
      
      if (lectureMeeting) {
        // This section has a lecture - create lecture group
        const lectureKey = `lecture-${section.section_id}`
        
        lectureMap.set(lectureKey, {
          type: "lecture",
          section,
          lectureMeeting,
          children: []
        })

        // Group non-lecture meetings as children
        const nonLectureMeetings = section.meetings?.filter(m => m.meeting_type.toUpperCase() !== "LEC") || []
        if (nonLectureMeetings.length > 0) {
          // Group by meeting type combinations within the same section
          const types = [...new Set(nonLectureMeetings.map(m => m.meeting_type))]
          const instructorsByType: Record<string, Instructor[]> = {}
          
          // Assign all instructors to all types (could be refined with more specific data)
          types.forEach(type => {
            instructorsByType[type.toUpperCase()] = section.instructors
          })

          lectureMap.get(lectureKey)!.children.push({
            types,
            title: section.section_id.toString(),
            section,
            meetings: nonLectureMeetings,
            instructorsByType
          })
        }
      } else {
        // No lecture - this is a standalone section (discussion-only, lab-only, etc.)
        const meetingTypes = [...new Set(section.meetings?.map(m => m.meeting_type) || [])]
        standaloneSection.push({
          type: "standalone",
          section,
          meetings: section.meetings || [],
          dynamicTypes: meetingTypes
        })
      }
    })

    return [...Array.from(lectureMap.values()), ...standaloneSection]
  }

  const toggleLecture = (sectionId: number) => {
    const newExpanded = new Set(expandedLectures)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedLectures(newExpanded)
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const hierarchicalSections = groupSections()

  if (hierarchicalSections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
        No sections available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hierarchicalSections.map((hierarchicalSection, index) => {
        if (hierarchicalSection.type === "lecture") {
          const lecture = hierarchicalSection as LectureSection
          const isLectureExpanded = expandedLectures.has(lecture.section.section_id)

          return (
            <div key={`lecture-${lecture.section.section_id}`} className="border rounded-lg bg-white">
              {/* Lecture Row */}
              <Collapsible
                open={isLectureExpanded}
                onOpenChange={() => toggleLecture(lecture.section.section_id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors border-b border-red-100">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {isLectureExpanded ? (
                          <ChevronDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-bold text-gray-900 text-lg">
                          Lecture 
                        </span>
                      </div>

                      <Badge className={`${getStatusColor(lecture.section.status)} border font-medium`}>
                        {lecture.section.status}
                      </Badge>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                          {lecture.lectureMeeting.meeting_days} {formatMeetingTime(lecture.lectureMeeting.start_time, lecture.lectureMeeting.end_time)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                          {lecture.lectureMeeting.location || `${lecture.lectureMeeting.building_name} ${lecture.lectureMeeting.room}`}
                        </span>
                      </div>
                    </div>

                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3">
                    {/* Lecture-only details (if no children) */}
                    {lecture.children.length === 0 && (
                      <div className="ml-6 p-4 bg-gray-50 rounded-lg border">
                        <LectureDetails section={lecture.section} />
                      </div>
                    )}

                    {/* Child Sections */}
                    {lecture.children.map((child, childIndex) => {
                      const childKey = `${lecture.section.section_id}-child-${childIndex}`
                      const isChildExpanded = expandedSections.has(childKey)

                      return (
                        <div key={childKey} className="ml-4 pl-4 border-l-2 border-red-100">
                          <Collapsible
                            open={isChildExpanded}
                            onOpenChange={() => toggleSection(childKey)}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-red-50 transition-colors border rounded-lg bg-white">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    {isChildExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-red-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="font-medium text-gray-900">
                                      {getDynamicSectionLabel(child.types)} 
                                    </span>
                                  </div>

                                  <div className="text-sm text-gray-700 flex-1 ml-4">
                                    {formatMeetingDisplay(child.meetings)}
                                  </div>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                                <SectionDetails section={child.section} />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        } else {
          // Standalone section
          const standalone = hierarchicalSection as StandaloneSection
          const standaloneKey = `standalone-${standalone.section.section_id}`
          const isStandaloneExpanded = expandedSections.has(standaloneKey)

          return (
            <div key={standaloneKey} className="border rounded-lg bg-white">
              <Collapsible
                open={isStandaloneExpanded}
                onOpenChange={() => toggleSection(standaloneKey)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        {isStandaloneExpanded ? (
                          <ChevronDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-bold text-gray-900 text-lg">
                          {getDynamicSectionLabel(standalone.dynamicTypes)} {standalone.section.section_id}
                        </span>
                      </div>

                      <Badge className={`${getStatusColor(standalone.section.status)} border font-medium`}>
                        {standalone.section.status}
                      </Badge>

                      <div className="text-sm text-gray-700 font-medium flex-1 ml-4">
                        {formatMeetingDisplay(standalone.meetings)}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 bg-gray-50 rounded-lg border mx-4 mb-4">
                    <StandaloneDetails section={standalone.section} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        }
      })}
    </div>
  )
}

// Component for lecture-only details
function LectureDetails({ section }: { section: Section }) {
  return (
    <div className="space-y-3">
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900">Instructors:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}
      
      {section.section_requisites && (
        <div>
          <span className="font-semibold text-gray-900">Notes:</span>
          <span className="ml-2 text-gray-700">{section.section_requisites}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-red-600" />
        <span className="font-semibold text-gray-900">Enrollment:</span>
        <span className="text-gray-700">{section.enrolled}/{section.capacity}</span>
      </div>
    </div>
  )
}

// Component for section details (child sections)
function SectionDetails({ 
  section 
}: { 
  section: Section
}) {
  return (
    <div className="space-y-3">
      {/* All instructors together */}
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900">Instructors:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}

      {section.section_requisites && (
        <div>
          <span className="font-semibold text-gray-900">Notes:</span>
          <span className="ml-2 text-gray-700">{section.section_requisites}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-red-600" />
        <span className="font-semibold text-gray-900">Enrollment:</span>
        <span className="text-gray-700">{section.enrolled}/{section.capacity}</span>
      </div>
    </div>
  )
}

// Component for standalone section details
function StandaloneDetails({ section }: { section: Section }) {
  return (
    <div className="space-y-3">
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900">Instructor:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}

      {section.section_requisites && (
        <div>
          <span className="font-semibold text-gray-900">Notes:</span>
          <span className="ml-2 text-gray-700">{section.section_requisites}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-red-600" />
        <span className="font-semibold text-gray-900">Enrollment:</span>
        <span className="text-gray-700">{section.enrolled}/{section.capacity}</span>
      </div>
    </div>
  )
}

// Reusable instructor display component
function InstructorDisplay({ instructors }: { instructors: Instructor[] }) {
  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  return (
    <div className="space-y-2">
      {instructors.map((instructor, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
          <span className="font-medium text-gray-900">
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
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-red-500 fill-current" />
                <span className="font-semibold text-gray-900">
                  {formatRating(instructor.avg_rating)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <span className="text-gray-700">
                  Difficulty {formatRating(instructor.avg_difficulty)}
                </span>
              </div>
              <span className="text-gray-500">
                ({instructor.num_ratings} reviews)
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getMeetingTypeLabel(type: string) {
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
