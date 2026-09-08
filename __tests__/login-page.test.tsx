// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"

const signInEmail = vi.fn()
const signInMagicLink = vi.fn()
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: (...a: unknown[]) => signInEmail(...a),
      magicLink: (...a: unknown[]) => signInMagicLink(...a),
    },
  },
}))

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

import LoginPage from "@/app/login/page"

// The redirect target for a resumed OAuth authorization is not guaranteed to
// be this origin (see app/login/page.tsx), so the fix under test assigns
// `window.location.href` rather than calling router.push. jsdom's real
// Location object logs a "Not implemented: navigation" error on that
// assignment without actually recording it, so swap in a plain writable
// object for the duration of these tests.
const originalLocation = window.location

// fake timers (needed to control handlePasswordLogin's setTimeout) make
// @testing-library's polling helpers (waitFor/findBy*) hang, since those
// poll via a real setInterval under the hood. Submitting inside `act`'s
// async form flushes the awaited signIn.email() microtasks without relying
// on that polling, so state is assertable synchronously right after.
async function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "badger@wisc.edu" } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "on-wisconsin-2026" } })
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
  })
}

describe("LoginPage", () => {
  beforeEach(() => {
    signInEmail.mockReset()
    signInMagicLink.mockReset()
    push.mockReset()
    vi.useFakeTimers()
    // Location's fields are prototype getters, not own properties, so a
    // spread copies none of them — list what next/image and the app code
    // actually read out explicitly instead. Redefined via defineProperty
    // (rather than `delete` + assign) so it type-checks as a plain
    // stand-in without fighting Window's own `Location` typing.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: originalLocation.href,
        origin: originalLocation.origin,
        protocol: originalLocation.protocol,
        host: originalLocation.host,
        hostname: originalLocation.hostname,
        pathname: originalLocation.pathname,
        search: originalLocation.search,
        hash: originalLocation.hash,
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation })
  })

  test("navigates the full page when sign-in resumes a pending OAuth authorization", async () => {
    const redirectUrl = "https://badgerbase.app/consent?client_id=https%3A%2F%2Fclaude.ai%2Fmcp"
    signInEmail.mockResolvedValue({ data: { redirect: true, url: redirectUrl }, error: null })

    render(<LoginPage />)
    await fillAndSubmit()

    expect(window.location.href).toBe(redirectUrl)
    expect(push).not.toHaveBeenCalled()
  })

  test("still pushes home on an ordinary sign-in with no pending authorization", async () => {
    const unchangedHref = window.location.href
    signInEmail.mockResolvedValue({ data: { user: { id: "u1" } }, error: null })

    render(<LoginPage />)
    await fillAndSubmit()

    expect(screen.getByText(/successfully signed in/i)).toBeInTheDocument()
    expect(window.location.href).toBe(unchangedHref)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(push).toHaveBeenCalledWith("/")
  })
})
