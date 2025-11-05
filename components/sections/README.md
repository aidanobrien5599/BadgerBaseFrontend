# Hierarchical Sections Component

This directory contains a modular implementation of the BadgerBase-themed hierarchical course sections display. The component shows lectures as parent rows with discussion/lab sections as indented children.

## 📁 File Structure

```
components/sections/
├── README.md                  # This documentation
├── index.ts                   # Main exports for external use
├── types.ts                   # TypeScript interfaces and type definitions
├── utils.ts                   # Utility functions (formatting, colors, etc.)
├── grouping.ts               # Core logic for grouping sections into hierarchy
├── InstructorDisplay.tsx     # Reusable instructor display component
├── SectionDetails.tsx        # Detail view components for different section types
├── LectureRow.tsx           # Lecture row component with child sections
├── StandaloneRow.tsx        # Standalone section row component
└── HierarchicalSections.tsx # Main orchestrating component
```

## 🎯 Core Concepts

### Hierarchy Structure
- **Lectures** - Top-level parent rows showing lecture time/location
- **Child Sections** - Discussion/lab sections grouped under their lecture
- **Standalone Sections** - Sections without lectures (discussion-only, lab-only)

### Status Logic
- **Lecture Status** - Aggregated from child sections:
  - "Open" if any child is open
  - "Waitlist" if no open children but at least one waitlisted
  - "Closed" if all children are closed
- **Child Status** - Shows individual section's actual status

### Grouping Algorithm
Sections are grouped by lecture meeting details (time + location). All sections sharing the same lecture become children under that lecture parent.

## 🔧 Usage

```tsx
import { HierarchicalSections } from "@/components/sections"

// In your component
<HierarchicalSections sections={courseData.sections} />
```

## 🎨 Theming

The component follows BadgerBase design principles:
- **Colors**: Cardinal red (#dc2626) with white backgrounds
- **Status Badges**: Green (Open), Red (Closed), Yellow (Waitlist)
- **Hierarchy**: Visual indentation with red accent borders
- **Typography**: Clean, academic styling with proper font weights

## 📋 Component Breakdown

### Main Components
- `HierarchicalSections` - Entry point, manages state and renders sections
- `LectureRow` - Displays lecture information with expandable child sections
- `StandaloneRow` - Displays sections that don't have associated lectures

### Supporting Components
- `InstructorDisplay` - Shows instructor names, ratings, and RMP links
- `SectionDetails` - Shows detailed section information when expanded
- `LectureDetails` - Shows lecture-specific details
- `StandaloneDetails` - Shows standalone section details

### Utilities
- Status color mapping
- Meeting time formatting
- Dynamic section type labeling
- Meeting display formatting

## 🔄 State Management

The component uses React state to track:
- `expandedLectures` - Set of expanded lecture keys
- `expandedSections` - Set of expanded child section keys

Keys are generated based on meeting details to ensure proper grouping and state persistence.

## 🎛️ Expand/Collapse Behavior

- **Two-level hierarchy**: Lectures → Child Sections
- **Lecture expansion**: Shows child sections or lecture details (if no children)
- **Child expansion**: Shows detailed section information
- **Visual indicators**: Chevron arrows (▶/▼) with red theming

## 📊 Data Flow

1. **Input**: Array of `Section` objects from course data
2. **Grouping**: `groupSections()` creates hierarchical structure
3. **Rendering**: Components render based on section type
4. **Interaction**: User clicks trigger state updates and re-renders

## 🔍 Key Features

- **Smart Grouping**: Automatically groups sections by lecture
- **Status Aggregation**: Lecture status reflects best child availability
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Efficient re-renders with proper key usage

## 🛠️ Customization

To modify the component:
1. **Styling**: Update utility functions in `utils.ts`
2. **Grouping Logic**: Modify `grouping.ts`
3. **Display Format**: Update individual row components
4. **Types**: Add new interfaces in `types.ts`

## 🐛 Troubleshooting

Common issues:
- **Import errors**: Use the main export from `./sections`
- **Missing data**: Ensure sections have proper meeting information
- **Styling issues**: Check Tailwind classes in utility functions
- **State issues**: Verify unique key generation in grouping logic
