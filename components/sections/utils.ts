/**
 * Utility functions for hierarchical sections
 * 
 * This file contains helper functions for formatting, styling, and displaying
 * section information. These utilities handle status colors, time formatting,
 * and dynamic labeling throughout the hierarchical sections component.
 */

/**
 * Returns Tailwind CSS classes for status badge styling
 * @param status - Section status ("OPEN", "CLOSED", "WAITLIST", etc.)
 * @returns CSS classes for background, text, and border colors
 */
export const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "OPEN":
      return "bg-success/10 text-success-foreground border-success/30"
    case "CLOSED":
      return "bg-destructive/10 text-destructive border-destructive/30"
    case "WAITLIST":
      return "bg-warning/10 text-warning-foreground border-warning/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

/**
 * Returns Tailwind CSS classes for a median-grade badge.
 * Solid red ramp: A is the strongest shade, F is the darkest (most severe),
 * and the middle grades lighten. Uses the --grade-* semantic tokens so the
 * scale lives in one place (app/globals.css).
 * @param grade - Letter grade ("A", "AB", "B", ..., "F")
 * @returns CSS classes for background and text colors
 */
export const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A":
      return "bg-grade-a text-primary-foreground"
    case "AB":
      return "bg-grade-ab text-primary-foreground"
    case "B":
      return "bg-grade-b text-primary-foreground"
    case "BC":
      return "bg-grade-bc text-grade-text"
    case "C":
      return "bg-grade-c text-grade-text"
    case "D":
      return "bg-grade-d text-grade-text"
    case "F":
      return "bg-grade-f text-primary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/**
 * Converts meeting type codes to human-readable labels
 * @param type - Meeting type code ("LEC", "DIS", "LAB", "SEM", etc.)
 * @returns Human-readable label for the meeting type
 */
export const getMeetingTypeLabel = (type: string) => {
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

/**
 * Formats start and end times with an en dash
 * @param startTime - Start time string (e.g., "9:55 AM")
 * @param endTime - End time string (e.g., "10:45 AM")
 * @returns Formatted time range (e.g., "9:55 AM–10:45 AM")
 */
export const formatMeetingTime = (startTime: string, endTime: string) => {
  return `${startTime}–${endTime}`
}

/**
 * Formats a rating number to one decimal place or "N/A"
 * @param rating - Rating number or null
 * @returns Formatted rating string
 */
export const formatRating = (rating: number | null) => {
  return rating ? rating.toFixed(1) : "N/A"
}

/**
 * Creates a display string for multiple meetings
 * @param meetings - Array of meeting objects
 * @returns Comma-separated string of meeting times and locations with section numbers
 */
export const formatMeetingDisplay = (meetings: any[]) => {
  return meetings.map(meeting => {
    return `${meeting.meeting_days} ${formatMeetingTime(meeting.start_time, meeting.end_time)} (${meeting.location || `${meeting.building_name} ${meeting.room}`})`
  }).join(", ")
}

/**
 * Creates a dynamic label for section groups based on their types
 * @param types - Array of meeting type codes
 * @returns Combined label (e.g., "Discussion + Lab", "Lab", "Section")
 */
export const getDynamicSectionLabel = (types: string[]) => {
  if (types.length === 0) return "Section"
  if (types.length === 1) return getMeetingTypeLabel(types[0])
  return types.map(getMeetingTypeLabel).join(" + ")
}
