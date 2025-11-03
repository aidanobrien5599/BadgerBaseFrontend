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
      return "bg-green-50 text-green-700 border-green-200"
    case "CLOSED":
      return "bg-red-50 text-red-700 border-red-200"
    case "WAITLIST":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
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
 * @returns Comma-separated string of meeting times and locations
 */
export const formatMeetingDisplay = (meetings: any[]) => {
  return meetings.map(meeting => 
    `${meeting.meeting_days} ${formatMeetingTime(meeting.start_time, meeting.end_time)} (${meeting.location || `${meeting.building_name} ${meeting.room}`})`
  ).join(", ")
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
