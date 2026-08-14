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
import { NotificationButton } from "./notification-button"

export function CourseHeader({ course, isExpanded }: { course: any; isExpanded: boolean }) {


    function ExpandableText({ text, maxChars = 150 }: { text: string; maxChars?: number }) {
        const [expanded, setExpanded] = useState(false)

        const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())

      
        if (text.length <= maxChars) {
          return <p className="text-sm text-muted-foreground">{text}</p>
        }
      
        return (
          <div className="text-sm text-muted-foreground">
            {expanded ? text : `${text.substring(0, maxChars)}...`}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="ml-2 text-primary hover:text-primary/80 text-xs font-medium hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )
      }

      const getGradeColor = (grade: string) => {
        switch (grade) {
          case "A":
            return "bg-primary text-primary-foreground"
          case "AB":
            return "bg-primary/85 text-primary-foreground"
          case "B":
            return "bg-primary/70 text-primary-foreground"
          case "BC":
            return "bg-primary/50 text-primary"
          case "C":
            return "bg-primary/30 text-primary"
          case "D":
            return "bg-primary/20 text-primary"
          case "F":
            return "bg-destructive text-destructive-foreground"
          default:
            return "bg-muted text-muted-foreground"
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
              <CardHeader className="cursor-pointer bg-surface transition-colors p-6 relative">
                <div className="pr-8">
                  {/* Course Info */}
                  <div className="space-y-4">
                    {/* Title + Code */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-xl font-bold text-foreground">
                          <a
                            href={`https://public.enroll.wisc.edu/search?keywords=${encodeURIComponent(course.course_designation)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {course.course_title}
                          </a>
                        </CardTitle>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-primary text-primary-foreground font-semibold">
                          {course.course_designation}
                        </Badge>
                        <Badge className="bg-accent text-primary border-primary/20 font-medium">
                        {`${course.median_grade} Avg`}
                        </Badge>

                        {course.enrollment_prerequisites == "None" && (
                            <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            {`No Prereqs`}
                          </Badge>
                        )}

                        {course.letters_and_science_credits && (
                            <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            {`L&S`}
                          </Badge>
                        )}

                        {course.ethnic_studies && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Ethnic Studies
                          </Badge>
                        )}
                        {course.social_science && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Social Science
                          </Badge>
                        )}
                        {course.humanities && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Humanities
                          </Badge>
                        )}
                        {course.biological_science && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Bio Science
                          </Badge>
                        )}
                        {course.physical_science && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Physical Science
                          </Badge>
                        )}
                        {course.natural_science && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Natural Science
                          </Badge>
                        )}
                        {course.literature && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            Literature
                          </Badge>
                        )}
                        {course.general_education && (
                          <Badge className="bg-accent text-primary border-primary/20 font-medium">
                            {course.general_education}
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
                    <div className="p-1 rounded-full hover:bg-muted">
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
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
