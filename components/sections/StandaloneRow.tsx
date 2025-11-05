import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react"
import { StandaloneSection } from "./types"
import { getStatusColor, getDynamicSectionLabel, formatMeetingTime, formatMeetingDisplay } from "./utils"
import { StandaloneDetails } from "./SectionDetails"

interface StandaloneRowProps {
  standalone: StandaloneSection
  standaloneKey: string
  isExpanded: boolean
  onToggle: (key: string) => void
}

export function StandaloneRow({ standalone, standaloneKey, isExpanded, onToggle }: StandaloneRowProps) {
  return (
    <div className="border rounded-lg bg-white">
      <Collapsible open={isExpanded} onOpenChange={() => onToggle(standaloneKey)}>
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
                  {getDynamicSectionLabel(standalone.dynamicTypes)} {standalone.meetings[0]?.section_number || ""}
                </span>
              </div>

              <Badge className={`${getStatusColor(standalone.section.status)} border font-medium`}>
                {standalone.section.status}
              </Badge>

              {standalone.meetings.length > 0 && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {standalone.meetings[0].meeting_days} {formatMeetingTime(standalone.meetings[0].start_time, standalone.meetings[0].end_time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {standalone.meetings[0].location || `${standalone.meetings[0].building_name} ${standalone.meetings[0].room}`}
                    </span>
                  </div>
                </>
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
