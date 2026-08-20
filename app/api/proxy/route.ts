import { fetchWithRetry } from '@/lib/fetch-with-retry'
import PostHogClient from '@/lib/posthog'

const ALLOWED_ORIGINS = [
  "https://sconniegrades.com",
  "https://www.sconniegrades.com",
  "https://badgerbase.app",
  "https://www.badgerbase.app",
  "http://localhost:3000",
  "http://localhost:3001",
]

async function usePgApi(): Promise<boolean> {
  if (process.env.FORCE_PG === "true") return true

  try {
    const posthog = PostHogClient()
    const enabled = await posthog.isFeatureEnabled("postgres-migration", "server")
    await posthog.shutdown()
    return enabled === true
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const origin = request.headers.get("origin") || request.headers.get("referer")

  const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin?.startsWith(allowed))

  if (!isAllowed) {
    return new Response("Forbidden: Invalid origin", { status: 403 })
  }

  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3002"
  const API_KEY = process.env.API_KEY || ""

  const pg = await usePgApi()
  const basePath = pg ? "/v2/api/query" : "/api/query"

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${basePath}?${searchParams.toString()}`, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      return Response.json(
        { error: `API responded with status: ${response.status}`, details: errorBody },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error: any) {
    console.error("Proxy error:", error.message || error)
    return Response.json(
      { error: error.message || "Failed to fetch data from API" },
      { status: 502 }
    )
  }
}
