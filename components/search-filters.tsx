"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, RotateCcw, Calendar, X } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AvailabilityCalendar } from "./availability-calendar"

interface FilterState {
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
}

interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  loading: boolean
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function SearchFilters({ filters, onFiltersChange, onSearch, loading }: SearchFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [rmpOpen, setRmpOpen] = useState(false)
  const [gpaOpen, setGpaOpen] = useState(false)
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
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
    })
  }

  const handleAvailabilityApply = (params: Record<string, string>) => {
    // Clear existing availability parameters
    const clearedFilters = { ...filters }
    DAYS.forEach((day) => {
      delete clearedFilters[`${day}StartTime` as keyof FilterState]
      delete clearedFilters[`${day}EndTime` as keyof FilterState]
    })

    // Apply new availability parameters
    onFiltersChange({
      ...clearedFilters,
      ...params,
    })

    setAvailabilityModalOpen(false)
  }

  // Check if any availability filters are set
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
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Courses</Label>
        <Input
          id="search"
          placeholder="COMP SCI 400, John Doe, etc."
          value={filters.search_param}
          onChange={(e) => updateFilter("search_param", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <Label>Schedule Availability</Label>
        <div className="flex gap-2">
          <Dialog open={availabilityModalOpen} onOpenChange={setAvailabilityModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-transparent">
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
              <AvailabilityCalendar onApply={handleAvailabilityApply} />
            </DialogContent>
          </Dialog>

          {hasAvailabilityFilters && (
            <Button variant="ghost" size="sm" onClick={clearAvailabilityFilters} className="px-2">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="WAITLIST">Waitlist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Course Level</Label>
          <Select value={filters.level} onValueChange={(value) => updateFilter("level", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any level</SelectItem>
              <SelectItem value="E">Elementary</SelectItem>
              <SelectItem value="I">Intermediate</SelectItem>
              <SelectItem value="A">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="min_credits">Min Credits</Label>
            <Input
              id="min_credits"
              type="number"
              placeholder="0"
              value={filters.min_credits}
              onChange={(e) => updateFilter("min_credits", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_credits">Max Credits</Label>
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
          <Label htmlFor="limit">Results Limit</Label>
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
      <Collapsible open={gpaOpen} onOpenChange={setGpaOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            GPA Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${gpaOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="median_grade">Median Grade</Label>
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

            <div className="space-y-3">
              <Label htmlFor="min_a_percent">
                Min A Percentage:{" "}
                {filters.min_a_percent ? `${Math.round(Number.parseFloat(filters.min_a_percent) * 100)}%` : "0%"}
              </Label>
              <Slider
                id="min_a_percent"
                min={0}
                max={1}
                step={0.01}
                value={[Number.parseFloat(filters.min_a_percent) || 0]}
                onValueChange={(value) => updateFilter("min_a_percent", value[0].toString())}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <Label htmlFor="min_cum_gpa">Min Avg GPA: {filters.min_cumulative_gpa || "0.0"}</Label>
                <Slider
                  id="min_cum_gpa"
                  min={0}
                  max={4}
                  step={0.01}
                  value={[Number.parseFloat(filters.min_cumulative_gpa) || 0]}
                  onValueChange={(value) => updateFilter("min_cumulative_gpa", value[0].toString())}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="min_recent_gpa">Min Recent GPA: {filters.min_most_recent_gpa || "0.0"}</Label>
                <Slider
                  id="min_recent_gpa"
                  min={0}
                  max={4}
                  step={0.01}
                  value={[Number.parseFloat(filters.min_most_recent_gpa) || 0]}
                  onValueChange={(value) => updateFilter("min_most_recent_gpa", value[0].toString())}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Advanced Filters */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            Advanced Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="min_seats">Min Available Seats</Label>
            <Input
              id="min_seats"
              type="number"
              placeholder="0"
              value={filters.min_available_seats}
              onChange={(e) => updateFilter("min_available_seats", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instruction_mode">Instruction Mode</Label>
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

          <div className="space-y-3">
            <Label>Subject Areas</Label>
            <div className="space-y-2">
              {[
                { key: "ethnic_studies", label: "Ethnic Studies", value: "ETHNIC ST" },
                { key: "social_science", label: "Social Science", value: "S" },
                { key: "humanities", label: "Humanities", value: "H" },
                { key: "biological_science", label: "Biological Science", value: "BO" },
                { key: "physical_science", label: "Physical Science", value: "P" },
                { key: "natural_science", label: "Natural Science", value: "N" },
                { key: "literature", label: "Literature", value: "L" },
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={filters[key as keyof FilterState] != ""}
                    onCheckedChange={(checked) => updateFilter(key as keyof FilterState, checked ? value : "")}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Prerequisite Filters</Label>
            <div className="space-y-2">
              {[
                { key: "no_prereqs", label: "No Prerequisites", value: "No Prereqs" },
                { key: "sophomore_standing", label: "Sophomore Standing", value: "Sophomore" },
                { key: "junior_standing", label: "Junior Standing", value: "Junior" },
                { key: "senior_standing", label: "Senior Standing", value: "Senior" },
              ].map(({ key, label, value }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={filters[key as keyof FilterState] as boolean}
                    onCheckedChange={(checked) => updateFilter(key as keyof FilterState, checked as boolean)}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* RMP Filters */}
      <Collapsible open={rmpOpen} onOpenChange={setRmpOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            Rate My Professor Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${rmpOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="min_rating">Min Section Rating</Label>
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
            <Label htmlFor="min_difficulty">Min Section Difficulty</Label>
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
            <Label htmlFor="min_total_ratings">Min Total Ratings</Label>
            <Input
              id="min_total_ratings"
              type="number"
              placeholder="0"
              value={filters.min_section_total_ratings}
              onChange={(e) => updateFilter("min_section_total_ratings", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_would_take_again">Min Would Take Again %</Label>
            <Input
              id="min_would_take_again"
              type="number"
              step="0.1"
              placeholder="0.0"
              value={filters.min_section_avg_would_take_again}
              onChange={(e) => updateFilter("min_section_avg_would_take_again", e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

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
