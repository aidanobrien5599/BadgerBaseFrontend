import { Users } from "lucide-react"
import { Section } from "./types"
import { InstructorDisplay } from "./InstructorDisplay"

interface SectionDetailsProps {
  section: Section
}

// Component for lecture-only details
export function LectureDetails({ section }: SectionDetailsProps) {
  return (
    <div className="space-y-3 mt-2 mt-[-20px]">
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900 text-sm sm:text-base">Instructors:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}
      
      {section.section_requisites && (
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-gray-900">Requisites:</span>
          <span className="ml-2 text-gray-700 break-words">{section.section_requisites}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
        <span className="font-semibold text-gray-900">Enrollment:</span>
        <span className="text-gray-700">{section.enrolled}/{section.capacity}</span>
      </div>
    </div>
  )
}

// Component for section details (child sections)
export function SectionDetails({ section }: SectionDetailsProps) {
  return (
    <div className="space-y-3 mt-[-20px]">
      {/* All instructors together */}
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900 text-sm sm:text-base">Instructors:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}

      {section.section_requisites && (
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-gray-900">Requisites:</span>
          <span className="ml-2 text-gray-700 break-words">{section.section_requisites}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
        <span className="font-semibold text-gray-900">Enrollment:</span>
        <span className="text-gray-700">{section.enrolled}/{section.capacity}</span>
      </div>
    </div>
  )
}

// Component for standalone section details
export function StandaloneDetails({ section }: SectionDetailsProps) {
  return (
    <div className="space-y-3  mt-[-20px]">
      {section.instructors.length > 0 && (
        <div>
          <h6 className="font-bold mb-2 text-gray-900">Instructors:</h6>
          <InstructorDisplay instructors={section.instructors} />
        </div>
      )}

      {section.section_requisites && (
        <div>
          <span className="font-semibold text-gray-900">Requisites:</span>
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
