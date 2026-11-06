// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// The home page pulls in auth/session-aware children; stub the ones that
// would otherwise reach for next/navigation or the auth client.
vi.mock("@/components/verified-toast", () => ({ VerifiedToast: () => null }))
vi.mock("@/components/course-table", () => ({ CourseTable: () => null }))

import HomePage from "@/app/page"

const SUGGESTIONS = [
  { type: "course" as const, value: "DANCE 131", label: "DANCE 131", sublabel: "Hip Hop I", course_uuid: "u1" },
]

const searchInput = () => document.getElementById("search") as HTMLInputElement

/** Every `search_param` the page sent to /api/proxy, in order. */
function proxiedQueries(): (string | null)[] {
  return vi
    .mocked(fetch)
    .mock.calls.map(([url]) => String(url))
    .filter((url) => url.startsWith("/api/proxy"))
    .map((url) => new URLSearchParams(url.split("?")[1]).get("search_param"))
}

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  })
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const body = String(url).startsWith("/api/search-suggest")
        ? { suggestions: SUGGESTIONS }
        : { data: [], count: 0, total_count: 0, has_more: false, filters_applied: {} }
      return { ok: true, json: async () => body } as unknown as Response
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("HomePage search", () => {
  it("searches for the suggestion that was clicked, not the partial text typed", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.type(searchInput(), "dance")
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))
    await user.click(screen.getByText((_, el) => el?.textContent === "DANCE 131"))

    await waitFor(() => expect(proxiedQueries().at(-1)).toBe("DANCE 131"))
  })

  it("searches for the suggestion chosen with the keyboard", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.type(searchInput(), "dance")
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))
    await user.keyboard("{ArrowDown}{Enter}")

    await waitFor(() => expect(proxiedQueries().at(-1)).toBe("DANCE 131"))
  })

  it("Enter with no suggestion highlighted searches the typed text", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.type(searchInput(), "dance{Enter}")

    await waitFor(() => expect(proxiedQueries().at(-1)).toBe("dance"))
  })
})
