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
}

export function LectureRow({ 
  lecture, 
  lectureKey, 
  isExpanded, 
  onToggle, 
  expandedSections, 
  onToggleSection,
  aggregatedStatus 
}: LectureRowProps) {
  return (
    <div className="border rounded-lg bg-white">
      <Collapsible open={isExpanded} onOpenChange={() => onToggle(lectureKey)}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-red-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-red-600" />
                )}
                <span className="font-bold text-gray-900 text-lg">
                  Lecture {lecture.lectureMeeting?.section_number || ""}
                </span>
              </div>

              <Badge className={`${getStatusColor(aggregatedStatus)} font-medium`}>
                {aggregatedStatus}
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

              {/* Notification button for lecture-only sections (no children) when closed */}
              {lecture.children.length === 0 && lecture.section.status.toUpperCase() === "CLOSED" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <NotificationButton
                    type="section"
                    id={lecture.section.section_id}
                    isEnabled={lecture.section.status.toUpperCase() === "CLOSED"}
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
                      <div className="flex items-center justify-between p-3 cursor-pointer transition-colors bg-white">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {isChildExpanded ? (
                              <ChevronDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">
                              {getDynamicSectionLabel(child.types)} {child.meetings[0]?.section_number || ""}
                            </span>
                          </div>

                          <Badge className={`${getStatusColor(child.section.status)} border font-medium`}>
                            {child.section.status}
                          </Badge>

                          <div className="text-sm text-gray-700 flex-1 ml-4">
                            {formatMeetingDisplay(child.meetings)}
                          </div>

                          {child.section.status.toUpperCase() === "CLOSED" && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <NotificationButton
                                type="section"
                                id={child.section.section_id}
                                isEnabled={child.section.status.toUpperCase() === "CLOSED"}
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
