import { CardHeader } from "./ui/card"
import { CollapsibleTrigger } from "./ui/collapsible"
import { CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { ChevronDown, GraduationCap } from "lucide-react"
import { BookOpen } from "lucide-react"
import { Star } from "lucide-react"
import { Users } from "lucide-react"
import { TrendingUp } from "lucide-react"
import { BarChart3 } from "lucide-react"
import { useState } from "react"
import { Award } from "lucide-react"

export function CourseHeader({ course, isExpanded }: { course: any; isExpanded: boolean }) {


    function ExpandableText({ text, maxChars = 150 }: { text: string; maxChars?: number }) {
        const [expanded, setExpanded] = useState(false)

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

      const formatPercent = (decimal: number | null) => {
        return decimal ? `${Math.round(decimal * 100)}%` : "0%"
      }

        return (
    <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer bg-white transition-colors p-6 relative">
                <div className="pr-8">
                  {/* Course Info */}
                  <div className="space-y-4">
                    {/* Title + Code */}
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {course.course_title}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-red-600 text-white font-semibold">
                          {course.course_designation}
                        </Badge>
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
                    
                  </div>

                  {/* Chevron positioned absolutely */}
                  <div className="absolute top-4 right-4">
                    <div className="p-1 rounded-full hover:bg-gray-100">
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
        )
}