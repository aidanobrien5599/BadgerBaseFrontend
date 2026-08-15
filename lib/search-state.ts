export const SEARCH_STATE_KEY = "bb-search-state"

export interface SavedSearchState<TFilters, TCourse> {
  filters: TFilters
  currentPage: number
  courses: TCourse[]
  totalCount: number
  hasMore: boolean
}

export function saveSearchState<TFilters, TCourse>(state: SavedSearchState<TFilters, TCourse>) {
  try {
    sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable — ignore
  }
}

export function loadSearchState<TFilters, TCourse>(): SavedSearchState<TFilters, TCourse> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SEARCH_STATE_KEY)
    return raw ? (JSON.parse(raw) as SavedSearchState<TFilters, TCourse>) : null
  } catch {
    return null
  }
}

export function clearSearchState() {
  try {
    sessionStorage.removeItem(SEARCH_STATE_KEY)
  } catch {
    // storage unavailable — ignore
  }
}

export function encodeSearchStateToQuery(state: { filters: unknown; currentPage: number }): string {
  const json = JSON.stringify({ f: state.filters, p: state.currentPage })
  return btoa(encodeURIComponent(json)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function loadSearchStateFromUrl<TFilters>(): { filters: TFilters; currentPage: number } | null {
  if (typeof window === "undefined") return null
  const raw = new URLSearchParams(window.location.search).get("bb")
  if (!raw) return null
  try {
    const padded = raw.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "=")))
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed === "object" && parsed.f) {
      return { filters: parsed.f as TFilters, currentPage: Number(parsed.p) || 1 }
    }
  } catch {
    return null
  }
  return null
}