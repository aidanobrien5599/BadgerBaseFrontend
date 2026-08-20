"use client"

import { useMemo, useState } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationButton } from "./notification-button"

export interface MeetingShape {
  meeting_days: string
  meeting_type: string
  start_time: string
  end_time: string
  building_name: string | null
  room: string | null
  location: string
  section_number: string
}

export interface InstructorShape {
  name: string
  avg_rating: number | null
  avg_difficulty: number | null
  num_ratings: number | null
  would_take_again_percent: number | null
  rmp_instructor_id: string | null
}

export interface SectionShape {
  section_id: string | number
  section_uuid?: string
  status: string
  available_seats: number
  waitlist_total: number
  capacity: number
  enrolled: number
  instruction_mode: string
  is_asynchronous: boolean | string
  section_requisites: string | null
  instructors: InstructorShape[]
  meetings: MeetingShape[]
}

interface ChildGroup {
  section: SectionShape
  types: string[]
  meetings: MeetingShape[]
}

interface LectureGroup {
  key: string
  section: SectionShape
  lectureMeeting: MeetingShape
  children: ChildGroup[]
}

interface StandaloneGroup {
  section: SectionShape
  meetings: MeetingShape[]
  dynamicTypes: string[]
}

interface HierarchicalSectionsProps {
  sections: SectionShape[]
  courseTitle: string
}

