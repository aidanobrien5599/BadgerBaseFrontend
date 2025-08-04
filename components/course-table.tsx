"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Users, Clock, MapPin, Star, TrendingUp, BarChart3 } from "lucide-react"
import { useState } from "react"
import { PaginationControls } from "./pagination-controls"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

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
  sections: Section[]
  madgrades_course_uuid: string
}

interface Section {
  section_id: number
  status: string
  available_seats: number
  waitlist_total: number
  capacity: number
  enrolled: number
  meeting_time: string
  location: string
  instruction_mode: string
  is_asynchronous: boolean
  section_avg_rating: number
  section_avg_difficulty: number
  section_total_ratings: number
  section_avg_would_take_again: number
  instructors: Instructor[]
}

interface Instructor {
  name: string
  avg_rating: number
  avg_difficulty: number
  num_ratings: number
  madgrades_instructor_uuid: string
  would_take_again_percent: number
  rmp_instructor_id: string
}

interface CourseTableProps {
  courses: Course[]
  currentPage: number
  totalPages: number
  totalCount: number
  hasMore: boolean
  onPageChange: (page: number) => void
  resultsPerPage: number
}

export function CourseTable({
  courses,
  currentPage,
  totalPages,
  totalCount,
  hasMore,
  onPageChange,
  resultsPerPage,
}: CourseTableProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-red-100 text-red-800"
      case "WAITLIST":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "AB":
        return "bg-green-50 text-green-700"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "BC":
        return "bg-blue-50 text-blue-700"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        fill: "#22c55e", // green-500
      },
      {
        grade: "AB",
        percentage: Math.round((course.ab_percent || 0) * 100),
        fill: "#4ade80", // green-400
      },
      {
        grade: "B",
        percentage: Math.round((course.b_percent || 0) * 100),
        fill: "#3b82f6", // blue-500
      },
      {
        grade: "BC",
        percentage: Math.round((course.bc_percent || 0) * 100),
        fill: "#60a5fa", // blue-400
      },
      {
        grade: "C",
        percentage: Math.round((course.c_percent || 0) * 100),
        fill: "#eab308", // yellow-500
      },
      {
        grade: "D",
        percentage: Math.round((course.d_percent || 0) * 100),
        fill: "#f97316", // orange-500
      },
      {
        grade: "F",
        percentage: Math.round((course.f_percent || 0) * 100),
        fill: "#ef4444", // red-500
      },
    ]
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No courses found. Try adjusting your search criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Search Results</h2>
      </div>
      {courses.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          hasMore={hasMore}
          onPageChange={onPageChange}
          resultsPerPage={resultsPerPage}
        />
      )}

      {courses.map((course) => (
        <Card key={course.course_id}>
          <Collapsible open={expandedCourses.has(course.course_id)} onOpenChange={() => toggleCourse(course.course_id)}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {course.course_designation} - {course.full_course_designation}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                      <span>
                        {course.minimum_credits == course.maximum_credits
                          ? course.minimum_credits == 1
                            ? `${course.minimum_credits} credit`
                            : `${course.minimum_credits} credits`
                          : `${course.minimum_credits}-${course.maximum_credits} credits`}
                      </span>
                      <Badge variant="outline">{course.level}</Badge>
                      {course.median_grade && (
                        <Badge className={getGradeColor(course.median_grade)}>Median: {course.median_grade}</Badge>
                      )}

                      <span>
                        {" "}
                        <a
                          target="_blank"
                          className="hover:font-bold hover:underline"
                          href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                          rel="noreferrer"
                        >
                          Avg GPA: {course.cumulative_gpa?.toFixed(2) || "N/A"}
                        </a>
                      </span>
                      <span>
                        {" "}
                        <a
                          target="_blank"
                          className="hover:font-bold hover:underline"
                          href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                          rel="noreferrer"
                        >
                          Recent GPA: {course.most_recent_gpa?.toFixed(2) || "N/A"}
                        </a>
                      </span>
                      <span>{course.sections.length} sections</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${expandedCourses.has(course.course_id) ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                {/* Animated Grade Distribution Chart */}
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Grade Distribution
                  </h4>
                  <ChartContainer
                    config={{
                      percentage: {
                        label: "Percentage",
                      },
                    }}
                    className="h-[200px] w-full"
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
                          tick={{ fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value, name) => [`${value}%`, "Students"]}
                          labelFormatter={(label) => `Grade: ${label}`}
                        />
                        <Bar dataKey="percentage" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={0} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sections</h4>
                  {course.sections.map((section) => (
                    <div key={section.section_id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">Section {section.section_id}</h5>
                          <Badge className={getStatusColor(section.status)}>{section.status}</Badge>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {section.enrolled}/{section.capacity}
                            {section.available_seats > 0 && (
                              <span className="text-green-600">({section.available_seats} available)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{section.meeting_time || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{section.location || "TBA"}</span>
                        </div>
                        <div className="text-sm">
                          <Badge variant="outline">{section.instruction_mode}</Badge>
                          {section.is_asynchronous && (
                            <Badge variant="outline" className="ml-1">
                              Async
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Section RMP Stats */}
                      {section.section_avg_rating && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded border">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm font-medium">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {formatRating(section.section_avg_rating)}
                            </div>
                            <div className="text-xs text-gray-500">Section Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm font-medium">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              {formatRating(section.section_avg_difficulty)}
                            </div>
                            <div className="text-xs text-gray-500">Difficulty</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{section.section_total_ratings}</div>
                            <div className="text-xs text-gray-500">Total Ratings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">
                              {section.section_avg_would_take_again
                                ? `${section.section_avg_would_take_again}%`
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">Would Take Again</div>
                          </div>
                        </div>
                      )}

                      {/* Instructors */}
                      {section.instructors.length > 0 && (
                        <div>
                          <h6 className="font-medium mb-2">Instructors:</h6>
                          <div className="space-y-2">
                            {section.instructors.map((instructor, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                                <span className="font-medium">
                                  {instructor.rmp_instructor_id ? (
                                    <a
                                      target="_blank"
                                      className="hover:font-bold hover:underline text-blue-600"
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
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500" />
                                      {formatRating(instructor.avg_rating)}
                                    </div>
                                    <div>Difficulty: {formatRating(instructor.avg_difficulty)}</div>
                                    <div>({instructor.num_ratings} ratings)</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  )
}
