"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CourseDetail, type CourseDetailData } from "@/components/course-detail"

export default function CoursePage() {
  const params = useParams<{ designation: string }>()
  const designation = useMemo(() => {
    const raw = params?.designation
    if (!raw) return undefined
    try {
      return decodeURIComponent(raw)
    } catch {
      return undefined
    }
  }, [params])
  const [course, setCourse] = useState<CourseDetailData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (!designation) return
    let cancelled = false
    setStatus("loading")
    const qs = new URLSearchParams({ search_param: designation, limit: "1" })
    fetch(`/api/proxy?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const c = d?.data?.[0]
        if (c) {
          setCourse(c as CourseDetailData)
          setStatus("ready")
        } else {
          setStatus("error")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [designation])

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-16">
        <div className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground animate-pulse">
          LOADING COURSE…
        </div>
      </div>
    )
  }

  if (status === "error" || !course) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-16">
        <div className="py-8">
          <p className="font-display text-xl font-semibold text-foreground mb-2">Course not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            We couldn&apos;t load the course for this designation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.09em] text-primary hover:underline"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            BACK TO COURSE SEARCH
          </Link>
        </div>
      </div>
    )
  }

  return <CourseDetail course={course} />
}