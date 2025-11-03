/**
 * Type definitions for hierarchical sections component
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the hierarchical sections system. These types define the structure of
 * course data, meetings, instructors, and the hierarchical organization.
 */

/** Instructor information including RateMyProfessors data */
export interface Instructor {
  /** Full name of the instructor */
  name: string
  /** RateMyProfessors ID for linking to profile (null if not available) */
  rmp_instructor_id: string | null
  /** Average rating from RMP (1-5 scale, null if no ratings) */
  avg_rating: number | null
  /** Average difficulty rating from RMP (1-5 scale, null if no ratings) */
  avg_difficulty: number | null
  /** Total number of ratings on RMP (null if no ratings) */
  num_ratings: number | null
}

/** Meeting time and location information */
export interface Meeting {
  /** Unique identifier for this meeting */
  meeting_number: number
  /** Days of the week (e.g., "MW", "TR", "MWF") */
  meeting_days: string
  /** Type of meeting ("LEC", "DIS", "LAB", "SEM", etc.) */
  meeting_type: string
  /** Start time in formatted string (e.g., "9:55 AM") */
  start_time: string
  /** End time in formatted string (e.g., "10:45 AM") */
  end_time: string
  /** Building name */
  building_name: string
  /** Room number or identifier */
  room: string
  /** Full location string (building + room or custom location) */
  location: string
}

export interface Section {
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

// ============================================================================
// Hierarchical Organization Types
// ============================================================================

/** 
 * Lecture section with child discussion/lab sections
 * Represents a lecture that serves as a parent to other section types
 */
export interface LectureSection {
  /** Identifies this as a lecture section */
  type: "lecture"
  /** The section data for the lecture */
  section: Section
  /** The specific meeting that represents the lecture */
  lectureMeeting: Meeting
  /** Child sections (discussions, labs) that belong to this lecture */
  children: SectionGroup[]
}

/**
 * Group of related section meetings (e.g., discussion + lab combo)
 * Represents child sections that belong under a lecture
 */
export interface SectionGroup {
  /** Types of meetings in this group (e.g., ["DIS", "LAB"]) */
  types: string[]
  /** Display title for this group (usually section ID) */
  title: string
  /** The section data */
  section: Section
  /** All meetings for this group */
  meetings: Meeting[]
  /** Instructors organized by meeting type */
  instructorsByType: Record<string, Instructor[]>
}

/**
 * Standalone section that doesn't belong to a lecture
 * Used for discussion-only, lab-only, or other independent sections
 */
export interface StandaloneSection {
  /** Identifies this as a standalone section */
  type: "standalone"
  /** The section data */
  section: Section
  /** All meetings for this section */
  meetings: Meeting[]
  /** Meeting types present in this section */
  dynamicTypes: string[]
}

/** Union type for all possible hierarchical section types */
export type HierarchicalSection = LectureSection | StandaloneSection

/** Props for the main HierarchicalSections component */
export interface HierarchicalSectionsProps {
  /** Array of course sections to display hierarchically */
  sections: Section[]
}
