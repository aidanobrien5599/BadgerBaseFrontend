"use client"

import { useEffect, useState } from "react"

/**
 * Returns `value` delayed until it has stopped changing for `delayMs`.
 *
 * Debounce, not throttle: a throttle emits on a fixed cadence while the user
 * is still typing, firing requests for prefixes they have already typed past.
 * Waiting for a pause is what "the user has typed enough to mean something"
 * actually looks like.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
