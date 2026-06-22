const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000
const REQUEST_TIMEOUT = 15000

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeout = attempt === 0 ? REQUEST_TIMEOUT * 2 : REQUEST_TIMEOUT
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Connection': 'keep-alive',
        },
      })

      clearTimeout(timeoutId)

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      if (response.status >= 500 && attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      lastError = error

      if (attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond. Please try again.')
      }

      if (
        error.message?.includes('connection') ||
        error.message?.includes('network') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('fetch failed')
      ) {
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.')
      }

      throw error
    }
  }

  throw lastError || new Error('Request failed after multiple attempts')
}
