"use client"

/**
 * Main hierarchical sections component
 * 
 * This is the entry point for displaying course sections in a hierarchical format.
 * It manages the overall state and orchestrates the rendering of lecture and
 * standalone sections.
 * 
 * Features:
 * - Groups sections by lecture meetings
 * - Displays lectures as expandable parent rows
 * - Shows discussion/lab sections as indented children
 * - Handles standalone sections (no associated lecture)
 * - Manages expand/collapse state for all sections
 */

import { useState } from "react"
import { HierarchicalSectionsProps, LectureSection, StandaloneSection } from "./types"
import { groupSections, getAggregatedStatus } from "./grouping"
import { LectureRow } from "./LectureRow"
import { StandaloneRow } from "./StandaloneRow"

/**
 * Main component for displaying hierarchical course sections
 * @param sections - Array of course sections to display
 * @param courseTitle - Course title for subscription notifications
 */
export function HierarchicalSections({ sections, courseTitle }: HierarchicalSectionsProps) {
  // State for tracking which lectures and sections are expanded
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  /**
   * Toggles the expanded state of a lecture
   * @param lectureKey - Unique key identifying the lecture
   */
  const toggleLecture = (lectureKey: string) => {
    const newExpanded = new Set(expandedLectures)
    if (newExpanded.has(lectureKey)) {
      newExpanded.delete(lectureKey)
    } else {
      newExpanded.add(lectureKey)
    }
    setExpandedLectures(newExpanded)
  }

  /**
   * Toggles the expanded state of a child section
   * @param key - Unique key identifying the section
   */
  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const hierarchicalSections = groupSections(sections)

  if (hierarchicalSections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
        No sections available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hierarchicalSections.map((hierarchicalSection, index) => {
        if (hierarchicalSection.type === "lecture") {
          const lecture = hierarchicalSection as LectureSection
          const lectureKey = `${lecture.lectureMeeting.meeting_days}-${lecture.lectureMeeting.start_time}-${lecture.lectureMeeting.end_time}-${lecture.lectureMeeting.location || `${lecture.lectureMeeting.building_name} ${lecture.lectureMeeting.room}`}`
          const isLectureExpanded = expandedLectures.has(lectureKey)
          const aggregatedStatus = lecture.children.length > 0 ? getAggregatedStatus(lecture.children) : lecture.section.status

          return (
            <LectureRow
              key={lectureKey}
              lecture={lecture}
              lectureKey={lectureKey}
              isExpanded={isLectureExpanded}
              onToggle={toggleLecture}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              aggregatedStatus={aggregatedStatus}
              courseTitle={courseTitle}
            />
          )
        } else {
          // Standalone section
          const standalone = hierarchicalSection as StandaloneSection
          const standaloneKey = `standalone-${standalone.section.section_id}`
          const isStandaloneExpanded = expandedSections.has(standaloneKey)

          return (
            <StandaloneRow
              key={standaloneKey}
              standalone={standalone}
              standaloneKey={standaloneKey}
              isExpanded={isStandaloneExpanded}
              onToggle={toggleSection}
              courseTitle={courseTitle}
            />
          )
        }
      })}
    </div>
  )
}
