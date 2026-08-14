"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

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
  section_id: number
  unique_section_id: string
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
  letters_and_science_credits: string | null
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
  general_education: string | null
  typically_offered: string | null
  repeatable_for_credit: string | null
  madgrades_course_uuid: string
  status: number
  sections: SectionDetail[]
  all_course_designations: string | null
  open_to_first_year: string | null
}

const subjectLabel = (designation: string) => {
  const m = designation.match(/^(\D+)\s*(.+)$/)
  return m ? { subject: m[1], number: m[2] } : { subject: designation, number: "" }
}

const levelLabel = (level: string) => {
  switch (level) {
    case "E":
      return "Elementary"
    case "I":
      return "Intermediate"
    case "A":
      return "Advanced"
    default:
      return level || "—"
  }
}

const statusLabel = (s: string) => {
  const u = s.toUpperCase()
  if (u.includes("OPEN")) return { label: "OPEN", cls: "b-open" }
  if (u.includes("WAIT")) return { label: "WAITLIST", cls: "b-wait" }
  return { label: "CLOSED", cls: "b-closed" }
}

const typeColor = (t: string) => {
  const u = t.toUpperCase()
  if (u.includes("LEC")) return "text-[#2E5AA8]"
  if (u.includes("DIS")) return "text-success"
  if (u.includes("LAB")) return "text-[#7A3FB0]"
  return "text-muted-foreground"
}

/* ============ Grade Distribution ============ */

