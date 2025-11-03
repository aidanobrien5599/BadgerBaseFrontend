/**
 * Section grouping and status aggregation logic
 * 
 * This file contains the core algorithm for organizing course sections into
 * a hierarchical structure. It groups sections by their lecture meetings and
 * calculates aggregated status for parent lectures.
 */

import { Section, HierarchicalSection, LectureSection, StandaloneSection, SectionGroup } from "./types"

/**
 * Calculates the aggregated status for a lecture based on its child sections
 * 
 * Status priority (best to worst):
 * 1. OPEN - At least one child section is open
 * 2. WAITLIST - No open sections, but at least one has waitlist
 * 3. CLOSED - All child sections are closed
 * 
 * @param children - Array of child section groups
 * @returns Aggregated status string
 */
export const getAggregatedStatus = (children: SectionGroup[]): string => {
  if (children.length === 0) return "CLOSED"
  
  const statuses = children.map(child => child.section.status.toUpperCase())
  
  // If any child is open, lecture is open
  if (statuses.some(status => status === "OPEN")) {
    return "OPEN"
  }
  
  // If no open but at least one waitlist, lecture is waitlist
  if (statuses.some(status => status === "WAITLIST")) {
    return "WAITLIST"
  }
  
  // Otherwise, lecture is closed
  return "CLOSED"
}

/**
 * Groups course sections into a hierarchical structure
 * 
 * Algorithm:
 * 1. Iterate through all sections
 * 2. For sections with lectures:
 *    - Group by lecture meeting details (time + location)
 *    - Create lecture parent with non-lecture meetings as children
 * 3. For sections without lectures:
 *    - Treat as standalone sections
 * 
 * @param sections - Array of course sections to organize
 * @returns Array of hierarchical sections (lectures with children + standalones)
 */
export const groupSections = (sections: Section[]): HierarchicalSection[] => {
  const lectureMap = new Map<string, LectureSection>()
  const standaloneSection: StandaloneSection[] = []

  sections.forEach(section => {
    // Look for a lecture meeting in this section
    const lectureMeeting = section.meetings?.find(m => m.meeting_type.toUpperCase() === "LEC")
    
    if (lectureMeeting) {
      // Create a unique key for this lecture based on time and location
      // This ensures sections with the same lecture are grouped together
      const lectureKey = `${lectureMeeting.meeting_days}-${lectureMeeting.start_time}-${lectureMeeting.end_time}-${lectureMeeting.location || `${lectureMeeting.building_name} ${lectureMeeting.room}`}`
      
      // If this lecture doesn't exist yet, create it
      if (!lectureMap.has(lectureKey)) {
        lectureMap.set(lectureKey, {
          type: "lecture",
          section, // Use the first section we encounter for the lecture
          lectureMeeting,
          children: []
        })
      }

      // Add non-lecture meetings as children (discussions, labs, etc.)
      const nonLectureMeetings = section.meetings?.filter(m => m.meeting_type.toUpperCase() !== "LEC") || []
      if (nonLectureMeetings.length > 0) {
        const types = [...new Set(nonLectureMeetings.map(m => m.meeting_type))]
        const instructorsByType: Record<string, any[]> = {}
        
        // Assign instructors to each meeting type
        types.forEach(type => {
          instructorsByType[type.toUpperCase()] = section.instructors
        })

        lectureMap.get(lectureKey)!.children.push({
          types,
          title: section.section_id.toString(),
          section,
          meetings: nonLectureMeetings,
          instructorsByType
        })
      }
    } else {
      // No lecture - this is a standalone section (discussion-only, lab-only, etc.)
      const meetingTypes = [...new Set(section.meetings?.map(m => m.meeting_type) || [])]
      standaloneSection.push({
        type: "standalone",
        section,
        meetings: section.meetings || [],
        dynamicTypes: meetingTypes
      })
    }
  })

  return [...Array.from(lectureMap.values()), ...standaloneSection]
}
