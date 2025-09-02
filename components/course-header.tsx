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
                        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                        {`${course.median_grade} Avg`}
                        </Badge>

                        {course.enrollment_prerequisites == "None" && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                            {`No Prereqs`}
                          </Badge>
                        )}

                        {course.letters_and_science_credits && (
                            <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
                            {`L&S`}
                          </Badge>
                        )}

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