function GradeDistribution({ course }: { course: CourseDetailData }) {
  const grades = useMemo(() => {
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
      <header className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border/70">
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em]">Grade Distribution</h2>
        <span className="font-mono text-[8.5px] tracking-[0.1em] text-muted-foreground">MADGRADES · UW–MADISON</span>
        <span className="font-mono text-[8.5px] tracking-[0.1em] text-muted-foreground ml-auto">ALL SECTIONS</span>
      </header>
      <div className="px-4 py-4">
        <div className="flex flex-col gap-[7px]">
          {grades.map((g) => (
            <div key={g.label} className="grid grid-cols-[34px_1fr_46px] gap-3 items-center">
              <span className={cn("font-mono font-semibold text-[11px]", g.label === course.median_grade && "text-primary")}>
                {g.label}
              </span>
              <div className="h-4 bg-surface-sunken relative">
                <div
                  className={cn("absolute inset-y-0 left-0", g.label === course.median_grade ? "bg-primary" : "bg-[#C9C2BB]")}
                  style={{ width: `${g.width}%` }}
                />
              </div>
              <span className={cn("font-mono font-semibold text-[11px] text-right tabular-nums", g.label === course.median_grade && "text-primary")}>
                {Math.round((g.pct || 0) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8.5px] tracking-[0.08em] text-muted-foreground mt-2">
          Bars scaled to max share ({grades[0].label} · {Math.round((grades[0].pct || 0) * 100)}%) · median grade row highlighted in red.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/70 mt-3.5 pt-3">
          {[
            { label: "CUMULATIVE GPA", value: course.cumulative_gpa?.toFixed(2) || "N/A", med: false },
            { label: "MOST RECENT GPA", value: course.most_recent_gpa?.toFixed(2) || "N/A", med: false },
            { label: "MEDIAN GRADE", value: course.median_grade || "N/A", med: true },
            { label: "MIN A %", value: `${Math.round((course.a_percent || 0) * 100)}%`, med: false },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-mono text-[8px] tracking-[0.12em] text-muted-foreground">{s.label}</div>
              <div className={cn("font-mono font-semibold text-[17px] tabular-nums mt-0.5", s.med && "text-primary")}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============ Instructors ============ */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="font-mono font-semibold text-[13px] text-foreground tabular-nums">
      {rating.toFixed(1)}
      <span className="text-muted-foreground"> / 5</span>
    </span>
  )
}

function Instructors({ course }: { course: CourseDetailData }) {
  const instructors = useMemo(() => {
    const map = new Map<string, { name: string; secs: string[]; rating: number | null; difficulty: number | null; ratings: number | null; wta: number | null; rmpId: string | null }>()
    course.sections.forEach((s) => {
      s.instructors.forEach((i) => {
        if (!i.name) return
        const key = i.name.toLowerCase()
        if (!map.has(key)) {
          map.set(key, { name: i.name, secs: [], rating: i.avg_rating, difficulty: i.avg_difficulty, ratings: i.num_ratings, wta: i.would_take_again_percent, rmpId: i.rmp_instructor_id })
        }
        const secNum = s.meetings?.[0]?.section_number || String(s.section_id)
        const entry = map.get(key)!
        if (!entry.secs.includes(secNum)) entry.secs.push(secNum)
      })
    })
    return [...map.values()]
  }, [course])

  return (
    <section className="bg-surface border border-border/70">
      <header className="flex items-center gap-2 px-4 py-2.5 border-b border-border/70">
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em]">Instructors</h2>
        <span className="font-mono text-[8.5px] tracking-[0.1em] text-muted-foreground">RATE MY PROFESSORS · PROFESSOR QUALITY</span>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {instructors.map((i, idx) => (
          <div key={i.name} className={cn("px-4 py-3.5", idx < instructors.length - 1 && "border-b border-border/70", "sm:border-b-0", idx % 2 === 0 && "sm:border-r border-border/70")}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-medium text-[13px] text-foreground font-display">{i.name}</div>
                <div className="font-mono text-[8.5px] tracking-[0.08em] text-muted-foreground mt-0.5">
                  {i.secs.map((s) => (s.length > 3 ? `SEC ${s}` : s)).join(" · ") || "ALL SECTIONS"}
                </div>
              </div>
              {i.rmpId && (
                <a
                  href={`https://www.ratemyprofessors.com/professor/${i.rmpId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[8.5px] tracking-[0.08em] text-primary border-b border-border/70 hover:border-primary whitespace-nowrap"
                >
                  RATE MY PROFESSORS ↗
                </a>
              )}
            </div>
            <div className="mb-2.5">
              {i.rating != null ? <Stars rating={i.rating} /> : <span className="font-mono text-[11px] text-muted-foreground">No ratings</span>}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { l: "RATING", v: i.rating != null ? i.rating.toFixed(1) : "—", hi: true },
                { l: "DIFFICULTY", v: i.difficulty != null ? i.difficulty.toFixed(1) : "—", lo: true },
                { l: "RATINGS", v: i.ratings != null ? String(i.ratings) : "—" },
                { l: "WTA %", v: i.wta != null ? `${Math.round(i.wta)}%` : "—", hi: true },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-mono text-[7.5px] tracking-[0.1em] text-muted-foreground">{s.l}</div>
                  <div className={cn("font-mono font-semibold text-[12px] tabular-nums mt-0.5", s.hi && (s.v !== "—" ? "text-success" : ""), s.lo && (s.v !== "—" ? "text-warning" : ""))}>
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {instructors.length === 0 && (
          <div className="px-4 py-6 font-mono text-[11px] text-muted-foreground">No instructor data available.</div>
        )}
      </div>
    </section>
  )
}

/* ============ Section table ============ */

function SectionTable({ sections }: { sections: SectionDetail[] }) {
  const [openSec, setOpenSec] = useState<number | null>(null)
  const [hideClosed, setHideClosed] = useState(false)
  const [hideWait, setHideWait] = useState(false)

  const filtered = sections.filter((s) => {
    const st = statusLabel(s.status).label
    if (hideClosed && st === "CLOSED") return false
    if (hideWait && st === "WAITLIST") return false
    return true
  })

  const firstMeeting = (s: SectionDetail) => s.meetings?.[0]
  const daysOf = (s: SectionDetail) => firstMeeting(s)?.meeting_days || "—"
  const timeOf = (s: SectionDetail) =>
    firstMeeting(s) ? `${firstMeeting(s)!.start_time}–${firstMeeting(s)!.end_time}` : "—"
  const roomOf = (s: SectionDetail) => firstMeeting(s)?.location || "—"
  const instrOf = (s: SectionDetail) => s.instructors.map((i) => i.name).join(", ") || "—"

  return (
    <section className="bg-surface border border-border/70">
      <header className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border/70">
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em]">Sections</h2>
        <span className="font-mono text-[8.5px] tracking-[0.1em] text-muted-foreground">CLICK A ROW FOR MEETING DETAIL</span>
        <div className="flex items-center gap-4 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-[9px] tracking-[0.09em] text-muted-foreground">
            <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} className="hidden" />
            <span className={cn("w-[30px] h-4 border border-border/70 bg-surface relative transition-colors", hideClosed && "bg-foreground border-foreground")}>
              <span className={cn("absolute top-[2px] left-[2px] w-[10px] h-[10px] bg-muted-foreground transition-all", hideClosed && "left-[16px] bg-white")} />
            </span>
            HIDE CLOSED
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-[9px] tracking-[0.09em] text-muted-foreground">
            <input type="checkbox" checked={hideWait} onChange={(e) => setHideWait(e.target.checked)} className="hidden" />
            <span className={cn("w-[30px] h-4 border border-border/70 bg-surface relative transition-colors", hideWait && "bg-foreground border-foreground")}>
              <span className={cn("absolute top-[2px] left-[2px] w-[10px] h-[10px] bg-muted-foreground transition-all", hideWait && "left-[16px] bg-white")} />
            </span>
            HIDE WAITLISTED
          </label>
          <span className="font-mono font-semibold text-[9px] tracking-[0.1em] text-primary whitespace-nowrap">
            {filtered.length} OF {sections.length} SECTIONS
          </span>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px] min-w-[900px]">
          <thead>
            <tr className="border-b border-border/70">
              {["SECTION", "TYPE", "DAYS", "TIME", "ROOM", "INSTRUCTOR", "ENROLLED / CAP", "OPEN", "WAIT", "STATUS", "MODE"].map((h) => (
                <th key={h} className="font-mono font-semibold text-[8.5px] tracking-[0.1em] text-muted-foreground text-left px-2 py-2 border-r border-border/50 last:border-r-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const st = statusLabel(s.status)
              const isOpen = openSec === s.section_id
              const filled = s.capacity > 0 ? Math.round((s.enrolled / s.capacity) * 100) : 0
              const mt = firstMeeting(s)
              return (
                <FragmentRow key={s.section_id} open={isOpen}>
                  <tr
                    className={cn("cursor-pointer hover:bg-surface-sunken", isOpen && "bg-surface-sunken")}
                    onClick={() => setOpenSec(isOpen ? null : s.section_id)}
                  >
                    <td className="font-mono text-[10.5px] px-2 py-[7px] border-b border-border/50 tabular-nums">
                      {mt?.section_number || s.section_id}
                    </td>
                    <td className={cn("font-mono font-semibold text-[9px] tracking-[0.06em] px-2 py-[7px] border-b border-border/50", typeColor(mt?.meeting_type || ""))}>
                      {mt?.meeting_type || "—"}
                    </td>
                    <td className="font-mono text-[10.5px] px-2 py-[7px] border-b border-border/50">{daysOf(s)}</td>
                    <td className="font-mono text-[10.5px] px-2 py-[7px] border-b border-border/50 whitespace-nowrap">{timeOf(s)}</td>
                    <td className="font-mono text-[10.5px] px-2 py-[7px] border-b border-border/50">{roomOf(s)}</td>
                    <td className="px-2 py-[7px] border-b border-border/50 whitespace-nowrap">{instrOf(s)}</td>
                    <td className="px-2 py-[7px] border-b border-border/50">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-9 h-[6px] bg-border/70 relative">
                          <span
                            className={cn(
                              "absolute inset-0",
                              st.label === "CLOSED" ? "bg-destructive" : st.label === "WAITLIST" ? "bg-warning" : "bg-foreground"
                            )}
                            style={{ width: `${filled}%` }}
                          />
                        </span>
                        <span className="font-mono text-[10px] tabular-nums whitespace-nowrap">{s.enrolled}/{s.capacity}</span>
                      </span>
                    </td>
                    <td className={cn("font-mono font-semibold text-[10.5px] tabular-nums px-2 py-[7px] border-b border-border/50", s.available_seats > 0 ? "text-success" : "text-muted-foreground")}>
                      {s.available_seats}
                    </td>
                    <td className={cn("font-mono font-semibold text-[10.5px] tabular-nums px-2 py-[7px] border-b border-border/50", s.waitlist_total > 0 ? "text-warning" : "text-muted-foreground")}>
                      {s.waitlist_total}
                    </td>
                    <td className="px-2 py-[7px] border-b border-border/50">
                      <span className={cn(
                        "inline-block font-mono font-semibold text-[8px] tracking-[0.1em] px-2 py-[2px] border",
                        st.cls === "b-open" && "border-success/40 bg-success/10 text-success",
                        st.cls === "b-wait" && "border-warning/40 bg-warning/10 text-warning",
                        st.cls === "b-closed" && "border-destructive/40 bg-destructive/10 text-destructive"
                      )}>
                        {st.label}
                      </span>
                    </td>
                    <td className="font-mono text-[10.5px] px-2 py-[7px] border-b border-border/50">{s.instruction_mode || "—"}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={11} className="bg-surface-sunken p-0 border-b border-border/50">
                        <div className="px-3.5 py-3">
                          <div className="font-mono text-[9.5px] text-foreground tracking-[0.04em]">
                            MEETING <b className="text-primary">{daysOf(s)} {timeOf(s)} · {roomOf(s)}</b> · INSTRUCTOR{" "}
                            <b className="text-primary">{instrOf(s).toUpperCase() || "TBA"}</b>
                          </div>
                          {s.section_requisites && (
                            <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                              Requisite: {s.section_requisites}
                            </div>
                          )}
                          {String(s.is_asynchronous) === "true" && (
                            <div className="text-[11px] text-muted-foreground mt-1">Asynchronous online course.</div>
                          )}
                          <div className="flex gap-1.5 mt-2">
                            <span className="font-mono font-semibold text-[8px] tracking-[0.1em] px-2 py-[2px] border border-border/70 bg-surface text-muted-foreground">
                              {s.instruction_mode?.toUpperCase() || "—"}
                            </span>
                            <span className="font-mono font-semibold text-[8px] tracking-[0.1em] px-2 py-[2px] border border-border/70 bg-surface text-muted-foreground">
                              {mt?.meeting_type?.toUpperCase() || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </FragmentRow>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 font-mono text-[11px] text-muted-foreground">
                  No sections match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FragmentRow({ children, open }: { children: React.ReactNode; open: boolean }) {
  return <>{children}</>
}

/* ============ Main detail ============ */

export function CourseDetail({ course }: { course: CourseDetailData }) {
  const { subject, number } = subjectLabel(course.course_designation)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 pb-16">
      <div className="py-3">
        <Link href="/" className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.09em] text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-3.5 w-3.5" />
          BACK TO COURSE SEARCH
        </Link>
      </div>

      {/* Breadcrumb */}
      <div className="font-mono text-[9.5px] tracking-[0.09em] text-muted-foreground">
        <b className="text-primary font-semibold">COURSE SEARCH &amp; ENROLL</b>
        <span className="mx-1.5">/</span>{subject}
        <span className="mx-1.5">/</span>{number}
      </div>

      <div className="mt-2">
        <div className="min-w-0 space-y-3.5">
          {/* Course header */}
          <div>
            <div className="font-mono font-semibold text-[12px] text-primary tracking-[0.04em] mb-1.5">
              {course.course_designation}
            </div>
            <h1 className="font-display font-semibold text-[32px] tracking-[-0.02em] leading-[1.1] text-foreground mb-3">
              {course.course_title}
            </h1>

            <div className="flex flex-wrap border-y border-border/70 py-[7px] mb-3">
              {[
                { l: "CREDITS", v: course.minimum_credits === course.maximum_credits ? String(course.minimum_credits) : `${course.minimum_credits}-${course.maximum_credits}` },
                { l: "LEVEL", v: levelLabel(course.level) },
                { l: "BREADTH", v: course.general_education || "—" },
                { l: "TYPICAL OFFERING", v: course.typically_offered && course.typically_offered !== "Not Applicable" ? course.typically_offered : "—" },
                { l: "REPEATABLE", v: course.repeatable_for_credit === "Y" ? "YES" : "—" },
              ].map((m) => (
                <span key={m.l} className="font-mono text-[8.5px] tracking-[0.12em] text-muted-foreground py-[7px] pr-3.5 mr-3.5 border-r border-border/70 last:border-r-0">
                  {m.l}
                  <b className="block font-mono font-semibold text-[10px] text-foreground tracking-[0.06em] mt-[3px]">{m.v}</b>
                </span>
              ))}
            </div>

            {course.enrollment_prerequisites && course.enrollment_prerequisites !== "None" && (
              <div className="font-mono text-[9px] tracking-[0.06em] text-muted-foreground mb-3">
                <b className="text-primary font-semibold">Requisites:</b>{" "}
                <span className="text-foreground/80">{course.enrollment_prerequisites}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-x-5 font-mono text-[9px] tracking-[0.1em] text-muted-foreground mb-3">
              <span>SECTIONS <b className="text-foreground">{course.sections.length}</b></span>
              <span>MEDIAN GRADE <b className="text-foreground">{course.median_grade || "—"}</b></span>
              <span>CUM GPA <b className="text-foreground">{course.cumulative_gpa?.toFixed(2) || "—"}</b></span>
              <span>RECENT GPA <b className="text-foreground">{course.most_recent_gpa?.toFixed(2) || "—"}</b></span>
              <span>ENROLLMENT <b className={course.status === 2 ? "text-success" : course.status === 1 ? "text-warning" : "text-destructive"}>
                {course.status === 2 ? "OPEN" : course.status === 1 ? "WAITLIST" : "CLOSED"}
              </b></span>
            </div>

            {course.course_description && (
              <p className="text-[13.5px] leading-[1.6] text-muted-foreground max-w-[66ch]">{course.course_description}</p>
            )}
          </div>

          <GradeDistribution course={course} />
          <Instructors course={course} />
          <SectionTable sections={course.sections} />
        </div>
      </div>
    </div>
  )
}