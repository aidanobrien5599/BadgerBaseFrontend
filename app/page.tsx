"use client"

import { useState, useEffect } from "react"
import { SearchFilters, type FilterState } from "@/components/search-filters"
import { ControlBand } from "@/components/control-band"
import { CourseTable } from "@/components/course-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { saveSearchState, loadSearchState } from "@/lib/search-state"

interface Course {
  course_id: number
  subject_code: string
  course_designation: string
  full_course_designation: string
  minimum_credits: number
  maximum_credits: number
  level: string
  cumulative_gpa: number
  most_recent_gpa: number
  median_grade: string
  a_percent: number
  ab_percent: number
  b_percent: number
  bc_percent: number
  c_percent: number
  d_percent: number
  f_percent: number
  ethnic_studies: string | null
  social_science: string | null
  humanities: string | null
  biological_science: string | null
  physical_science: string | null
  natural_science: string | null
  literature: string | null
  course_title: string
  course_description: string | null
  enrollment_prerequisites: string | null
  sections: Section[]
  madgrades_course_uuid: string
  general_education: string | null
  typically_offered: string | null
  workplace_experience_description: string | null
  repeatable_for_credit: string | null
  status: number // 0 = closed/full, 1 = waitlist, 2 = open
}

interface Section {
  section_id: number
  status: string
  available_seats: number
  waitlist_total: number
  capacity: number
  enrolled: number
  meeting_time: string
  location: string
  instruction_mode: string
  is_asynchronous: boolean
  section_avg_rating: number
  section_avg_difficulty: number
  section_total_ratings: number
  section_avg_would_take_again: number
  instructors: Instructor[]
}

interface Instructor {
  name: string
  avg_rating: number
  avg_difficulty: number
  num_ratings: number
  would_take_again_percent: number
  rmp_instructor_id: string
}

interface ApiResponse {
  data: Course[]
  count: number
  total_count: number
  has_more: boolean
  filters_applied: any
}

const SEARCH_STATE_KEY = "bb-search-state"

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [view, setView] = useState<"sidebar" | "band">(() => {
    if (typeof window === "undefined") return "sidebar"
    if (window.innerWidth < 1024) return "sidebar"
    return (localStorage.getItem("bb-view") as "sidebar" | "band") || "sidebar"
  })
  const [filters, setFilters] = useState<FilterState>({
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
    mondayStartTime: "",
    mondayEndTime: "",
    tuesdayStartTime: "",
    tuesdayEndTime: "",
    wednesdayStartTime: "",
    wednesdayEndTime: "",
    thursdayStartTime: "",
    thursdayEndTime: "",
    fridayStartTime: "",
    fridayEndTime: "",
    gen_ed: "",
    l_and_s: false,
    sort: "",
  })

  const searchCourses = async (page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      // Add pagination parameter
      params.append("page", page.toString())

      // Add all non-empty filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "" && value !== false) {
          if (typeof value === "boolean") {
            params.append(key, "true")
          } else {
            params.append(key, value.toString())
          }
        }
      })

      console.log(params.toString())

      const response = await fetch(`/api/proxy?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setCourses(data.data || [])
      setCurrentPage(page)
      setTotalCount(data.total_count || 0)
      setHasMore(data.has_more || false)
      saveSearchState({
        filters,
        currentPage: page,
        courses: data.data || [],
        totalCount: data.total_count || 0,
        hasMore: data.has_more || false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setCourses([])
      setCurrentPage(1)
      setTotalCount(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Search on initial load
  useEffect(() => {
    const saved = loadSearchState<FilterState, Course>()
    if (saved) {
      setFilters(saved.filters)
      setCurrentPage(saved.currentPage)
      setCourses(saved.courses)
      setTotalCount(saved.totalCount)
      setHasMore(saved.hasMore)
    } else {
      searchCourses(1)
    }
  }, [])

  const handlePageChange = (page: number) => {
    searchCourses(page)
  }

  const handleViewChange = (newView: "sidebar" | "band") => {
    setView(newView)
    localStorage.setItem("bb-view", newView)
  }

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024 && view === "band") {
        setView("sidebar")
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [view])

  const handleSearch = () => {
    setCurrentPage(1)
    searchCourses(1)
  }

  const handleSortChange = (newSort: string) => {
    setFilters((prev) => ({ ...prev, sort: newSort }))
    setCurrentPage(1)
    // Create updated filters with new sort value
    const updatedFilters = { ...filters, sort: newSort }

    // Build params with updated sort
    const params = new URLSearchParams()
    params.append("page", "1")

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== false) {
        if (typeof value === "boolean") {
          params.append(key, "true")
        } else {
          params.append(key, value.toString())
        }
      }
    })

    setLoading(true)
    setError(null)

    fetch(`/api/proxy?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data: ApiResponse) => {
        setCourses(data.data || [])
        setCurrentPage(1)
        setTotalCount(data.total_count || 0)
        setHasMore(data.has_more || false)
        saveSearchState({
          filters: updatedFilters,
          currentPage: 1,
          courses: data.data || [],
          totalCount: data.total_count || 0,
          hasMore: data.has_more || false,
        })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An error occurred")
        setCourses([])
        setCurrentPage(1)
        setTotalCount(0)
        setHasMore(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const totalPages = Math.ceil(totalCount / Number.parseInt(filters.limit))

  const results = (
    <section className="min-w-0">
      {error && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-24 border-b border-border/70">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Loading courses</span>
        </div>
      ) : (
        <CourseTable
          courses={courses}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          hasMore={hasMore}
          onPageChange={handlePageChange}
          resultsPerPage={Number.parseInt(filters.limit)}
          currentSort={filters.sort || ""}
          onSortChange={handleSortChange}
          view={view}
          onViewChange={handleViewChange}
        />
      )}
    </section>
  )

  return (
    <div>
      {view === "band" && (
        <ControlBand filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} loading={loading} />
      )}

      <div className={view === "sidebar" ? "grid grid-cols-1 lg:grid-cols-[300px_1fr]" : ""}>
        {view === "sidebar" && (
          <aside className="bg-surface border-b border-border/70 lg:border-b-0 lg:border-r lg:border-border/70 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto px-5 py-5">
            <SearchFilters filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} loading={loading} />
          </aside>
        )}

        {results}
      </div>
    </div>
  )
}
