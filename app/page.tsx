"use client"

import { useState, useEffect } from "react"
import { SearchFilters } from "@/components/search-filters"
import { CourseTable } from "@/components/course-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

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
  sections: Section[]
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
}

interface FilterState {
  search_param: string
  status: string
  min_available_seats: string
  instruction_mode: string
  limit: string
  min_credits: string
  max_credits: string
  level: string
  ethnic_studies: boolean
  social_science: boolean
  humanities: boolean
  biological_science: boolean
  physical_science: boolean
  natural_science: boolean
  literature: boolean
  min_cumulative_gpa: string
  min_most_recent_gpa: string
  min_section_avg_rating: string
  min_section_avg_difficulty: string
  min_section_total_ratings: string
  min_section_avg_would_take_again: string
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search_param: "",
    status: "",
    min_available_seats: "",
    instruction_mode: "",
    limit: "20",
    min_credits: "",
    max_credits: "",
    level: "",
    ethnic_studies: false,
    social_science: false,
    humanities: false,
    biological_science: false,
    physical_science: false,
    natural_science: false,
    literature: false,
    min_cumulative_gpa: "",
    min_most_recent_gpa: "",
    min_section_avg_rating: "",
    min_section_avg_difficulty: "",
    min_section_total_ratings: "",
    min_section_avg_would_take_again: "",
  })

  const searchCourses = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

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

      const response = await fetch(`/api/proxy?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCourses(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Search on initial load
  useEffect(() => {
    searchCourses()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Search</h1>
        <p className="text-gray-600">Search and filter university courses with instructor ratings and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={searchCourses}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading courses...</span>
              </CardContent>
            </Card>
          ) : (
            <CourseTable courses={courses} />
          )}
        </div>
      </div>
    </div>
  )
}
