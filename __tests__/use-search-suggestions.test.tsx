// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"

const COURSE = {
  type: "course" as const,
  value: "COMP SCI 200",
  label: "COMP SCI 200",
  sublabel: "Programming I",
  course_uuid: "u",
}

function jsonResponse(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("useSearchSuggestions", () => {
  it("issues no request for a query under 2 characters", async () => {
    renderHook(() => useSearchSuggestions("c"))
    await new Promise((r) => setTimeout(r, 300))
    expect(fetch).not.toHaveBeenCalled()
  })

  it("issues no request for a whitespace-only query", async () => {
    renderHook(() => useSearchSuggestions("   "))
    await new Promise((r) => setTimeout(r, 300))
    expect(fetch).not.toHaveBeenCalled()
  })

  it("fetches and exposes suggestions", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ suggestions: [COURSE] }))
    const { result } = renderHook(() => useSearchSuggestions("comp"))

    await waitFor(() => expect(result.current.suggestions).toHaveLength(1))
    expect(result.current.suggestions[0].value).toBe("COMP SCI 200")
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(false)
  })

  it("URL-encodes the query", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ suggestions: [] }))
    renderHook(() => useSearchSuggestions("comp sci & math"))

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const url = vi.mocked(fetch).mock.calls[0][0] as string
    expect(url).toContain("/api/search-suggest?")
    expect(url).not.toContain(" ")
    expect(url).toContain("%26")
  })

  it("aborts the in-flight request when the query changes", async () => {
    const signals: AbortSignal[] = []
    vi.mocked(fetch).mockImplementation((_url, init) => {
      signals.push((init as RequestInit).signal as AbortSignal)
      return new Promise(() => {}) // never settles
    })

    const { rerender } = renderHook(({ q }) => useSearchSuggestions(q), {
      initialProps: { q: "comp" },
    })
    await waitFor(() => expect(signals.length).toBe(1))

    rerender({ q: "comp sci" })
    await waitFor(() => expect(signals.length).toBe(2))

    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it("sets error and empties suggestions when the request fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"))
    const { result } = renderHook(() => useSearchSuggestions("comp"))

    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.suggestions).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it("sets error on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 502 } as Response)
    const { result } = renderHook(() => useSearchSuggestions("comp"))
    await waitFor(() => expect(result.current.error).toBe(true))
  })

  it("clears suggestions when the query drops below the minimum", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ suggestions: [COURSE] }))
    const { result, rerender } = renderHook(({ q }) => useSearchSuggestions(q), {
      initialProps: { q: "comp" },
    })
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1))

    rerender({ q: "c" })
    await waitFor(() => expect(result.current.suggestions).toEqual([]))
  })

  it("does not report an abort as an error", async () => {
    vi.mocked(fetch).mockImplementation((_url, init) => {
      const signal = (init as RequestInit).signal as AbortSignal
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          const err = new Error("aborted")
          err.name = "AbortError"
          reject(err)
        })
      })
    })

    const { result, rerender } = renderHook(({ q }) => useSearchSuggestions(q), {
      initialProps: { q: "comp" },
    })
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    rerender({ q: "comp sci" })
    await new Promise((r) => setTimeout(r, 300))

    expect(result.current.error).toBe(false)
  })
})
