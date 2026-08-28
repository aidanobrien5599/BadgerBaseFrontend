"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { HierarchicalSections } from "./hierarchical-sections"

export interface Meeting {
  meeting_number: number
  meeting_days: string
  meeting_type: string
  start_time: string
  end_time: string
  building_name: string | null
  room: string | null
  location: string
  section_number: string
  monday_meeting_start: string | null
  monday_meeting_end: string | null
  tuesday_meeting_start: string | null
  tuesday_meeting_end: string | null
  wednesday_meeting_start: string | null
  wednesday_meeting_end: string | null
  thursday_meeting_start: string | null
  thursday_meeting_end: string | null
  friday_meeting_start: string | null
  friday_meeting_end: string | null
  saturday_meeting_start: string | null
  saturday_meeting_end: string | null
  sunday_meeting_start: string | null
  sunday_meeting_end: string | null
}

export interface SectionDetail {
  section_id: string
  unique_section_id?: string
  section_uuid?: string
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
  meetings: Meeting[]
  section_requisites: string | null
  instructors: InstructorDetail[]
}

export interface InstructorDetail {
  name: string
  avg_rating: number | null
  avg_difficulty: number | null
  num_ratings: number | null
  would_take_again_percent: number | null
  rmp_instructor_id: string | null
}

export interface CourseDetailData {
  course_uuid: string
  course_id: string
  course_title: string
  course_designation: string
  full_course_designation: string
  subject_code: string
  enrollment_prerequisites: string | null
  letters_and_science_credits: boolean | null
  course_description: string | null
  minimum_credits: number
  maximum_credits: number
  level: string
  median_grade: string
  cumulative_gpa: number
  most_recent_gpa: number
  a_percent: number
  ab_percent: number
  b_percent: number
  bc_percent: number
  c_percent: number
  d_percent: number
  f_percent: number
  ethnic_studies: boolean | null
  social_science: boolean | null
  humanities: boolean | null
  biological_science: boolean | null
  physical_science: boolean | null
  natural_science: boolean | null
  literature: boolean | null
  general_education: string | null
  typically_offered: string | null
  repeatable_for_credit: boolean | null
  madgrades_course_uuid: string
  sections: SectionDetail[]
  all_course_designations?: string | null
  open_to_first_year?: boolean | null
  grading_basis_description?: string | null
}

const levelLabel = (level: string) => level || "—"

/* ============ Grade Distribution ============ */

