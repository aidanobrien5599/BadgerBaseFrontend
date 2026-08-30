"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, RotateCcw, Calendar, X, ChevronDown } from "lucide-react"
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AvailabilityCalendar } from "./availability-calendar"
import { SearchAutocomplete } from "./search-autocomplete"

export interface FilterState {
  search_param: string
  status: string
  min_available_seats: string
  instruction_mode: string
  limit: string
  min_credits: string
  max_credits: string
  level: string
  ethnic_studies: string
  social_science: string
  humanities: string
  biological_science: string
  physical_science: string
  natural_science: string
  literature: string
  min_cumulative_gpa: string
  min_most_recent_gpa: string
  median_grade: string
  min_a_percent: string
  min_section_avg_rating: string
  min_section_avg_difficulty: string
  min_section_total_ratings: string
  min_section_avg_would_take_again: string
  no_prereqs: boolean
  sophomore_standing: boolean
  junior_standing: boolean
  senior_standing: boolean
  l_and_s: boolean
  // Availability parameters
  mondayStartTime?: string
  mondayEndTime?: string
  tuesdayStartTime?: string
  tuesdayEndTime?: string
  wednesdayStartTime?: string
  wednesdayEndTime?: string
  thursdayStartTime?: string
  thursdayEndTime?: string
  fridayStartTime?: string
  fridayEndTime?: string
  saturdayStartTime?: string
  saturdayEndTime?: string
  sundayStartTime?: string
  sundayEndTime?: string
  gen_ed?: string
  sort?: string
}

export interface WeeklyAvailability {
  monday: { start: number; end: number }[]
  tuesday: { start: number; end: number }[]
  wednesday: { start: number; end: number }[]
  thursday: { start: number; end: number }[]
  friday: { start: number; end: number }[]
}

export interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  loading: boolean
}

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export const fieldLabel = "font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary"

export const EMPTY_FILTERS: FilterState = {
  search_param: "",
  status: "",
  min_available_seats: "",
  instruction_mode: "",
  limit: "20",
  min_credits: "",
  max_credits: "",
  level: "",
  ethnic_studies: "",
  social_science: "",
  humanities: "",
  l_and_s: false,
  biological_science: "",
  physical_science: "",
  natural_science: "",
  literature: "",
  min_cumulative_gpa: "",
  min_most_recent_gpa: "",
  median_grade: "",
  min_a_percent: "",
  min_section_avg_rating: "",
  min_section_avg_difficulty: "",
  min_section_total_ratings: "",
  min_section_avg_would_take_again: "",
  no_prereqs: false,
  sophomore_standing: false,
  junior_standing: false,
  senior_standing: false,
  gen_ed: "",
}

/* ---------- Availability calendar section ---------- */

