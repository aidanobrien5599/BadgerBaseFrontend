// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 200))
    expect(result.current).toBe("a")
  })

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebouncedValue(v, 200),
      { initialProps: { v: "a" } }
    )
    rerender({ v: "b" })
    act(() => { vi.advanceTimersByTime(199) })
    expect(result.current).toBe("a")
  })

  it("updates once the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebouncedValue(v, 200),
      { initialProps: { v: "a" } }
    )
    rerender({ v: "b" })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe("b")
  })

  it("only emits the final value during rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebouncedValue(v, 200),
      { initialProps: { v: "c" } }
    )
    for (const v of ["co", "com", "comp"]) {
      rerender({ v })
      act(() => { vi.advanceTimersByTime(50) })
    }
    expect(result.current).toBe("c")
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe("comp")
  })
})
