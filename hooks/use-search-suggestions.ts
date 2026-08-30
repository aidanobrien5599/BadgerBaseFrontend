"use client"

import { useEffect, useRef, useState } from "react"
import { useDebouncedValue } from "./use-debounced-value"

export type SuggestionType = "course" | "instructor"

export interface Suggestion {
  type: SuggestionType
  /** Written into `search_param` when selected. */
  value: string
  label: string
  sublabel: string | null
  course_uuid: string | null
}

/** Mirrors MIN_QUERY_LENGTH on the API — below this, nothing is requested. */
export const MIN_QUERY_LENGTH = 2
export const DEBOUNCE_MS = 200

interface SuggestionsState {
  suggestions: Suggestion[]
  loading: boolean
  error: boolean
}

/**
 * Debounced, race-safe course/instructor suggestions.
 *
 * Each request carries an AbortSignal that is fired when the query changes or
 * the component unmounts. Without it, a slow response for an earlier prefix
 * can resolve after a newer one and repaint stale suggestions.
 *
 * Errors are surfaced as a flag rather than thrown: the dropdown is a
 * progressive enhancement and must never break the plain search input.
 */
export function useSearchSuggestions(query: string): SuggestionsState {
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS)
  const [state, setState] = useState<SuggestionsState>({
    suggestions: [],
    loading: false,
    error: false,
  })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    controllerRef.current?.abort()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      controllerRef.current = null
      setState({ suggestions: [], loading: false, error: false })
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller

    setState((prev) => ({ ...prev, loading: true, error: false }))

    fetch(`/api/search-suggest?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`)
        const body = (await response.json()) as { suggestions?: Suggestion[] }
        if (controller.signal.aborted) return
        setState({
          suggestions: body.suggestions ?? [],
          loading: false,
          error: false,
        })
      })
      .catch((err: unknown) => {
        // An abort is an expected supersession, not a failure.
        if (err instanceof Error && err.name === "AbortError") return
        if (controller.signal.aborted) return
        setState({ suggestions: [], loading: false, error: true })
      })

    return () => controller.abort()
  }, [debouncedQuery])

  return state
}