export function AvailabilityFilter({
  filters,
  onFiltersChange,
  buttonClassName,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  buttonClassName?: string
}) {
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)

  const utcMillisecondsToMinutes = (utcMs: number): number => {
    const today = new Date()
    const utcMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const utcTime = new Date(utcMidnight.getTime() + utcMs)
    const cstTime = new Date(utcTime.getTime() - 6 * 60 * 60 * 1000) // Convert UTC to CST
    return cstTime.getHours() * 60 + cstTime.getMinutes()
  }

  const getInitialAvailability = (): WeeklyAvailability => {
    const availability: WeeklyAvailability = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    }

    DAYS.slice(0, 5).forEach((day) => {
      const startTimes = filters[`${day}StartTime` as keyof FilterState]
      const endTimes = filters[`${day}EndTime` as keyof FilterState]

      if (startTimes && endTimes) {
        const starts = startTimes.split(",").map(Number)
        const ends = endTimes.split(",").map(Number)

        const slots = starts.map((start: number, index: number) => {
          const startMinutes = utcMillisecondsToMinutes(start)
          const endMinutes = utcMillisecondsToMinutes(ends[index])
          return { start: startMinutes, end: endMinutes }
        })

        availability[day as keyof WeeklyAvailability] = slots
      }
    })

    return availability
  }

  const handleAvailabilityApply = (params: Record<string, string>) => {
    const clearedFilters = { ...filters }
    DAYS.forEach((day) => {
      delete clearedFilters[`${day}StartTime` as keyof FilterState]
      delete clearedFilters[`${day}EndTime` as keyof FilterState]
    })

    onFiltersChange({
      ...clearedFilters,
      ...params,
    })

    setAvailabilityModalOpen(false)
  }

  const hasAvailabilityFilters = DAYS.some(
    (day) => filters[`${day}StartTime` as keyof FilterState] || filters[`${day}EndTime` as keyof FilterState],
  )

  const clearAvailabilityFilters = () => {
    const clearedFilters = { ...filters }
    DAYS.forEach((day) => {
      delete clearedFilters[`${day}StartTime` as keyof FilterState]
      delete clearedFilters[`${day}EndTime` as keyof FilterState]
    })
    onFiltersChange(clearedFilters)
  }

  return (
    <div className="space-y-2">
      <Label className={fieldLabel}>Schedule Availability</Label>
      <div className="flex gap-2">
        <Dialog open={availabilityModalOpen} onOpenChange={setAvailabilityModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className={`flex-1 bg-transparent font-mono text-xs uppercase tracking-[0.08em] min-w-0 whitespace-normal text-center leading-tight ${buttonClassName || ""}`}>
              <Calendar className="h-4 w-4 mr-2" />
              {hasAvailabilityFilters ? "Edit Availability" : "Set Availability"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Set Your Weekly Availability
              </DialogTitle>
            </DialogHeader>
            <AvailabilityCalendar onApply={handleAvailabilityApply} initialAvailability={getInitialAvailability()} />
          </DialogContent>
        </Dialog>

        {hasAvailabilityFilters && (
          <Button variant="ghost" size="sm" onClick={clearAvailabilityFilters} className="px-2">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- GPA filters section ---------- */

export function GpaFilterSection({
  filters,
  onFiltersChange,
  defaultOpen = false,
  expandable = true,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  defaultOpen?: boolean
  expandable?: boolean
}) {
  const [gpaOpen, setGpaOpen] = useState(defaultOpen)

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const heading = (
    <span className="flex items-center gap-2">
      GPA Filters
    </span>
  )

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="median_grade" className={fieldLabel}>Median Grade</Label>
        <Select value={filters.median_grade} onValueChange={(value) => updateFilter("median_grade", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Any grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any grade</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="AB">AB</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="BC">BC</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="F">F</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className={fieldLabel}>Min A%</Label>
        <div className="flex items-center gap-2">
          <Slider
            min={0} max={1} step={0.01}
            value={[Number.parseFloat(filters.min_a_percent) || 0]}
            onValueChange={(value) => updateFilter("min_a_percent", value[0].toString())}
            className="flex-1"
          />
          <span className="font-mono text-[11px] font-semibold tabular-nums w-7 text-right shrink-0">
            {filters.min_a_percent ? `${Math.round(Number.parseFloat(filters.min_a_percent) * 100)}%` : "0%"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={fieldLabel}>Avg GPA</Label>
        <div className="flex items-center gap-2">
          <Slider
            min={0} max={4} step={0.01}
            value={[Number.parseFloat(filters.min_cumulative_gpa) || 0]}
            onValueChange={(value) => updateFilter("min_cumulative_gpa", value[0].toString())}
            className="flex-1"
          />
          <span className="font-mono text-[11px] font-semibold tabular-nums w-7 text-right shrink-0">
            {filters.min_cumulative_gpa || "0.0"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={fieldLabel}>Recent GPA</Label>
        <div className="flex items-center gap-2">
          <Slider
            min={0} max={4} step={0.01}
            value={[Number.parseFloat(filters.min_most_recent_gpa) || 0]}
            onValueChange={(value) => updateFilter("min_most_recent_gpa", value[0].toString())}
            className="flex-1"
          />
          <span className="font-mono text-[11px] font-semibold tabular-nums w-7 text-right shrink-0">
            {filters.min_most_recent_gpa || "0.0"}
          </span>
        </div>
      </div>
    </div>
  )

  if (!expandable) {
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground pb-3">
          {heading}
        </div>
        {content}
      </div>
    )
  }

  return (
    <Collapsible open={gpaOpen} onOpenChange={setGpaOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          {heading}
          <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${gpaOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">{content}</CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- Advanced filters section ---------- */

export function AdvancedFilterSection({
  filters,
  onFiltersChange,
  defaultOpen = false,
  expandable = true,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  defaultOpen?: boolean
  expandable?: boolean
}) {
  const [advancedOpen, setAdvancedOpen] = useState(defaultOpen)

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleGenEdChange = (value: string, checked: boolean) => {
    if (checked) {
      updateFilter("gen_ed", value)
    } else {
      updateFilter("gen_ed", "")
    }
  }

  const heading = (
    <span className="flex items-center gap-2">
      Course Filters
    </span>
  )

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="min_seats" className={fieldLabel}>Min Available Seats</Label>
        <Input
          id="min_seats"
          type="number"
          placeholder="0"
          value={filters.min_available_seats}
          onChange={(e) => updateFilter("min_available_seats", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instruction_mode" className={fieldLabel}>Instruction Mode</Label>
        <Select value={filters.instruction_mode} onValueChange={(value) => updateFilter("instruction_mode", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Any mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any mode</SelectItem>
            <SelectItem value="Classroom Instruction">In Person</SelectItem>
            <SelectItem value="Online Only">Online</SelectItem>
            <SelectItem value="Online (some classroom)">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className={fieldLabel}>General Education</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => updateFilter("l_and_s", !filters.l_and_s)}
            className={`h-8 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
              filters.l_and_s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
            }`}
          >
            L&S
          </button>
          {[
            { value: "COM A", label: "COM A" },
            { value: "COM B", label: "COM B" },
            { value: "QR-A", label: "QR-A" },
            { value: "QR-B", label: "QR-B" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleGenEdChange(value, filters.gen_ed !== value)}
              className={`h-8 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                filters.gen_ed === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className={fieldLabel}>Subject Areas</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: "ethnic_studies", label: "Ethnic St", value: "true" },
            { key: "social_science", label: "Social Sci", value: "true" },
            { key: "humanities", label: "Humanities", value: "true" },
            { key: "biological_science", label: "Bio Sci", value: "true" },
            { key: "physical_science", label: "Physical Sci", value: "true" },
            { key: "natural_science", label: "Natural Sci", value: "true" },
            { key: "literature", label: "Literature", value: "true" },
          ].map(({ key, label, value }, idx, arr) => (
            <button
              key={key}
              onClick={() => updateFilter(key as keyof FilterState, filters[key as keyof FilterState] ? "" : value)}
              className={`h-8 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                idx === arr.length - 1 && arr.length % 2 === 1 ? "col-span-2" : ""
              } ${
                filters[key as keyof FilterState]
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className={fieldLabel}>Prerequisites</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { key: "no_prereqs", label: "No Prereqs" },
            { key: "sophomore_standing", label: "Soph. Standing" },
            { key: "junior_standing", label: "Junior Standing" },
            { key: "senior_standing", label: "Senior Standing" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateFilter(key as keyof FilterState, !filters[key as keyof FilterState])}
              className={`h-8 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                filters[key as keyof FilterState]
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (!expandable) {
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground pb-3">
          {heading}
        </div>
        {content}
      </div>
    )
  }

  return (
    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          {heading}
          <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">{content}</CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- RMP filters section ---------- */

export function RmpFilterSection({
  filters,
  onFiltersChange,
  defaultOpen = false,
  expandable = true,
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  defaultOpen?: boolean
  expandable?: boolean
}) {
  const [rmpOpen, setRmpOpen] = useState(defaultOpen)

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const heading = (
    <span className="flex items-center gap-2">
      Rate My Professor Filters
    </span>
  )

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="min_rating" className={fieldLabel}>Min Section Rating</Label>
        <Input
          id="min_rating"
          type="number"
          step="0.1"
          placeholder="0.0"
          value={filters.min_section_avg_rating}
          onChange={(e) => updateFilter("min_section_avg_rating", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_difficulty" className={fieldLabel}>Min Section Difficulty</Label>
        <Input
          id="min_difficulty"
          type="number"
          step="0.1"
          placeholder="0.0"
          value={filters.min_section_avg_difficulty}
          onChange={(e) => updateFilter("min_section_avg_difficulty", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_total_ratings" className={fieldLabel}>Min Total Ratings</Label>
        <Input
          id="min_total_ratings"
          type="number"
          placeholder="0"
          value={filters.min_section_total_ratings}
          onChange={(e) => updateFilter("min_section_total_ratings", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_would_take_again" className={fieldLabel}>Min Would Take Again %</Label>
        <Input
          id="min_would_take_again"
          type="number"
          step="0.1"
          placeholder="0.0"
          value={filters.min_section_avg_would_take_again}
          onChange={(e) => updateFilter("min_section_avg_would_take_again", e.target.value)}
        />
      </div>
    </div>
  )

  if (!expandable) {
    return (
      <div>
        <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground pb-3">
          {heading}
        </div>
        {content}
      </div>
    )
  }

  return (
    <Collapsible open={rmpOpen} onOpenChange={setRmpOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
          {heading}
          <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${rmpOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-4">{content}</CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- Sidebar composition (default view) ---------- */

export function SearchFilters({ filters, onFiltersChange, onSearch, loading }: SearchFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange(EMPTY_FILTERS)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className={fieldLabel}>Search Courses</Label>
        <SearchAutocomplete
          id="search"
          placeholder="COMP SCI 400, John Doe, etc."
          value={filters.search_param}
          onValueChange={(value) => updateFilter("search_param", value)}
          onSearch={onSearch}
        />
      </div>

      <AvailabilityFilter filters={filters} onFiltersChange={onFiltersChange} />

      {/* Basic Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className={fieldLabel}>Status</Label>
          <MultiSelectDropdown
            value={filters.status}
            onValueChange={(v) => updateFilter("status", v)}
            options={[
              { value: "OPEN", label: "Open" },
              { value: "CLOSED", label: "Closed" },
              { value: "WAITLISTED", label: "Waitlist" },
            ]}
            placeholder="Any status"
          />
        </div>

        <div className="space-y-2">
          <Label className={fieldLabel}>Course Level</Label>
          <MultiSelectDropdown
            value={filters.level}
            onValueChange={(v) => updateFilter("level", v)}
            options={[
              { value: "E", label: "Elementary" },
              { value: "I", label: "Intermediate" },
              { value: "A", label: "Advanced" },
            ]}
            placeholder="Any level"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="min_credits" className={fieldLabel}>Min Credits</Label>
            <Input
              id="min_credits"
              type="number"
              placeholder="0"
              value={filters.min_credits}
              onChange={(e) => updateFilter("min_credits", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_credits" className={fieldLabel}>Max Credits</Label>
            <Input
              id="max_credits"
              type="number"
              placeholder="10"
              value={filters.max_credits}
              onChange={(e) => updateFilter("max_credits", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit" className={fieldLabel}>Results Limit</Label>
          <Select value={filters.limit} onValueChange={(value) => updateFilter("limit", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Grade Filters */}
      <GpaFilterSection filters={filters} onFiltersChange={onFiltersChange} />

      <Separator />

      {/* Advanced Filters */}
      <AdvancedFilterSection filters={filters} onFiltersChange={onFiltersChange} />

      <Separator />

      {/* RMP Filters */}
      <RmpFilterSection filters={filters} onFiltersChange={onFiltersChange} />

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={onSearch} disabled={loading} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Search Courses
        </Button>
        <Button onClick={resetFilters} variant="outline" className="w-full bg-transparent">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  )
}