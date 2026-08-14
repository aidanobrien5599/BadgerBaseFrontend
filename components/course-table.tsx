"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  Users,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  BarChart3,
  BookOpen,
  Award,
  GraduationCap,
  Calendar,
  Filter,
} from "lucide-react"
import { useState } from "react"
import { PaginationControls } from "./pagination-controls"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { CourseHeader } from "./course-header"
import { HierarchicalSections } from "./sections"
import { colors, typography } from "@/lib/tokens"
import { getGradeColor } from "@/components/sections/utils"
// Instructor interface defined locally
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

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  const formatPercent = (decimal: number | null) => {
    return decimal ? `${Math.round(decimal * 100)}%` : "0%"
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
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No courses found. Try adjusting your search criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {courses.length > 0 && (
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

      {courses.map((course) => {
        const filteredSections = filterSections(course.sections)

        return (
          <Card key={course.course_id} className="shadow-sm hover:shadow-md transition-shadow border">
            <Collapsible
              open={expandedCourses.has(course.course_id)}
              onOpenChange={() => toggleCourse(course.course_id)}
            >
              <CourseHeader course={course} isExpanded={expandedCourses.has(course.course_id)} />

              <CollapsibleContent>
                <CardContent className="pt-0 bg-surface">
                  <div className="flex flex-col gap-4 pb-4">
                    {course.enrollment_prerequisites && (
                      <div className="bg-accent border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-primary">
                          <span className="font-bold flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-primary" />
                            Prerequisites:
                          </span>
                          <span className="text-primary">{course.enrollment_prerequisites}</span>
                        </p>
                      </div>
                    )}

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Credits Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Credits</span>
                        </div>
                        <div className="text-foreground font-semibold">
                          {course.minimum_credits === course.maximum_credits
                            ? `${course.minimum_credits} credit${course.minimum_credits > 1 ? "s" : ""}`
                            : `${course.minimum_credits}-${course.maximum_credits} credits`}
                        </div>
                      </div>

                      {/* Level Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          {(() => {
                            const levelInfo = getLevelInfo(course.level)
                            const IconComponent = levelInfo.icon
                            return (
                              <>
                                <IconComponent className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">Level</span>
                              </>
                            )
                          })()}
                        </div>
                        <div className="text-foreground font-semibold">{getLevelInfo(course.level).text}</div>
                      </div>

                      {/* Median Grade Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Median Grade</span>
                        </div>
                        <div className="mt-1">
                          {course.median_grade ? (
                            <Badge className={`${getGradeColor(course.median_grade)} font-semibold`}>
                              {course.median_grade}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground font-semibold">N/A</span>
                          )}
                        </div>
                      </div>

                      {/* Sections Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Sections</span>
                        </div>
                        <div className="text-foreground font-semibold">{course.sections.length}</div>
                      </div>

                      {/* Avg GPA Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Avg GPA</span>
                        </div>
                        <div className="mt-1">
                          <a
                            target="_blank"
                            href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                            className="text-primary font-bold hover:text-primary/80 hover:underline"
                            rel="noreferrer"
                          >
                            {course.cumulative_gpa?.toFixed(2) || "N/A"}
                          </a>
                        </div>
                      </div>

                      {/* Recent GPA Card */}
                      <div className="bg-surface border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Recent GPA</span>
                        </div>
                        <div className="text-foreground font-semibold">{course.most_recent_gpa?.toFixed(2) || "N/A"}</div>
                      </div>


                    </div>

                    {/* Course Attributes Section */}
                    {((course.workplace_experience_description && course.workplace_experience_description !== "STUDENT OPT") || 
                      (course.repeatable_for_credit === "Y") || 
                      (course.typically_offered && course.typically_offered !== "Not Applicable")) && (
                      <div className="mt-4 p-4 bg-surface rounded-lg border">
                        <h4 className="font-semibold text-foreground mb-3">Course attributes:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {course.workplace_experience_description && course.workplace_experience_description !== "STUDENT OPT" && (
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              <span>Workplace Experience Course</span>
                            </li>
                          )}
                          {course.repeatable_for_credit === "Y" && (
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              <span>Repeatable for Credit</span>
                            </li>
                          )}
                          {course.typically_offered && course.typically_offered !== "Not Applicable" && (
                            <li className="flex items-start gap-2">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              <span>Typically offered in {course.typically_offered}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Grade Distribution Chart */}
                  <div className="mb-6 p-6 bg-surface rounded-lg border">
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-foreground">
                      <BarChart3 className="h-5 w-5 text-primary" />
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

                  {/* Hierarchical Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Sections
                      </h4>

                      {/* Filter Controls */}
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

                    <HierarchicalSections sections={filteredSections} courseTitle={course.course_title} />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}
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
