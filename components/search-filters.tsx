"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Search, RotateCcw } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

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
  min_section_avg_rating: string
  min_section_avg_difficulty: string
  min_section_total_ratings: string
  min_section_avg_would_take_again: string
}

interface SearchFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  loading: boolean
}

export function SearchFilters({ filters, onFiltersChange, onSearch, loading }: SearchFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [rmpOpen, setRmpOpen] = useState(false)

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
      min_section_avg_rating: "",
      min_section_avg_difficulty: "",
      min_section_total_ratings: "",
      min_section_avg_would_take_again: "",
    })
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

      {/* Advanced Filters */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            Advanced Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
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