const statusLabel = (s: string) => {
  const u = s.toUpperCase()
  if (u.includes("OPEN")) return { label: "OPEN", cls: "b-open" }
  if (u.includes("WAIT")) return { label: "WAITLIST", cls: "b-wait" }
  return { label: "CLOSED", cls: "b-closed" }
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

const getDynamicSectionLabel = (types: string[]) => {
  if (types.length === 0) return "Section"
  if (types.length === 1) return getMeetingTypeLabel(types[0])
  return types.map(getMeetingTypeLabel).join(" + ")
}

const fmtTime = (start: string, end: string) => `${start}–${end}`

const meetingLocation = (m: MeetingShape) =>
  m.location || (m.building_name ? `${m.building_name} ${m.room}` : "—")

const formatMeetingDisplay = (meetings: MeetingShape[]) =>
  meetings
    .map((m) => `${m.meeting_days} ${fmtTime(m.start_time, m.end_time)} (${meetingLocation(m)})`)
    .join(", ")

const getAggregatedStatus = (children: ChildGroup[]): string => {
  if (children.length === 0) return "CLOSED"
  const normalized = children.map((c) => statusLabel(c.section.status).label)
  if (normalized.some((s) => s === "OPEN")) return "OPEN"
  if (normalized.some((s) => s === "WAITLIST")) return "WAITLIST"
  return "CLOSED"
}

const groupSections = (sections: SectionShape[]) => {
  const lectureMap = new Map<string, LectureGroup>()
  const standalones: StandaloneGroup[] = []

  sections.forEach((section) => {
    const lectureMeeting = section.meetings?.find((m) => m.meeting_type.toUpperCase() === "LEC")
    if (lectureMeeting) {
      const key = `${lectureMeeting.meeting_days}-${lectureMeeting.start_time}-${lectureMeeting.end_time}-${meetingLocation(lectureMeeting)}`
      if (!lectureMap.has(key)) {
        lectureMap.set(key, { key, section, lectureMeeting, children: [] })
      }
      const nonLectureMeetings = section.meetings?.filter((m) => m.meeting_type.toUpperCase() !== "LEC") || []
      if (nonLectureMeetings.length > 0) {
        const types = [...new Set(nonLectureMeetings.map((m) => m.meeting_type))]
        lectureMap.get(key)!.children.push({ section, types, meetings: nonLectureMeetings })
      }
    } else {
      const meetingTypes = [...new Set(section.meetings?.map((m) => m.meeting_type) || [])]
      standalones.push({ section, meetings: section.meetings || [], dynamicTypes: meetingTypes })
    }
  })

  return { lectures: [...lectureMap.values()], standalones }
}

function StatusBadge({ status, className }: { status: string; className?: string }) {
  const st = statusLabel(status)
  return (
    <span
      className={cn(
        "inline-block font-mono font-semibold text-[10px] tracking-[0.1em] px-2 py-[2px] border shrink-0",
        st.cls === "b-open" && "border-success/40 bg-success/10 text-success",
        st.cls === "b-wait" && "border-warning/40 bg-warning/10 text-warning",
        st.cls === "b-closed" && "border-destructive/40 bg-destructive/10 text-destructive",
        className
      )}
    >
      {st.label}
    </span>
  )
}

function RowStats({ section, small }: { section: SectionShape; small?: boolean }) {
  return (
    <span className={cn("font-mono text-[12.5px] tabular-nums shrink-0", small && "text-[11.5px]")}>
      <span className="text-muted-foreground">
        {section.enrolled}/{section.capacity}
      </span>
      <span className="text-muted-foreground"> · </span>
      <span className={section.available_seats > 0 ? "text-success" : "text-muted-foreground"}>
        {section.available_seats} OPEN
      </span>
      {section.waitlist_total > 0 && (
        <>
          <span className="text-muted-foreground"> · </span>
          <span className="text-warning">{section.waitlist_total} WAIT</span>
        </>
      )}
    </span>
  )
}

function DetailStrip({ section, className }: { section: SectionShape; className?: string }) {
  const async = String(section.is_asynchronous) === "true"
  const instructors = section.instructors.filter((i) => i.name)
  return (
    <div className={cn("bg-surface-sunken px-4 py-3 space-y-2", className)}>
      {instructors.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">INSTRUCTORS</div>
          {instructors.map((i) => (
            <div key={i.name} className="font-mono text-[11.5px] text-foreground tabular-nums">
              {i.name}
              {i.avg_rating != null && <span className="text-muted-foreground"> · {i.avg_rating.toFixed(1)} rating</span>}
              {i.avg_difficulty != null && <span className="text-muted-foreground"> · {i.avg_difficulty.toFixed(1)} difficulty</span>}
              {i.num_ratings != null && <span className="text-muted-foreground"> · {i.num_ratings} ratings</span>}
            </div>
          ))}
        </div>
      )}
      {section.section_requisites && (
        <div className="text-[13px] text-muted-foreground leading-relaxed">
          <b className="text-foreground">Requisite:</b> {section.section_requisites}
        </div>
      )}
      {async && <div className="text-[13px] text-muted-foreground">Asynchronous online course.</div>}
      <div className="font-mono text-[11.5px] text-muted-foreground">
        ENROLLED <b className="text-foreground tabular-nums">{section.enrolled}/{section.capacity}</b>
        {section.available_seats > 0 && (
          <>
            {" "}· <b className="text-success tabular-nums">{section.available_seats}</b> OPEN
          </>
        )}
        {section.waitlist_total > 0 && (
          <>
            {" "}· <b className="text-warning tabular-nums">{section.waitlist_total}</b> WAITLISTED
          </>
        )}
      </div>
      {instructors.length === 0 && !section.section_requisites && !async && (
        <div className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground">No additional section details.</div>
      )}
    </div>
  )
}