function GradeDistribution({ course }: { course: CourseDetailData }) {
  const grades = useMemo(() => {
    // Grade percentages arrive as 0-1 proportions.
    const raw = [
      { label: "A", pct: course.a_percent },
      { label: "AB", pct: course.ab_percent },
      { label: "B", pct: course.b_percent },
      { label: "BC", pct: course.bc_percent },
      { label: "C", pct: course.c_percent },
      { label: "D", pct: course.d_percent },
      { label: "F", pct: course.f_percent },
    ]
    const max = Math.max(...raw.map((r) => r.pct || 0))
    return raw.map((r) => ({ ...r, width: max > 0 ? Math.round((r.pct / max) * 100) : 0 }))
  }, [course])

  return (
    <section className="bg-surface border border-border/70">
      <header className="flex flex-wrap items-baseline gap-2 px-4 py-2.5 border-b border-border/70">
        <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em]">Grade Distribution</h2>
        <a
          href={`https://madgrades.com/courses/${course.madgrades_course_uuid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[12px] font-semibold tracking-[0.08em] text-primary border-b border-border/70 hover:border-primary whitespace-nowrap"
        >
          MADGRADES ↗
        </a>
      </header>
      <div className="px-4 py-4">
        <div className="flex flex-col gap-[8px]">
          {grades.map((g) => (
            <div key={g.label} className="grid grid-cols-[38px_1fr_52px] gap-3 items-center">
              <span className={cn("font-mono font-semibold text-[13px]", g.label === course.median_grade && "text-primary")}>
                {g.label}
              </span>
              <div className="h-4 bg-surface-sunken relative">
                <div
                  className={cn("absolute inset-y-0 left-0", g.label === course.median_grade ? "bg-primary" : "bg-foreground/25")}
                  style={{ width: `${g.width}%` }}
                />
              </div>
              <span className={cn("font-mono font-semibold text-[13px] text-right tabular-nums", g.label === course.median_grade && "text-primary")}>
                {Math.round((g.pct || 0) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground mt-2">
          Bars scaled to max share ({grades[0].label} · {Math.round((grades[0].pct || 0) * 100)}%) · median grade row highlighted in red.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/70 mt-3.5 pt-3">
          {[
            { label: "CUMULATIVE GPA", value: course.cumulative_gpa?.toFixed(2) || "N/A", med: false },
            { label: "MOST RECENT GPA", value: course.most_recent_gpa?.toFixed(2) || "N/A", med: false },
            { label: "MEDIAN GRADE", value: course.median_grade || "N/A", med: true },
            { label: "MIN A %", value: `${Math.round((grades[0].pct || 0) * 100)}%`, med: false },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">{s.label}</div>
              <div className={cn("font-mono font-semibold text-[19px] tabular-nums mt-0.5", s.med && "text-primary")}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============ Main detail ============ */

function deriveStatus(course: CourseDetailData): number {
  if (course.sections?.some((s) => s.status === "OPEN")) return 2
  if (course.sections?.some((s) => s.status === "WAITLISTED")) return 1
  return 0
}

export function CourseDetail({ course, inline }: { course: CourseDetailData; inline?: boolean }) {
  const status = deriveStatus(course)
  const header = inline ? (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap mb-2">
        <h2 className="font-display font-semibold text-[18px] tracking-[-0.01em] leading-snug text-foreground flex items-center gap-2">
          {course.course_title}
          <span className="relative inline-flex items-center shrink-0 group">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                status === 2
                  ? "bg-success animate-pulse"
                  : status === 1
                    ? "bg-warning animate-pulse"
                    : "bg-destructive"
              }`}
            />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-foreground text-background font-mono text-[10px] tracking-[0.06em] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {status === 2 ? "Open" : status === 1 ? "Waitlist" : "Closed"}
            </span>
          </span>
        </h2>
        <a
          href={`https://public.enroll.wisc.edu/search?term=1272&keywords=${encodeURIComponent(course.course_designation)}&closed=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] font-semibold tracking-[0.08em] text-primary border-b border-border/70 hover:border-primary whitespace-nowrap"
        >
          COURSE SEARCH ↗
        </a>
      </div>
    </div>
  ) : (
    <div>
      <div className="font-mono font-semibold text-[15px] text-primary tracking-[0.04em] mb-1.5">
        {course.course_designation}
      </div>
      <div className="flex items-baseline gap-4 flex-wrap">
        <h1 className="font-display font-semibold text-[40px] tracking-[-0.02em] leading-[1.1] text-foreground mb-3 flex items-center gap-3">
          {course.course_title}
          <span className="relative inline-flex items-center shrink-0 group">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                status === 2
                  ? "bg-success animate-pulse"
                  : status === 1
                    ? "bg-warning animate-pulse"
                    : "bg-destructive"
              }`}
            />
            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-foreground text-background font-mono text-[11px] tracking-[0.06em] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              {status === 2 ? "Open" : status === 1 ? "Waitlist" : "Closed"}
            </span>
          </span>
        </h1>
        <a
          href={`https://public.enroll.wisc.edu/search?term=1272&keywords=${encodeURIComponent(course.course_designation)}&closed=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[14px] font-semibold tracking-[0.08em] text-primary border-b border-border/70 hover:border-primary whitespace-nowrap mb-3"
        >
          COURSE SEARCH ↗
        </a>
      </div>
    </div>
  )

  const content = (
    <div className="min-w-0 space-y-3.5">
      {/* Course header */}
      <div>
        {header}

        <div className="flex flex-wrap border-y border-border/70 py-[7px] mb-3">
          {[
            { l: "CREDITS", v: course.minimum_credits === course.maximum_credits ? String(course.minimum_credits) : `${course.minimum_credits}-${course.maximum_credits}` },
            { l: "LEVEL", v: levelLabel(course.level) },
            { l: "GEN ED", v: course.general_education || "—" },
            { l: "L&S", v: course.letters_and_science_credits ? "YES" : "—" },
            { l: "BREADTH", v: [
                course.ethnic_studies && "Ethnic Studies",
                course.social_science && "Social Science",
                course.humanities && "Humanities",
                course.biological_science && "Bio Science",
                course.physical_science && "Physical Science",
                course.natural_science && "Natural Science",
                course.literature && "Literature",
              ].filter(Boolean).join(", ") || "—" },
            { l: "TYPICAL OFFERING", v: course.typically_offered && course.typically_offered !== "Not Applicable" ? course.typically_offered : "—" },
            { l: "REPEATABLE", v: course.repeatable_for_credit ? "YES" : "—" },
          ].map((m) => (
            <span key={m.l} className="font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground py-[7px] pr-3.5 mr-3.5 border-r border-border/70 last:border-r-0">
              {m.l}
              <b className="block font-mono font-semibold text-[12.5px] text-foreground tracking-[0.06em] mt-[3px]">{m.v}</b>
            </span>
          ))}
        </div>

        <div className="font-mono text-[13px] tracking-[0.06em] text-muted-foreground mb-3">
          <b className="text-primary font-semibold">Requisites:</b>{" "}
          <span className="text-foreground/80">
            {course.enrollment_prerequisites && course.enrollment_prerequisites !== "None"
              ? course.enrollment_prerequisites
              : "None"}
          </span>
        </div>


        {course.course_description && (
          <p className="text-[15px] leading-[1.6] text-muted-foreground max-w-[66ch]">{course.course_description}</p>
        )}
      </div>

      <GradeDistribution course={course} />
      <HierarchicalSections sections={course.sections} courseTitle={course.course_title} />
    </div>
  )

  if (inline) {
    return (
      <div className="px-4 sm:px-5 py-5 bg-surface-sunken border-t border-border/70">
        {content}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 pb-16">
      <div className="py-3">
        <Link href="/" className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.09em] text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-3.5 w-3.5" />
          BACK TO COURSE SEARCH
        </Link>
      </div>

      <div className="mt-2">
        {content}
      </div>
    </div>
  )
}