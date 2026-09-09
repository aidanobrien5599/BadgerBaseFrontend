// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CourseTable } from "@/components/course-table"

// `courses.course_id` is a zero-padded text key in Postgres, and the /v2
// subscription handler matches it as an exact string. Anything that strips the
// leading zeros on the way out (parseInt) makes the row unfindable and the API
// answers 404 "Course not found".
const PADDED_COURSE_ID = "024794"

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "student@wisc.edu" },
    loading: false,
    isAuthenticated: true,
  }),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

/** A course with no OPEN or WAITLISTED section, so it renders the notify button. */
const CLOSED_COURSE = {
  course_id: PADDED_COURSE_ID,
  course_designation: "COMP SCI 400",
  full_course_designation: "COMPUTER SCIENCES 400",
  course_title: "Programming III",
  sections: [{ section_id: "1", status: "CLOSED" }],
} as unknown as React.ComponentProps<typeof CourseTable>["courses"][number]

function renderTable() {
  return render(
    <CourseTable
      courses={[CLOSED_COURSE]}
      currentPage={1}
      totalPages={1}
      totalCount={1}
      hasMore={false}
      onPageChange={() => {}}
      resultsPerPage={25}
      currentSort="relevance"
      onSortChange={() => {}}
      view="sidebar"
      onViewChange={() => {}}
    />,
  )
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ message: "Subscription created successfully" }),
    } as unknown as Response),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("closed-course notification signup", () => {
  it("posts course_id with its leading zeros intact", async () => {
    const user = userEvent.setup()
    renderTable()

    // The whole course row is also a button whose text contains "Closed";
    // the notify control is the one whose entire label is that word.
    await user.click(screen.getByRole("button", { name: /^closed$/i }))

    await waitFor(() => expect(fetch).toHaveBeenCalled())

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe("/api/subscriptions/course")

    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.course_id).toBe(PADDED_COURSE_ID)
  })
})