export function HierarchicalSections({ sections, courseTitle }: HierarchicalSectionsProps) {
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [hideClosed, setHideClosed] = useState(false)
  const [hideWait, setHideWait] = useState(false)

  const { lectures, standalones } = useMemo(() => groupSections(sections), [sections])

  const passes = (section: SectionShape) => {
    const st = statusLabel(section.status).label
    if (hideClosed && st === "CLOSED") return false
    if (hideWait && st === "WAITLIST") return false
    return true
  }

  const visibleLectures = useMemo(
    () =>
      lectures
        .map((lec) => ({ ...lec, visibleChildren: lec.children.filter((c) => passes(c.section)) }))
        .filter((lec) => (lec.children.length > 0 ? lec.visibleChildren.length > 0 : passes(lec.section))),
    [lectures, hideClosed, hideWait]
  )

  const visibleStandalones = useMemo(() => standalones.filter((s) => passes(s.section)), [standalones, hideClosed, hideWait])

  const countVisible =
    visibleLectures.reduce((acc, lec) => acc + (lec.children.length > 0 ? lec.visibleChildren.length : 1), 0) +
    visibleStandalones.length
  const countTotal =
    lectures.reduce((acc, lec) => acc + (lec.children.length > 0 ? lec.children.length : 1), 0) + standalones.length

  const toggleLecture = (key: string) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section className="bg-surface border border-border/70">
      <header className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border/70">
        <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em]">Sections</h2>
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground">CLICK A ROW FOR MEETING DETAIL</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-[11px] tracking-[0.09em] text-muted-foreground">
            <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} className="hidden" />
            <span className={cn("w-[30px] h-4 border border-border/70 bg-surface relative transition-colors", hideClosed && "bg-foreground border-foreground")}>
              <span className={cn("absolute top-[2px] left-[2px] w-[10px] h-[10px] bg-muted-foreground transition-all", hideClosed && "left-[16px] bg-white")} />
            </span>
            HIDE CLOSED
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-[11px] tracking-[0.09em] text-muted-foreground">
            <input type="checkbox" checked={hideWait} onChange={(e) => setHideWait(e.target.checked)} className="hidden" />
            <span className={cn("w-[30px] h-4 border border-border/70 bg-surface relative transition-colors", hideWait && "bg-foreground border-foreground")}>
              <span className={cn("absolute top-[2px] left-[2px] w-[10px] h-[10px] bg-muted-foreground transition-all", hideWait && "left-[16px] bg-white")} />
            </span>
            HIDE WAITLISTED
          </label>
          <span className="font-mono font-semibold text-[11px] tracking-[0.1em] text-primary whitespace-nowrap">
            {countVisible} OF {countTotal} SECTIONS
          </span>
        </div>
      </header>

      <div className="divide-y divide-border/50">
        {visibleLectures.map((lec) => {
          const open = expandedLectures.has(lec.key)
          const aggregated = lec.children.length > 0 ? getAggregatedStatus(lec.children) : statusLabel(lec.section.status).label
          const lecNum = lec.lectureMeeting.section_number || ""
          const meta = `${lec.lectureMeeting.meeting_days} ${fmtTime(lec.lectureMeeting.start_time, lec.lectureMeeting.end_time)} · ${meetingLocation(lec.lectureMeeting)}`
          const closedNotify =
            lec.children.length === 0 && statusLabel(lec.section.status).label === "CLOSED" ? (
              <div onClick={(e) => e.stopPropagation()}>
                <NotificationButton
                  type="section"
                  id={lec.section.section_id}
                  isEnabled={true}
                  courseTitle={courseTitle}
                  sectionNames={[`LEC ${lecNum}`]}
                />
              </div>
            ) : null

          return (
            <div key={lec.key}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => toggleLecture(lec.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleLecture(lec.key)
                  }
                }}
                className={cn(
                  "flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-[9px] cursor-pointer select-none transition-colors min-w-0",
                  open ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                )}
              >
                <ChevronRight className={cn("h-3.5 w-3.5 text-primary shrink-0 transition-transform duration-200", open && "rotate-90")} />
                <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-foreground shrink-0">
                  Lecture {lecNum}
                </span>
                <StatusBadge status={aggregated} />
                <span className="font-mono text-[12.5px] text-muted-foreground min-w-0 flex-1 basis-full sm:basis-0 truncate">
                  {meta}
                </span>
                <RowStats section={lec.section} />
                {closedNotify}
              </div>

              {open && (
                <div>
                  {lec.children.length === 0 && <DetailStrip section={lec.section} />}
                  {lec.children.length > 0 && (
                    <div className="ml-4 border-l-2 border-primary/20 divide-y divide-border/50">
                      {lec.children.map((child, childIndex) => {
                        const childKey = `${lec.key}-child-${childIndex}`
                        const childOpen = expandedSections.has(childKey)
                        const visible = lec.visibleChildren.includes(child)
                        if (!visible) return null
                        const childLabel = `${getDynamicSectionLabel(child.types)} ${child.meetings[0]?.section_number || ""}`
                        return (
                          <div key={childKey}>
                            <div
                              role="button"
                              tabIndex={0}
                              aria-expanded={childOpen}
                              onClick={() => toggleSection(childKey)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  toggleSection(childKey)
                                }
                              }}
                              className={cn(
                                "flex flex-wrap items-center gap-x-2 gap-y-1 pl-3.5 pr-4 py-[7px] cursor-pointer select-none transition-colors min-w-0",
                                childOpen ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                              )}
                            >
                              <ChevronRight className={cn("h-3 w-3 text-primary shrink-0 transition-transform duration-200", childOpen && "rotate-90")} />
                              <span className="font-display text-[13px] font-medium tracking-[-0.01em] text-foreground shrink-0">
                                {childLabel}
                              </span>
                              <StatusBadge status={child.section.status} />
                              <span className="font-mono text-[12px] text-muted-foreground min-w-0 flex-1 basis-full sm:basis-0 truncate">
                                {formatMeetingDisplay(child.meetings)}
                              </span>
                              <RowStats section={child.section} small />
                              {statusLabel(child.section.status).label === "CLOSED" && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <NotificationButton
                                    type="section"
                                    id={child.section.section_id}
                                    isEnabled={true}
                                    courseTitle={courseTitle}
                                    sectionNames={[`LEC ${lecNum}`, ...child.meetings.map((m) => `${m.meeting_type} ${m.section_number}`)]}
                                  />
                                </div>
                              )}
                            </div>
                            {childOpen && <DetailStrip section={child.section} className="pl-3.5" />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {visibleStandalones.map((st, i) => {
          const key = `standalone-${i}-${st.section.section_id}`
          const open = expandedSections.has(key)
          const label = `${getDynamicSectionLabel(st.dynamicTypes)} ${st.meetings[0]?.section_number || ""}`
          return (
            <div key={key}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={open}
                onClick={() => toggleSection(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleSection(key)
                  }
                }}
                className={cn(
                  "flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-[9px] cursor-pointer select-none transition-colors min-w-0",
                  open ? "bg-surface-sunken" : "hover:bg-surface-sunken"
                )}
              >
                <ChevronRight className={cn("h-3.5 w-3.5 text-primary shrink-0 transition-transform duration-200", open && "rotate-90")} />
                <span className="font-display text-[15px] font-semibold tracking-[-0.01em] text-foreground shrink-0">{label}</span>
                <StatusBadge status={st.section.status} />
                <span className="font-mono text-[12.5px] text-muted-foreground min-w-0 flex-1 basis-full sm:basis-0 truncate">
                  {st.meetings.length > 0 ? formatMeetingDisplay(st.meetings) : "—"}
                </span>
                <RowStats section={st.section} />
                {statusLabel(st.section.status).label === "CLOSED" && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <NotificationButton
                      type="section"
                      id={st.section.section_id}
                      isEnabled={true}
                      courseTitle={courseTitle}
                      sectionNames={st.meetings.map((m) => `${m.meeting_type} ${m.section_number}`)}
                    />
                  </div>
                )}
              </div>
              {open && <DetailStrip section={st.section} />}
            </div>
          )
        })}

        {visibleLectures.length === 0 && visibleStandalones.length === 0 && (
          <div className="px-4 py-6 font-mono text-[11px] text-muted-foreground">No sections match the current filters.</div>
        )}
      </div>
    </section>
  )
}