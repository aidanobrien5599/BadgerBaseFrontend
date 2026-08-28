// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { SearchAutocomplete } from "@/components/search-autocomplete"

const SUGGESTIONS = [
  { type: "course" as const, value: "COMP SCI 200", label: "COMP SCI 200", sublabel: "Programming I", course_uuid: "u1" },
  { type: "course" as const, value: "COMP SCI 400", label: "COMP SCI 400", sublabel: "Programming III", course_uuid: "u2" },
  { type: "instructor" as const, value: "Jim Williams", label: "Jim Williams", sublabel: "Instructor · 3 sections", course_uuid: null },
]

function mockSuggest(suggestions = SUGGESTIONS) {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ suggestions }),
  } as unknown as Response)
}

/** Wrapper that owns state, the way search-filters.tsx does. */
function Harness({ onSearch = () => {} }: { onSearch?: () => void }) {
  const [value, setValue] = useState("")
  return (
    <SearchAutocomplete
      value={value}
      onValueChange={setValue}
      onSearch={onSearch}
      placeholder="COMP SCI 400, John Doe, etc."
    />
  )
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("SearchAutocomplete", () => {
  it("renders a combobox input", () => {
    render(<Harness />)
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("shows no dropdown before typing", () => {
    render(<Harness />)
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("shows suggestions after typing", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByRole("combobox"), "comp")
    // Wait for actual suggestion data, not merely "the listbox exists": the
    // listbox now renders in every open state (loading/empty/populated, per
    // the aria-controls fix below), so its mere presence in the DOM no
    // longer implies the debounced fetch has resolved.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))
    // Plain string matching can't find this: the matched "COMP" prefix is
    // wrapped in its own <mark> element (per the approved highlight design),
    // so RTL's default getByText — which only reads an element's *direct*
    // text-node children — never sees the full concatenated label. This is
    // RTL's documented limitation for split text, not an a11y gap: a screen
    // reader reads the adjacent sibling text fine. Match on full textContent
    // instead, per RTL's own recommended workaround for this exact case.
    expect(screen.getByText((_, el) => el?.textContent === "COMP SCI 200")).toBeInTheDocument()
    expect(screen.getByText("Jim Williams")).toBeInTheDocument()
  })

  it("selecting a suggestion sets the value and runs the search", async () => {
    mockSuggest()
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSearch={onSearch} />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    // See note above on waiting for real options, not just an open listbox.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))
    // See note above: match on full textContent since "COMP" is split into
    // its own <mark> element.
    await user.click(screen.getByText((_, el) => el?.textContent === "COMP SCI 400"))

    expect((input as HTMLInputElement).value).toBe("COMP SCI 400")
    expect(onSearch).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
  })

  it("arrow down then Enter selects the first suggestion", async () => {
    mockSuggest()
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSearch={onSearch} />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    // See note above on waiting for real options, not just an open listbox.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))

    await user.keyboard("{ArrowDown}{Enter}")
    expect((input as HTMLInputElement).value).toBe("COMP SCI 200")
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it("arrow down twice selects the second suggestion", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    // See note above on waiting for real options, not just an open listbox.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    expect((input as HTMLInputElement).value).toBe("COMP SCI 400")
  })

  it("arrow up from nothing wraps to the last suggestion", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    // See note above on waiting for real options, not just an open listbox.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))

    await user.keyboard("{ArrowUp}{Enter}")
    expect((input as HTMLInputElement).value).toBe("Jim Williams")
  })

  it("Enter with no active option runs the search with the typed text", async () => {
    mockSuggest()
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSearch={onSearch} />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument())

    await user.keyboard("{Enter}")
    expect((input as HTMLInputElement).value).toBe("comp")
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it("Escape closes the dropdown but keeps the typed text", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument())

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect((input as HTMLInputElement).value).toBe("comp")
  })

  it("refocusing before the blur-close timer fires keeps the panel open", async () => {
    // Regression test: onBlur arms a 150ms setTimeout(close). If the input
    // regains focus before that timer fires (e.g. Tab away and Shift+Tab
    // straight back), the orphaned timer must not survive to slam the panel
    // shut later while the input is sitting there focused.
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument())

    fireEvent.blur(input)
    fireEvent.focus(input)

    // Past the 150ms blur-close delay the orphaned timer would have fired at.
    await new Promise((r) => setTimeout(r, 200))

    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })

  it("sets aria-expanded to reflect dropdown state", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("aria-expanded", "false")

    await user.type(input, "comp")
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"))
  })

  it("points aria-activedescendant at the active option", async () => {
    mockSuggest()
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp")
    // See note above on waiting for real options, not just an open listbox.
    await waitFor(() => expect(screen.getAllByRole("option").length).toBeGreaterThan(0))

    await user.keyboard("{ArrowDown}")
    const activeId = input.getAttribute("aria-activedescendant")
    expect(activeId).toBeTruthy()
    expect(document.getElementById(activeId!)).toHaveTextContent("COMP SCI 200")
  })

  it("shows an empty state when nothing matches", async () => {
    mockSuggest([])
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByRole("combobox"), "zzzz")
    await waitFor(() => expect(screen.getByText(/no matches/i)).toBeInTheDocument())
  })

  it("aria-controls points at a real listbox element in the empty state", async () => {
    // Regression test: aria-controls/aria-expanded on the input claim a
    // listbox exists whenever isOpen, but the <ul role="listbox"> used to
    // only render in the populated branch — leaving the empty and loading
    // states advertising a listbox that wasn't actually in the a11y tree.
    mockSuggest([])
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole("combobox")
    await user.type(input, "zzzz")
    await waitFor(() => expect(screen.getByText(/no matches/i)).toBeInTheDocument())

    const controlsId = input.getAttribute("aria-controls")
    expect(controlsId).toBeTruthy()
    expect(document.getElementById(controlsId!)).not.toBeNull()
    expect(document.getElementById(controlsId!)).toHaveAttribute("role", "listbox")
  })

  it("stays usable as a plain input when the fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"))
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<Harness onSearch={onSearch} />)

    const input = screen.getByRole("combobox")
    await user.type(input, "comp sci")
    await new Promise((r) => setTimeout(r, 300))

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    await user.keyboard("{Enter}")
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect((input as HTMLInputElement).value).toBe("comp sci")
  })
})
