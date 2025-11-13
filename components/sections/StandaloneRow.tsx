import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react"
import { StandaloneSection } from "./types"
import { getStatusColor, getDynamicSectionLabel, formatMeetingTime, formatMeetingDisplay } from "./utils"
import { StandaloneDetails } from "./SectionDetails"
import { NotificationButton } from "@/components/notification-button"

interface StandaloneRowProps {
  standalone: StandaloneSection
  standaloneKey: string
  isExpanded: boolean
  onToggle: (key: string) => void
  courseTitle?: string
}

export function StandaloneRow({ standalone, standaloneKey, isExpanded, onToggle, courseTitle }: StandaloneRowProps) {
  return (
    <div className="border rounded-lg bg-white">
      <Collapsible open={isExpanded} onOpenChange={() => onToggle(standaloneKey)}>
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
                  {getDynamicSectionLabel(standalone.dynamicTypes)} {standalone.meetings[0]?.section_number || ""}
                </span>
                <Badge className={`${getStatusColor(standalone.section.status)} border font-medium flex-shrink-0 text-xs sm:text-sm`}>
                  {standalone.section.status}
                </Badge>
              </div>

              {/* Meeting Details Row */}
              {standalone.meetings.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {standalone.meetings[0].meeting_days} {formatMeetingTime(standalone.meetings[0].start_time, standalone.meetings[0].end_time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {standalone.meetings[0].location || `${standalone.meetings[0].building_name} ${standalone.meetings[0].room}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Notification Button */}
              {standalone.section.status.toUpperCase() === "CLOSED" && (
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                  <NotificationButton
                    type="section"
                    id={standalone.section.section_id}
                    isEnabled={standalone.section.status.toUpperCase() === "CLOSED"}
                    courseTitle={courseTitle}
                    sectionNames={standalone.meetings.map(m => `${m.meeting_type} ${m.section_number}`)}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 rounded-lg mx-4 mb-4">
            <StandaloneDetails section={standalone.section} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
