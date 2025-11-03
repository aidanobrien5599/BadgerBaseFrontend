import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { StandaloneSection } from "./types"
import { getStatusColor, getDynamicSectionLabel, formatMeetingDisplay } from "./utils"
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
          <div className="p-4 rounded-lg border mx-4 mb-4">
            <StandaloneDetails section={standalone.section} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
