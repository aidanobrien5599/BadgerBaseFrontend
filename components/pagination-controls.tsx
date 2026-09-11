"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  hasMore: boolean
  onPageChange: (page: number) => void
  resultsPerPage: number
  currentSort: string
  onSortChange: (sort: string) => void
  view: "sidebar" | "band"
  onViewChange: (view: "sidebar" | "band") => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  hasMore,
  onPageChange,
  resultsPerPage,
  currentSort,
  onSortChange,
  view,
  onViewChange,
}: PaginationControlsProps) {
  const startResult = (currentPage - 1) * resultsPerPage + 1
  const endResult = Math.min(currentPage * resultsPerPage, totalCount)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 4) {
        pages.push("...")
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 3) {
        pages.push("...")
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const renderPager = (compact: boolean) => (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-7 w-7 p-0 rounded-[5px] bg-surface border-border/70"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-7 w-7 p-0 rounded-[5px] bg-surface border-border/70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      {compact ? (
        <span className="px-2.5 font-mono text-xs tabular-nums whitespace-nowrap">
          <span className="font-semibold text-primary">{currentPage}</span>
          <span className="text-muted-foreground"> / {totalPages}</span>
        </span>
      ) : (
        pageNumbers.map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-1.5 text-sm text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`h-7 min-w-7 px-1 rounded-[5px] font-mono text-xs ${
                  currentPage === page ? "" : "bg-surface border-border/70"
                }`}
              >
                {page}
              </Button>
            )}
          </div>
        ))
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasMore || currentPage === totalPages}
        className="h-7 w-7 p-0 rounded-[5px] bg-surface border-border/70"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-7 w-7 p-0 rounded-[5px] bg-surface border-border/70"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )

  return (
    <div className="@container flex flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-border/70 bg-surface">
      <div className="flex flex-row items-center justify-between gap-3">
        {/* Left: count — cardinal numeral + label + mono sub */}
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="font-display text-sm font-semibold text-primary tabular-nums leading-none">
            {totalCount.toLocaleString()}
          </span>
          <span className="font-display text-sm font-semibold text-foreground">courses</span>
          {/* Redundant with the pager's "n / total" readout once the bar is tight */}
          <span className="hidden @[900px]:inline font-mono text-[11px] text-muted-foreground">
            {startResult.toLocaleString()}–{endResult.toLocaleString()}
          </span>
        </div>

        {/* Right: view toggle + sort + pager */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle — sidebar vs top band (desktop only; mobile is always sidebar) */}
          <div className="hidden md:flex items-center rounded-[5px] border border-border/70 overflow-hidden">
            <button
              onClick={() => onViewChange("sidebar")}
              className={`h-8 px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                view === "sidebar" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              Sidebar
            </button>
            <button
              onClick={() => onViewChange("band")}
              className={`h-8 px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors border-l border-border/70 ${
                view === "band" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              Top Band
            </button>
          </div>

          <Select value={currentSort} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 w-[150px] md:w-[160px] rounded-[5px] bg-surface border-border/70 font-mono text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Catalog #</SelectItem>
              <SelectItem value="cumulative_gpa">Cumulative GPA</SelectItem>
              <SelectItem value="recent_gpa">Recent GPA</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden @[560px]:block @[920px]:hidden">{renderPager(true)}</div>
          <div className="hidden @[920px]:block">{renderPager(false)}</div>
        </div>
      </div>

      {/* Phone pager — its own row only when the bar is too narrow to inline it */}
      <div className="flex @[560px]:hidden items-center justify-center">
        {renderPager(true)}
      </div>
    </div>
  )
}