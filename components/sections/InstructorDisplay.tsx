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
 * - BadgerBase theming with semantic token backgrounds
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
        <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-2 bg-muted rounded border">
          <span className="font-medium text-foreground text-xs sm:text-sm min-w-0 truncate">
            {instructor.rmp_instructor_id ? (
              <a
                target="_blank"
                className="hover:text-primary hover:underline truncate block"
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
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-current flex-shrink-0" />
                <span className="font-semibold text-foreground whitespace-nowrap">
                  {formatRating(instructor.avg_rating)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60 flex-shrink-0"></div>
                <span className="text-muted-foreground whitespace-nowrap">
                  Difficulty {formatRating(instructor.avg_difficulty)}
                </span>
              </div>
              <span className="text-muted-foreground whitespace-nowrap">
                ({instructor.num_ratings} reviews)
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
