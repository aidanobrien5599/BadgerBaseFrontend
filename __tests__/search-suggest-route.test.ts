import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const fetchWithRetry = vi.fn()
vi.mock("@/lib/fetch-with-retry", () => ({
  fetchWithRetry: (...args: unknown[]) => fetchWithRetry(...args),
}))

const { GET } = await import("@/app/api/search-suggest/route")

function req(url: string, origin: string | null = "https://badgerbase.app") {
  return new Request(url, {
    headers: origin ? { origin } : {},
  })
}

beforeEach(() => {
  fetchWithRetry.mockReset()
  process.env.API_URL = "https://api.example.com"
  process.env.API_KEY = "secret-key"
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("GET /api/search-suggest", () => {
  it("rejects a disallowed origin", async () => {
    const res = await GET(req("http://x/api/search-suggest?q=comp", "https://evil.com"))
    expect(res.status).toBe(403)
    expect(fetchWithRetry).not.toHaveBeenCalled()
  })

  it("forwards q and limit to the v2 suggest endpoint", async () => {
    fetchWithRetry.mockResolvedValue(
      new Response(JSON.stringify({ suggestions: [] }), { status: 200 })
    )
    await GET(req("http://x/api/search-suggest?q=comp%20sci&limit=5"))

    const [url, init] = fetchWithRetry.mock.calls[0]
    expect(url).toContain("https://api.example.com/v2/api/search/suggest?")
    expect(url).toContain("q=comp+sci")
    expect(url).toContain("limit=5")
    expect((init as RequestInit).headers).toMatchObject({ "x-api-key": "secret-key" })
  })

  it("never forwards unexpected params", async () => {
    fetchWithRetry.mockResolvedValue(
      new Response(JSON.stringify({ suggestions: [] }), { status: 200 })
    )
    await GET(req("http://x/api/search-suggest?q=comp&evil=1"))
    expect(fetchWithRetry.mock.calls[0][0]).not.toContain("evil")
  })

  it("returns the upstream suggestions on success", async () => {
    fetchWithRetry.mockResolvedValue(
      new Response(
        JSON.stringify({
          suggestions: [
            { type: "course", value: "COMP SCI 200", label: "COMP SCI 200", sublabel: "Programming I", course_uuid: "u" },
          ],
        }),
        { status: 200 }
      )
    )
    const res = await GET(req("http://x/api/search-suggest?q=comp"))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      suggestions: [{ value: "COMP SCI 200" }],
    })
  })

  it("propagates an upstream error status", async () => {
    fetchWithRetry.mockResolvedValue(new Response("nope", { status: 503 }))
    const res = await GET(req("http://x/api/search-suggest?q=comp"))
    expect(res.status).toBe(503)
  })

  it("returns 502 when the upstream fetch throws", async () => {
    fetchWithRetry.mockRejectedValue(new Error("ECONNREFUSED"))
    const res = await GET(req("http://x/api/search-suggest?q=comp"))
    expect(res.status).toBe(502)
    expect(await res.json()).toHaveProperty("error")
  })
})
