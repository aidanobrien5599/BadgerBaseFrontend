"use client"

import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { PaginationControls } from "./pagination-controls"
import { loadSearchState, encodeSearchStateToQuery } from "@/lib/search-state"

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

interface Course {
  course_id: number
  subject_code: string
  course_designation: string
  full_course_designation: string
  minimum_credits: number
  maximum_credits: number
  level: string
  cumulative_gpa: number
  most_recent_gpa: number
  median_grade: string
  a_percent: number
  ab_percent: number
  b_percent: number
  bc_percent: number
  c_percent: number
  d_percent: number
  f_percent: number
  ethnic_studies: string | null
  social_science: string | null
  humanities: string | null
  biological_science: string | null
  physical_science: string | null
  natural_science: string | null
  literature: string | null
  course_title: string
  course_description: string | null
  enrollment_prerequisites: string | null
  sections: Section[]
  madgrades_course_uuid: string
  general_education: string | null
  typically_offered: string | null
  workplace_experience_description: string | null
  repeatable_for_credit: string | null
  status: number // 0 = closed/full, 1 = waitlist, 2 = open
}

interface CourseTableProps {
  courses: Course[]
  currentPage: number
  totalPages: number
  totalCount: number
  hasMore: boolean
  onPageChange: (page: number) => void
  resultsPerPage: number
  currentSort: string
  onSortChange: (sort: string) => void
  view: "sidebar" | "band"
  onViewChange: (view: "sidebar" | "band") => void
}

const getStatusBadge = (status: number) => {
  switch (status) {
    case 2:
      return { label: "Open", classes: "bg-success/10 text-success-foreground border-success/30" }
    case 1:
      return { label: "Waitlist", classes: "bg-warning/10 text-warning-foreground border-warning/30" }
    default:
      return { label: "Closed", classes: "bg-destructive/10 text-destructive border-destructive/30" }
  }
}

export function CourseTable({
  courses,
  currentPage,
  totalPages,
  totalCount,
  hasMore,
  onPageChange,
  resultsPerPage,
  currentSort,
  onSortChange,
  view,
  onViewChange,
}: CourseTableProps) {
  const router = useRouter()

  const openCourse = (course: Course) => {
    const saved = loadSearchState()
    const query = saved ? `?bb=${encodeSearchStateToQuery(saved)}` : ""
    router.push(`/course/${encodeURIComponent(course.course_designation)}${query}`)
  }

  if (courses.length === 0) {
    return (
      <div className="border-b border-border/70">
        <div className="py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">No courses found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        hasMore={hasMore}
        onPageChange={onPageChange}
        resultsPerPage={resultsPerPage}
        currentSort={currentSort}
        onSortChange={onSortChange}
        view={view}
        onViewChange={onViewChange}
      />

      <div>
        {courses.map((course, index) => {
          const statusBadge = getStatusBadge(course.status)
          const rowNumber = (currentPage - 1) * resultsPerPage + index + 1
          const designationMatch = course.course_designation.match(/^(\D+)\s*(.+)$/)
          const designationSubject = designationMatch ? designationMatch[1].trim() : course.course_designation
          const designationNumber = designationMatch ? designationMatch[2].trim() : ""

          return (
            <div key={course.course_id} className="border-b border-border/70">
              {/* Ledger row */}
              <div className="overflow-x-auto">
              <div
                role="button"
                tabIndex={0}
                onClick={() => openCourse(course)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    openCourse(course)
                  }
                }}
                className={`grid grid-cols-[44px_minmax(160px,240px)_repeat(5,minmax(0,1fr))_30px] min-w-[720px] items-stretch cursor-pointer transition-colors hover:bg-surface-sunken`}
              >
                {/* Row index */}
                <div className="flex items-center justify-center font-mono text-[11px] font-semibold text-primary border-r border-border/70">
                  {rowNumber.toString().padStart(2, "0")}
                </div>

                {/* Designation + title + instructor */}
                <div className="flex flex-col justify-center items-center text-center gap-0.5 px-4 border-r border-border/70 min-w-0">
                  <div className="font-display text-[17px] font-bold tracking-[-0.01em] truncate max-w-full">
                    <span className="text-primary">{designationSubject}</span>{" "}
                    {designationNumber}
                  </div>
                  <div className="text-[13.5px] text-foreground font-medium leading-snug truncate max-w-full">
                    {course.course_title}
                  </div>
                </div>

                {/* Credits */}
                <div className="flex flex-col justify-center items-center text-center px-3 border-r border-border/70">
                  <span className="font-display text-lg font-bold leading-none">
                    {course.minimum_credits === course.maximum_credits
                      ? course.minimum_credits
                      : `${course.minimum_credits}-${course.maximum_credits}`}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Credits
                  </span>
                </div>

                {/* Median grade */}
                <div className="flex flex-col justify-center items-center text-center px-3 border-r border-border/70">
                  {course.median_grade ? (
                    <span className="font-display text-lg font-bold leading-none tabular-nums">
                      {course.median_grade}
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-muted-foreground leading-none">N/A</span>
                  )}
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Median
                  </span>
                </div>

                {/* Cumulative GPA */}
                <div className="flex flex-col justify-center items-center text-center px-3 border-r border-border/70">
                  <span className="font-display text-lg font-bold leading-none tabular-nums">
                    {course.cumulative_gpa ? course.cumulative_gpa.toFixed(2) : "N/A"}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Cum GPA
                  </span>
                </div>

                {/* Recent GPA */}
                <div className="flex flex-col justify-center items-center text-center px-3 border-r border-border/70">
                  <span className="font-display text-lg font-bold leading-none tabular-nums">
                    {course.most_recent_gpa ? course.most_recent_gpa.toFixed(2) : "N/A"}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Recent
                  </span>
                </div>

                {/* Status badge — last stat before chevron */}
                <div className="flex items-center justify-center px-3">
                  <Badge variant="outline" className={`${statusBadge.classes} font-semibold text-[11.5px] rounded-[4px]`}>
                    {statusBadge.label}
                  </Badge>
                </div>

                {/* Chevron */}
                <div className="flex items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}