"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Users, Clock, MapPin, Star, TrendingUp, BarChart3, BookOpen, Award, GraduationCap } from "lucide-react"
import { useState } from "react"
import { PaginationControls } from "./pagination-controls"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DisplayText } from "./display-text"

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

  function ExpandableText({ text, maxChars = 150 }: { text: string; maxChars?: number }) {
    const [expanded, setExpanded] = useState(false)
  
    if (text.length <= maxChars) {
      return <p className="text-sm text-gray-600">{text}</p>
    }
  
    return (
      <div className="text-sm text-gray-600">
        {expanded ? text : `${text.substring(0, maxChars)}...`}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          className="ml-2 text-red-600 hover:text-red-700 text-xs font-medium hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-green-50 text-green-700 border-green-200"
      case "CLOSED":
        return "bg-red-50 text-red-700 border-red-200"
      case "WAITLIST":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-red-600 text-white"
      case "AB":
        return "bg-red-500 text-white"
      case "B":
        return "bg-red-400 text-white"
      case "BC":
        return "bg-red-300 text-red-800"
      case "C":
        return "bg-red-200 text-red-800"
      case "D":
        return "bg-red-100 text-red-700"
      case "F":
        return "bg-red-700 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
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
        fill: "#dc2626", // red-600
      },
      {
        grade: "AB",
        percentage: Math.round((course.ab_percent || 0) * 100),
        fill: "#ef4444", // red-500
      },
      {
        grade: "B",
        percentage: Math.round((course.b_percent || 0) * 100),
        fill: "#f87171", // red-400
      },
      {
        grade: "BC",
        percentage: Math.round((course.bc_percent || 0) * 100),
        fill: "#fca5a5", // red-300
      },
      {
        grade: "C",
        percentage: Math.round((course.c_percent || 0) * 100),
        fill: "#fecaca", // red-200
      },
      {
        grade: "D",
        percentage: Math.round((course.d_percent || 0) * 100),
        fill: "#fee2e2", // red-100
      },
      {
        grade: "F",
        percentage: Math.round((course.f_percent || 0) * 100),
        fill: "#991b1b", // red-800
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black-600">
          Search Results
        </h2>
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
        <Card key={course.course_id} className="shadow-sm hover:shadow-md transition-shadow border">
          <Collapsible open={expandedCourses.has(course.course_id)} onOpenChange={() => toggleCourse(course.course_id)}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white transition-colors p-6">
                <div className="flex gap-6 items-start">
                  {/* Left: Course Info */}
                  <div className="flex-1 space-y-4">
                    {/* Title + Code */}
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {course.course_title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-600 text-white font-semibold">
                          {course.course_designation}
                        </Badge>
                      </div>
                    </div>

                    {/* Full Description */}
                    {course.course_description && (
                      <ExpandableText text={course.course_description} maxChars={230} />
                    )}

                    {course.enrollment_prerequisites && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                          <span className="font-bold flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-red-600" />
                            Prerequisites:
                          </span>
                          <span className="text-red-700">{course.enrollment_prerequisites}</span>
                        </p>
                      </div>
                    )}

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Credits Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <BookOpen className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Credits</span>
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {course.minimum_credits === course.maximum_credits
                            ? `${course.minimum_credits} credit${course.minimum_credits > 1 ? "s" : ""}`
                            : `${course.minimum_credits}-${course.maximum_credits} credits`}
                        </div>
                      </div>

                      {/* Level Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          {(() => {
                            const levelInfo = getLevelInfo(course.level)
                            const IconComponent = levelInfo.icon
                            return (
                              <>
                                <IconComponent className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-sm">Level</span>
                              </>
                            )
                          })()}
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {getLevelInfo(course.level).text}
                        </div>
                      </div>

                      {/* Median Grade Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <Star className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Median Grade</span>
                        </div>
                        <div className="mt-1">
                          {course.median_grade ? (
                            <Badge className={`${getGradeColor(course.median_grade)} font-semibold`}>
                              {course.median_grade}
                            </Badge>
                          ) : (
                            <span className="text-gray-700 font-semibold">N/A</span>
                          )}
                        </div>
                      </div>

                      {/* Sections Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <Users className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Sections</span>
                        </div>
                        <div className="text-gray-900 font-semibold">{course.sections.length}</div>
                      </div>

                      {/* Avg GPA Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <TrendingUp className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Avg GPA</span>
                        </div>
                        <div className="mt-1">
                          <a
                            target="_blank"
                            href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
                            className="text-red-600 font-bold hover:text-red-700 hover:underline"
                            rel="noreferrer"
                          >
                            {course.cumulative_gpa?.toFixed(2) || "N/A"}
                          </a>
                        </div>
                      </div>

                      {/* Recent GPA Card */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <BarChart3 className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">Recent GPA</span>
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {course.most_recent_gpa?.toFixed(2) || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {course.ethnic_studies && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Ethnic Studies
                        </Badge>
                      )}
                      {course.social_science && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Social Science
                        </Badge>
                      )}
                      {course.humanities && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Humanities
                        </Badge>
                      )}
                      {course.biological_science && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Bio Science
                        </Badge>
                      )}
                      {course.physical_science && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Physical Science
                        </Badge>
                      )}
                      {course.natural_science && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Natural Science
                        </Badge>
                      )}
                      {course.literature && (
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                          Literature
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Right: Arrow */}
                  <div className="flex items-center">
                    <div className="p-2 rounded-full hover:bg-gray-100">
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                          expandedCourses.has(course.course_id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 bg-white">
                {/* Grade Distribution Chart */}
                <div className="mb-6 p-6 bg-white rounded-lg border">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <BarChart3 className="h-5 w-5 text-red-600" />
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
                          tick={{ fontSize: 14, fontWeight: 600, fill: '#374151' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#374151' }}
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
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-600" />
                    Sections
                  </h4>
                  {course.sections.map((section) => (
                    <div key={section.section_id} className="border rounded-lg p-6 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h5 className="font-bold text-gray-900">Section {section.section_id}</h5>
                          <Badge className={`${getStatusColor(section.status)} border font-medium`}>
                            {section.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {section.enrolled}/{section.capacity}
                            </span>
                            {section.available_seats > 0 && (
                              <span className="text-green-600 font-medium text-sm">
                                ({section.available_seats} available)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                          <Clock className="h-4 w-4 text-red-600" />
                          <span className="text-gray-700 font-medium">{section.meeting_time || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="text-gray-700 font-medium">{section.location || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-600 text-white font-medium">
                            {section.instruction_mode}
                          </Badge>
                          {section.is_asynchronous && (
                            <Badge className="bg-gray-600 text-white font-medium">
                              Async
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Section RMP Stats */}
                      {section.section_avg_rating && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm font-bold text-yellow-700 mb-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              {formatRating(section.section_avg_rating)}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Section Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm font-bold text-red-700 mb-1">
                              <TrendingUp className="h-4 w-4 text-red-600" />
                              {formatRating(section.section_avg_difficulty)}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Difficulty</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900 mb-1">{section.section_total_ratings}</div>
                            <div className="text-xs text-gray-600 font-medium">Total Ratings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-700 mb-1">
                              {section.section_avg_would_take_again
                                ? `${section.section_avg_would_take_again}%`
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Would Take Again</div>
                          </div>
                        </div>
                      )}

                      {/* Instructors */}
                      {section.instructors.length > 0 && (
                        <div>
                          <h6 className="font-bold mb-3 text-gray-900">Instructors:</h6>
                          <div className="space-y-3">
                            {section.instructors.map((instructor, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <span className="font-bold text-gray-900">
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
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="font-medium text-yellow-700">{formatRating(instructor.avg_rating)}</span>
                                    </div>
                                    <div className="bg-red-50 px-2 py-1 rounded border border-red-200">
                                      <span className="font-medium text-red-700">Difficulty: {formatRating(instructor.avg_difficulty)}</span>
                                    </div>
                                    <div className="text-gray-600 font-medium text-xs">({instructor.num_ratings} ratings)</div>
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
    </div>
  )
}