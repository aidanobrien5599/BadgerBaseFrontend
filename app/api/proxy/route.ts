export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)



  const clientSecret = request.headers.get("x-client-secret")

  if (clientSecret !== process.env.CLIENT_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  // You'll need to replace this with your actual API endpoint and API key
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000"
  const API_KEY = process.env.API_KEY || ""


  try {
    const response = await fetch(`${API_BASE_URL}/api/query?${searchParams.toString()}`, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return Response.json({ error: "Failed to fetch data from API" }, { status: 500 })
  }
}
