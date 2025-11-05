/**
 * Instructor display component
 * 
 * Renders a list of instructors with their ratings and RateMyProfessors links.
 * Each instructor is displayed in a card format with optional rating information.
 * 
 * Features:
 * - Links to RateMyProfessors profiles when available
 * - Displays ratings, difficulty, and review counts
 * - Responsive design with proper spacing
 * - BadgerBase theming with gray backgrounds
 */

import { Star } from "lucide-react"
import { Instructor } from "./types"
import { formatRating } from "./utils"

interface InstructorDisplayProps {
  /** Array of instructors to display */
  instructors: Instructor[]
}

/**
 * Displays a list of instructors with ratings and links
 * @param instructors - Array of instructor objects to display
 */
export function InstructorDisplay({ instructors }: InstructorDisplayProps) {
  return (
    <div className="space-y-2">
      {instructors.map((instructor, idx) => (
        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
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
