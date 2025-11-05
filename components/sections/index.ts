/**
 * Hierarchical Sections Module
 * 
 * This module provides a complete hierarchical display system for course sections.
 * It organizes sections by lectures (parent) and discussions/labs (children) with
 * BadgerBase theming and responsive design.
 * 
 * @example
 * ```tsx
 * import { HierarchicalSections } from "@/components/sections"
 * 
 * function CourseDisplay({ course }) {
 *   return <HierarchicalSections sections={course.sections} />
 * }
 * ```
 */

// Main component export
export { HierarchicalSections } from "./HierarchicalSections"

// Type exports for external use
export type { 
  Section, 
  Instructor, 
  Meeting, 
  HierarchicalSectionsProps 
} from "./types"
