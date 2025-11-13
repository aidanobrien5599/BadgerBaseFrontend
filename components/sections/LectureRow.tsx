import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react"
import { LectureSection, SectionGroup } from "./types"
import { getStatusColor, formatMeetingTime, getDynamicSectionLabel, formatMeetingDisplay } from "./utils"
import { LectureDetails, SectionDetails } from "./SectionDetails"
import { NotificationButton } from "@/components/notification-button"

interface LectureRowProps {
  lecture: LectureSection
  lectureKey: string
  isExpanded: boolean
  onToggle: (key: string) => void
  expandedSections: Set<string>
  onToggleSection: (key: string) => void
  aggregatedStatus: string
  courseTitle?: string
}

export function LectureRow({ 
  lecture, 
  lectureKey, 
  isExpanded, 
  onToggle, 
  expandedSections, 
  onToggleSection,
  aggregatedStatus,
  courseTitle
}: LectureRowProps) {
  return (
    <div className="border rounded-lg bg-white">
      <Collapsible open={isExpanded} onOpenChange={() => onToggle(lectureKey)}>
        <CollapsibleTrigger asChild>
          <div className="p-3 sm:p-4 cursor-pointer transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {/* Title and Status Row */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                )}
                <span className="font-bold text-gray-900 text-sm sm:text-lg truncate">
                  Lecture {lecture.lectureMeeting?.section_number || ""}
                </span>
                <Badge className={`${getStatusColor(aggregatedStatus)} font-medium flex-shrink-0 text-xs sm:text-sm`}>
                  {aggregatedStatus}
                </Badge>
              </div>

              {/* Meeting Details Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                  <span className="font-medium truncate">
                    {lecture.lectureMeeting.meeting_days} {formatMeetingTime(lecture.lectureMeeting.start_time, lecture.lectureMeeting.end_time)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                  <span className="font-medium truncate">
                    {lecture.lectureMeeting.location || `${lecture.lectureMeeting.building_name} ${lecture.lectureMeeting.room}`}
                  </span>
                </div>
              </div>

              {/* Notification button for lecture-only sections (no children) when closed */}
              {lecture.children.length === 0 && lecture.section.status.toUpperCase() === "CLOSED" && (
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                  <NotificationButton
                    type="section"
                    id={lecture.section.section_id}
                    isEnabled={lecture.section.status.toUpperCase() === "CLOSED"}
                    courseTitle={courseTitle}
                    sectionNames={[`LEC ${lecture.lectureMeeting?.section_number || ""}`]}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3">
            {/* Lecture-only details (if no children) */}
            {lecture.children.length === 0 && (
              <div className="p-4 rounded-lg mx-4 mb-4">
                <LectureDetails section={lecture.section} />
              </div>
            )}

            {/* Child Sections */}
            {lecture.children.map((child, childIndex) => {
              const childKey = `${lectureKey}-child-${childIndex}`
              const isChildExpanded = expandedSections.has(childKey)

              return (
                <div key={childKey} className="mx-4 pl-4 border-l-2 border-red-100">
                  <Collapsible className="border rounded-lg" open={isChildExpanded} onOpenChange={() => onToggleSection(childKey)}>
                    <CollapsibleTrigger asChild>
                      <div className="p-2 sm:p-3 cursor-pointer transition-colors bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          {/* Title and Status Row */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isChildExpanded ? (
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {getDynamicSectionLabel(child.types)} {child.meetings[0]?.section_number || ""}
                            </span>
                            <Badge className={`${getStatusColor(child.section.status)} border font-medium flex-shrink-0 text-xs`}>
                              {child.section.status}
                            </Badge>
                          </div>

                          {/* Meeting Details */}
                          <div className="text-xs sm:text-sm text-gray-700 flex-1 min-w-0 ml-5 sm:ml-4">
                            <span className="truncate block">
                              {formatMeetingDisplay(child.meetings)}
                            </span>
                          </div>

                          {/* Notification Button */}
                          {child.section.status.toUpperCase() === "CLOSED" && (
                            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                              <NotificationButton
                                type="section"
                                id={child.section.section_id}
                                isEnabled={child.section.status.toUpperCase() === "CLOSED"}
                                courseTitle={courseTitle}
                                sectionNames={[
                                  `LEC ${lecture.lectureMeeting?.section_number || ""}`,
                                  ...child.meetings.map(m => `${m.meeting_type} ${m.section_number}`)
                                ]}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-4 rounded-lg">
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
}
