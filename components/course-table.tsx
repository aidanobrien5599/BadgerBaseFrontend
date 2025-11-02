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

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : "N/A"
  }

  const formatPercent = (decimal: number | null) => {
    return decimal ? `${Math.round(decimal * 100)}%` : "0%"
  }

  const formatMeetingTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`
  }

  const getMeetingTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "LEC":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "DIS":
        return "bg-green-50 text-green-700 border-green-200"
      case "LAB":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "SEM":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getMeetingTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case "LEC":
        return "Lecture"
      case "DIS":
        return "Discussion"
      case "LAB":
        return "Lab"
      case "SEM":
        return "Seminar"
      default:
        return type
    }
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
                <CardContent className="pt-0 bg-white">
                  <div className="flex flex-col gap-4 pb-4">
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
                        <div className="text-gray-900 font-semibold">{getLevelInfo(course.level).text}</div>
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
                        <div className="text-gray-900 font-semibold">{course.most_recent_gpa?.toFixed(2) || "N/A"}</div>
                      </div>


                    </div>

                    {/* Course Attributes Section */}
                    {((course.workplace_experience_description && course.workplace_experience_description !== "STUDENT OPT") || 
                      (course.repeatable_for_credit === "Y") || 
                      (course.typically_offered && course.typically_offered !== "Not Applicable")) && (
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-3">Course attributes:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          {course.workplace_experience_description && course.workplace_experience_description !== "STUDENT OPT" && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold mt-0.5">•</span>
                              <span>Workplace Experience Course</span>
                            </li>
                          )}
                          {course.repeatable_for_credit === "Y" && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold mt-0.5">•</span>
                              <span>Repeatable for Credit</span>
                            </li>
                          )}
                          {course.typically_offered && course.typically_offered !== "Not Applicable" && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-600 font-bold mt-0.5">•</span>
                              <span>Typically offered in {course.typically_offered}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

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
                            tick={{ fontSize: 14, fontWeight: 600, fill: "#374151" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#374151" }}
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

                  {/* Section Filters and Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-red-600" />
                        Sections
                      </h4>

                      {/* Filter Controls */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Filter className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">Filter:</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={hideClosedSections}
                            onChange={(e) => setHideClosedSections(e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-gray-700">Hide closed</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={hideWaitlistedSections}
                            onChange={(e) => setHideWaitlistedSections(e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-gray-700">Hide waitlisted</span>
                        </label>
                      </div>
                    </div>

                    {filteredSections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                        No sections match the current filters.
                      </div>
                    ) : (
                      filteredSections.map((section) => (
                        <div key={section.section_id} className="border rounded-lg p-6 bg-white">
                          <div className="flex flex-row items-center justify-between gap-4 mb-4">
                            {/* Section title and status */}
                            <div className="flex items-center gap-3">
                              <h5 className="font-bold text-gray-900">Section {section.section_id}</h5>
                              <Badge className={`${getStatusColor(section.status)} border font-medium`}>
                                {section.status}
                              </Badge>
                            </div>

                            {/* Enrollment info */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Main enrollment badge */}
                              <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                                <Users className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                  {section.enrolled}/{section.capacity}
                                </span>
                              </div>

                              {/* Waitlist badge if applicable */}
                              {section.waitlist_total > 0 && (
                                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium">
                                  {section.waitlist_total} waitlisted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Section Info */}
                          <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-red-600 text-white font-medium">{section.instruction_mode}</Badge>
                            {section.is_asynchronous && (
                              <Badge className="bg-gray-600 text-white font-medium">Async</Badge>
                            )}
                          </div>

                          {section.section_requisites && (
                            <p className="mb-4 text-sm text-gray-700">
                              <span className="font-semibold">Requirement:</span> {section.section_requisites}
                            </p>
                          )}

                          {/* Meetings */}
                          {section.meetings && section.meetings.length > 0 && (
                            <div className="mb-4">
                              <h6 className="font-bold mb-3 text-gray-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-red-600" />
                                Meeting Times
                              </h6>
                              <div className="space-y-2">
                                {section.meetings.map((meeting, idx) => (
                                  <div
                                    key={idx}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 text-sm">
                                        {getMeetingTypeLabel(meeting.meeting_type)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Clock className="h-4 w-4 text-red-600" />
                                      <span className="font-medium text-gray-700">
                                        {meeting.meeting_days} {formatMeetingTime(meeting.start_time, meeting.end_time)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <MapPin className="h-4 w-4 text-red-600" />
                                      <span className="font-medium text-gray-700">
                                        {meeting.location || `${meeting.building_name} ${meeting.room}`}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Instructors */}
                          {section.instructors.length > 0 && (
                            <div>
                              <h6 className="font-bold mb-3 text-gray-900">Instructors:</h6>
                              <div className="space-y-3">
                                {section.instructors.map((instructor, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg border gap-3"
                                  >
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
                                      <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1.5">
                                          <Star className="h-4 w-4 text-red-500 fill-current" />
                                          <span className="font-semibold text-gray-900">
                                            {formatRating(instructor.avg_rating)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                          <span className="text-gray-700 font-medium">
                                            Difficulty {formatRating(instructor.avg_difficulty)}
                                          </span>
                                        </div>
                                        <span className="text-gray-500 font-medium">
                                          ({instructor.num_ratings} reviews)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
        />
      )}
    </div>
  )
}
