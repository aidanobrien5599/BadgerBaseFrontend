"use client"
import { useState, useEffect, useRef } from "react" // Import useRef
import { SearchFilters } from "@/components/search-filters"
import { CourseTable } from "@/components/course-table"
import { TikTokFeed } from "@/components/tiktok-feed"
import { DopamineDashboard } from "@/components/dopamine-dashboard"
import { TrendingFeed } from "@/components/trending-feed"
import { NotificationTicker } from "@/components/notification-ticker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Zap, TrendingUp, Users, File as Fire } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

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
  sections: Section[]
  madgrades_course_uuid: string
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
}

export default function HomePage() {
  const isMobile = useIsMobile()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(247)
  const [totalSearches, setTotalSearches] = useState(15420)
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
  })

  // Keep the original audio refs for preloading
  const bellSoundRef = useRef<HTMLAudioElement>(null)
  const clickSoundRef = useRef<HTMLAudioElement>(null)

  // Live stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10 - 5))
      setTotalSearches((prev) => prev + Math.floor(Math.random() * 5))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Function to play overlapping bell sounds
  const playBellSound = () => {
    if (bellSoundRef.current) {
      // Clone the audio element to allow overlapping
      const audioClone = bellSoundRef.current.cloneNode() as HTMLAudioElement
      audioClone.play().catch((e) => console.log("Bell sound autoplay blocked:", e))
    }
  }

  // Function to play overlapping click sounds
  const playClickSound = () => {
    if (clickSoundRef.current) {
      // Clone the audio element to allow overlapping
      const audioClone = clickSoundRef.current.cloneNode() as HTMLAudioElement
      audioClone.play().catch((e) => console.log("Click sound autoplay blocked:", e))
    }
  }

  // Bell sound interval - now plays overlapping sounds
  useEffect(() => {
    const bellInterval = setInterval(() => {
      playBellSound()
    }, 100) // Play bell every 0.1 seconds
    return () => clearInterval(bellInterval)
  }, [])

  const searchCourses = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
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
      const data: ApiResponse = await response.json()
      setCourses(data.data || [])
      setCurrentPage(page)
      setTotalCount(data.total_count || 0)
      setHasMore(data.has_more || false)
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

  useEffect(() => {
    searchCourses(1)
  }, [])

  const handlePageChange = (page: number) => {
    playClickSound() // Play click sound on page change
    searchCourses(page)
  }

  const handleSearch = () => {
    playClickSound() // Play click sound on search
    setCurrentPage(1)
    searchCourses(1)
  }

  const totalPages = Math.ceil(totalCount / Number.parseInt(filters.limit))

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        {isMobile ? (
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_2Uw13M88jvJCMJN6OjPlqwC7dTHl/tUzt_8JRUom5ryoq3JgGC1/public/videos/background-video-mobile.mp4"
            type="video/mp4"
          />
        ) : (
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_2Uw13M88jvJCMJN6OjPlqwC7dTHl/5zf3UQPkaMC5E4i--ejFzm/public/videos/background-video.mp4"
            type="video/mp4"
          />
        )}
      </video>
      {/* Audio elements for sounds - these are used as templates for cloning */}
      <audio
        ref={bellSoundRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_2Uw13M88jvJCMJN6OjPlqwC7dTHl/B0g4cHw2pSmuN9cDtf_you/public/sounds/bell-sound.mp3"
        preload="auto"
      />
      <audio
        ref={clickSoundRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_2Uw13M88jvJCMJN6OjPlqwC7dTHl/B0g4cHw2pSmuN9cDtf_you/public/sounds/bell-sound.mp3"
        preload="auto"
      />

      {/* Extreme flashing background overlay */}

      <div className="relative z-10">
        <NotificationTicker />
        {/* Live Stats Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 animate-super-fast-pulse">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Badge className="bg-white/20 text-yellow-300 animate-super-fast-pulse animate-ping">
                <Users className="h-3 w-3 mr-1 animate-hyper-spin" />
                {onlineUsers} online now
              </Badge>
              <Badge className="bg-white/20 text-yellow-300 animate-super-fast-pulse animate-ping">
                <TrendingUp className="h-3 w-3 mr-1 animate-hyper-spin" />
                {totalSearches.toLocaleString()} searches today
              </Badge>
              <Badge className="bg-white/20 text-yellow-300 animate-super-fast-pulse animate-ping">
                <Fire className="h-3 w-3 mr-1 animate-hyper-spin" />🔥 TRENDING: CS 540, MATH 221, BIO 152
              </Badge>
            </div>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 animate-bounce animate-super-fast-pulse"
              onClick={playClickSound}
            >
              <Sparkles className="h-4 w-4 mr-2 animate-hyper-spin" />
              Level Up!
            </Button>
          </div>
        </div>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
            {/* Left Sidebar - Filters & Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-4 border-red-500 bg-gradient-to-br from-purple-50 to-pink-50 animate-border-flash animate-super-fast-pulse">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 animate-text-flash">
                    <Zap className="h-5 w-5 text-purple-500 animate-hyper-spin" />
                    Search & Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SearchFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSearch={handleSearch}
                    loading={loading}
                  />
                </CardContent>
              </Card>
              <DopamineDashboard />
            </div>
            {/* Center - Course Results */}
            <div className="lg:col-span-3">
              {error && (
                <Alert className="mb-6 animate-super-fast-pulse" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {loading ? (
                <Card className="border-4 border-lime-500 animate-border-flash">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-hyper-spin mr-2 text-blue-500" />
                    <span className="text-lg animate-text-flash text-red-500">Finding your perfect courses...</span>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <CourseTable
                    courses={courses}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    hasMore={hasMore}
                    onPageChange={handlePageChange}
                    resultsPerPage={Number.parseInt(filters.limit)}
                  />
                </div>
              )}
            </div>
            {/* Right Sidebar - Social Feeds */}
            <div className="lg:col-span-2 space-y-6">
              <TikTokFeed />
              <TrendingFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
