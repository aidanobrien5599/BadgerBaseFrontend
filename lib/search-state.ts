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