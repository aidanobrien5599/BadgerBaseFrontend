"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RotateCcw, ChevronDown } from "lucide-react"
import {
  AvailabilityFilter,
  GpaFilterSection,
  AdvancedFilterSection,
  RmpFilterSection,
  fieldLabel,
  type FilterState,
} from "./search-filters"

interface ControlBandProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSearch: () => void
  loading: boolean
}

const genEdOptions = [
  { value: "COM A", label: "COM A" },
  { value: "COM B", label: "COM B" },
  { value: "QR-A", label: "QR-A" },
  { value: "QR-B", label: "QR-B" },
]

export function ControlBand({ filters, onFiltersChange, onSearch, loading }: ControlBandProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

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
      l_and_s: false,
      gen_ed: "",
    })
  }

  const toggleGenEd = (value: string) => {
    updateFilter("gen_ed", filters.gen_ed === value ? "" : value)
  }

  const ddTrigger =
    "h-10 w-full bg-surface border-border/70 rounded-[5px] px-3 font-mono text-xs uppercase tracking-[0.06em]"

  return (
    <div className="bg-surface border-b border-border/70 sticky top-16 z-40">
      {/* Band primary — search + quick filters */}
      <div className="px-4 sm:px-5 py-3 flex flex-col xl:flex-row gap-3 xl:items-end">
        <div className="flex-1 min-w-0">
          <label className={fieldLabel}>Search</label>
          <Input
            placeholder="COMP SCI 400, John Doe, etc."
            value={filters.search_param}
            onChange={(e) => updateFilter("search_param", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:gap-3 gap-3">
          <div className="min-w-[120px]">
            <label className={fieldLabel}>Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger className={`${ddTrigger} mt-1.5`}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="WAITLIST">Waitlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <label className={fieldLabel}>Level</label>
            <Select value={filters.level} onValueChange={(value) => updateFilter("level", value)}>
              <SelectTrigger className={`${ddTrigger} mt-1.5`}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="E">Elementary</SelectItem>
                <SelectItem value="I">Intermediate</SelectItem>
                <SelectItem value="A">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <label className={fieldLabel}>Mode</label>
            <Select value={filters.instruction_mode} onValueChange={(value) => updateFilter("instruction_mode", value)}>
              <SelectTrigger className={`${ddTrigger} mt-1.5`}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Classroom Instruction">In Person</SelectItem>
                <SelectItem value="Online Only">Online</SelectItem>
                <SelectItem value="Online (some classroom)">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <label className={fieldLabel}>Median</label>
            <Select value={filters.median_grade} onValueChange={(value) => updateFilter("median_grade", value)}>
              <SelectTrigger className={`${ddTrigger} mt-1.5`}>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
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

          <div className="min-w-[120px]">
            <label className={fieldLabel}>Limit</label>
            <Select value={filters.limit} onValueChange={(value) => updateFilter("limit", value)}>
              <SelectTrigger className={`${ddTrigger} mt-1.5`}>
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

          <AvailabilityFilter filters={filters} onFiltersChange={onFiltersChange} buttonClassName="mt-1.5" />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button onClick={onSearch} disabled={loading} className="flex-1 xl:flex-none xl:w-[110px]">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button onClick={resetFilters} variant="outline" className="bg-transparent flex-1 xl:flex-none xl:w-[110px]">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Band secondary — gen-ed chips + advanced toggle */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-border/70 flex items-center gap-2 flex-wrap">
        <span className={fieldLabel}>Gen Ed</span>
        {genEdOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleGenEd(value)}
            className={`h-7 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
              filters.gen_ed === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}

        <button
          onClick={() => updateFilter("l_and_s", !filters.l_and_s)}
          className={`h-7 px-2.5 rounded-[5px] border font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
            filters.l_and_s
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent border-border/70 text-foreground hover:border-primary/40"
          }`}
        >
          L&S
        </button>

        <div className="w-px self-stretch bg-border/70 mx-1" />

        <button
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className={`h-7 px-2.5 rounded-[5px] border border-dashed font-mono text-[11px] uppercase tracking-[0.08em] flex items-center gap-1.5 transition-colors ${
            advancedOpen ? "border-primary text-primary" : "border-border/70 text-foreground hover:border-primary/40"
          }`}
        >
          Advanced
          <ChevronDown className={`h-3 w-3 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Advanced strip — expanded sections */}
      {advancedOpen && (
        <div className="px-4 sm:px-5 py-4 border-t border-border/70 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GpaFilterSection filters={filters} onFiltersChange={onFiltersChange} defaultOpen />
          <AdvancedFilterSection filters={filters} onFiltersChange={onFiltersChange} defaultOpen />
          <RmpFilterSection filters={filters} onFiltersChange={onFiltersChange} defaultOpen />
        </div>
      )}
    </div>
  )
}