"use client"

import { Badge } from "@/components/ui/badge"
import {
  Users,
  ChevronRight,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  GraduationCap,
  Filter,
} from "lucide-react"
import { useState } from "react"
import { PaginationControls } from "./pagination-controls"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { NotificationButton } from "./notification-button"
import { HierarchicalSections } from "./sections"
import { colors, typography } from "@/lib/tokens"
import { getGradeColor } from "@/components/sections/utils"

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
}: CourseTableProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())
  const [hideClosedSections, setHideClosedSections] = useState(false)
  const [hideWaitlistedSections, setHideWaitlistedSections] = useState(false)

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const filterSections = (sections: Section[]) => {
    return sections.filter((section) => {
      if (hideClosedSections && section.status.toUpperCase() === "CLOSED") {
        return false
      }
      if (hideWaitlistedSections && section.status.toUpperCase() === "WAITLISTED") {
        return false
      }
      return true
    })
  }

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "A":
        return { text: "Advanced", icon: GraduationCap }
      case "I":
        return { text: "Intermediate", icon: BookOpen }
      default:
        return { text: "Elementary", icon: Award }
    }
  }

  const getGradeChartData = (course: Course) => {
    return [
      {
        grade: "A",
        percentage: Math.round((course.a_percent || 0) * 100),
        fill: colors.red[600],
      },
      {
        grade: "AB",
        percentage: Math.round((course.ab_percent || 0) * 100),
        fill: colors.red[500],
      },
      {
        grade: "B",
        percentage: Math.round((course.b_percent || 0) * 100),
        fill: colors.red[400],
      },
      {
        grade: "BC",
        percentage: Math.round((course.bc_percent || 0) * 100),
        fill: colors.red[300],
      },
      {
        grade: "C",
        percentage: Math.round((course.c_percent || 0) * 100),
        fill: colors.red[200],
      },
      {
        grade: "D",
        percentage: Math.round((course.d_percent || 0) * 100),
        fill: colors.red[100],
      },
      {
        grade: "F",
        percentage: Math.round((course.f_percent || 0) * 100),
        fill: colors.red[800],
      },
    ]
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
      />

      <div>
        {courses.map((course, index) => {
          const filteredSections = filterSections(course.sections)
          const isExpanded = expandedCourses.has(course.course_id)
          const statusBadge = getStatusBadge(course.status)
          const levelInfo = getLevelInfo(course.level)
          const LevelIcon = levelInfo.icon
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
                onClick={() => toggleCourse(course.course_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleCourse(course.course_id)
                  }
                }}
                className={`grid grid-cols-[44px_minmax(280px,1fr)_84px_repeat(3,78px)_108px_30px] min-w-[780px] items-stretch cursor-pointer transition-colors ${
                  isExpanded ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                }`}
              >
                {/* Row index */}
                <div className="flex items-center justify-center font-mono text-[11px] font-semibold text-primary border-r border-border/70">
                  {rowNumber.toString().padStart(2, "0")}
                </div>

                {/* Designation + title + instructor */}
                <div className="flex flex-col justify-center gap-0.5 px-4 border-r border-border/70 min-w-0">
                  <div className="font-display text-[17px] font-bold tracking-[-0.01em]">
                    <span className="text-primary">{designationSubject}</span>{" "}
                    {designationNumber}
                  </div>
                  <div className="text-[13.5px] text-foreground font-medium leading-snug truncate">
                    {course.course_title}
                  </div>
                </div>

                {/* Credits */}
                <div className="flex flex-col justify-center px-3 border-r border-border/70">
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
                <div className="flex flex-col justify-center px-3 border-r border-border/70">
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
                <div className="flex flex-col justify-center px-3 border-r border-border/70">
                  <span className="font-display text-lg font-bold leading-none tabular-nums">
                    {course.cumulative_gpa ? course.cumulative_gpa.toFixed(2) : "N/A"}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Cum GPA
                  </span>
                </div>

                {/* Recent GPA */}
                <div className="flex flex-col justify-center px-3 border-r border-border/70">
                  <span className="font-display text-lg font-bold leading-none tabular-nums">
                    {course.most_recent_gpa ? course.most_recent_gpa.toFixed(2) : "N/A"}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                    Recent
                  </span>
                </div>

                {/* Status badge */}
                <div className="flex items-center px-3">
                  <Badge variant="outline" className={`${statusBadge.classes} font-semibold text-[11.5px]`}>
                    {statusBadge.label}
                  </Badge>
                </div>

                {/* Chevron */}
                <div className="flex items-center justify-center">
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-90 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
              </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="bg-surface px-5 py-5 border-t border-border/70">
                  <div className="flex flex-col gap-4">
                    {/* Title + description + actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <a
                          href={`https://public.enroll.wisc.edu/search?keywords=${encodeURIComponent(course.course_designation)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-xl font-bold text-foreground hover:text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {course.course_title}
                        </a>
                        {course.course_description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                            {course.course_description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <a
                          target="_blank"
                          href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                          className="font-mono text-[11px] text-primary hover:underline"
                          rel="noreferrer"
                        >
                          Madgrades ↗
                        </a>
                        {course.status === 0 && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <NotificationButton
                              type="course"
                              id={course.course_id}
                              isEnabled={course.status === 0}
                              courseTitle={course.course_title}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {course.enrollment_prerequisites && course.enrollment_prerequisites !== "None" && (
                      <div className="bg-surface-sunken border border-dashed border-border/80 rounded-md px-4 py-3">
                        <p className="font-mono text-[11px] text-foreground">
                          <span className="flex items-center gap-2 mb-1">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            Prerequisites
                          </span>
                          <span className="text-muted-foreground">{course.enrollment_prerequisites}</span>
                        </p>
                      </div>
                    )}

                    {/* Meta strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
                          {course.minimum_credits === course.maximum_credits
                            ? `${course.minimum_credits} cr`
                            : `${course.minimum_credits}-${course.maximum_credits} cr`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LevelIcon className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
                          {levelInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Star className="h-4 w-4 text-primary" />
                        {course.median_grade ? (
                          <Badge className={`${getGradeColor(course.median_grade)} font-semibold`}>
                            {course.median_grade}
                          </Badge>
                        ) : (
                          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
                          {course.sections.length} sec
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <a
                          target="_blank"
                          href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                          className="text-primary font-mono font-bold hover:text-primary/80 hover:underline"
                          rel="noreferrer"
                        >
                          {course.cumulative_gpa?.toFixed(2) || "N/A"}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em]">
                          {course.most_recent_gpa?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Course attributes */}
                    {((course.workplace_experience_description && course.workplace_experience_description !== "STUDENT OPT") ||
                      course.repeatable_for_credit === "Y" ||
                      (course.typically_offered && course.typically_offered !== "Not Applicable")) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {course.workplace_experience_description &&
                          course.workplace_experience_description !== "STUDENT OPT" && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border/70 rounded px-2 py-1">
                              Workplace Experience
                            </span>
                          )}
                        {course.repeatable_for_credit === "Y" && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border/70 rounded px-2 py-1">
                            Repeatable
                          </span>
                        )}
                        {course.typically_offered && course.typically_offered !== "Not Applicable" && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground border border-border/70 rounded px-2 py-1">
                            {course.typically_offered}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Grade Distribution Chart */}
                    <div className="bg-surface border border-border/70 rounded-lg p-5">
                      <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Grade Distribution
                      </h4>
                      <ChartContainer
                        config={{
                          percentage: {
                            label: "Percentage",
                          },
                        }}
                        className="h-[220px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getGradeChartData(course)}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <XAxis
                              dataKey="grade"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: typography.sm, fontWeight: 600, fill: colors.gray[700] }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: typography.xs, fill: colors.gray[700] }}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value, name) => [`${value}%`, "Students"]}
                              labelFormatter={(label) => `Grade: ${label}`}
                            />
                            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Sections */}
                    <div className="bg-surface border border-border/70 rounded-lg">
                      <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-b border-border/70">
                        <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Sections
                          <span className="font-mono text-[10px] font-semibold text-primary">
                            {filteredSections.length}
                          </span>
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Filter:</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={hideClosedSections}
                              onChange={(e) => setHideClosedSections(e.target.checked)}
                              className="rounded border-input text-primary focus:ring-ring"
                            />
                            <span className="text-muted-foreground">Hide closed</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={hideWaitlistedSections}
                              onChange={(e) => setHideWaitlistedSections(e.target.checked)}
                              className="rounded border-input text-primary focus:ring-ring"
                            />
                            <span className="text-muted-foreground">Hide waitlisted</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-4">
                        <HierarchicalSections sections={filteredSections} courseTitle={course.course_title} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {courses.length > 5 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          hasMore={hasMore}
          onPageChange={onPageChange}
          resultsPerPage={resultsPerPage}
          currentSort={currentSort}
          onSortChange={onSortChange}
        />
      )}
    </div>
  )
}