import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { isAllowedOrigin } from '@/lib/allowed-origins'

/**
 * Server-side proxy for the v2 autocomplete endpoint. Exists so the API key
 * never reaches the browser. Only `q` and `limit` are forwarded — the
 * upstream is not a general-purpose passthrough.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const origin = request.headers.get("origin") || request.headers.get("referer")
  if (!isAllowedOrigin(origin)) {
    return new Response("Forbidden: Invalid origin", { status: 403 })
  }

  const API_BASE_URL = process.env.API_URL || "http://localhost:3002"
  const API_KEY = process.env.API_KEY || ""

  const forwarded = new URLSearchParams()
  forwarded.set("q", searchParams.get("q") ?? "")
  const limit = searchParams.get("limit")
  if (limit) forwarded.set("limit", limit)

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/v2/api/search/suggest?${forwarded.toString()}`,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return Response.json(
        { error: `API responded with status: ${response.status}` },
        { status: response.status }
      )
    }

    return Response.json(await response.json())
  } catch (error: any) {
    console.error("Suggest proxy error:", error.message || error)
    return Response.json(
      { error: error.message || "Failed to fetch suggestions" },
      { status: 502 }
    )
  }
}
