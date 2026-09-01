export const runtime = 'nodejs'

import { getServerSession } from '@/lib/server-session'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { apiUrl } from '@/lib/api-url'
import { NextResponse } from 'next/server'


export async function GET(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(request)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to view subscriptions' },
        { status: 401 }
      )
    }

    // Get the access token and user email from the session
    const accessToken = session.token
    const userEmail = session.email

    // REMOVED: Excessive logging that was causing Railway rate limits
    // Only log errors in development, not sensitive data like access tokens and emails

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 401 }
      )
    }

    // Forward the request to the Railway backend with retry logic
    const response = await fetchWithRetry(`${apiUrl()}/v2/subscriptions?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': process.env.SUBSCRIPTION_API_KEY || '',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    // Only log errors in development, and don't log sensitive data
    if (process.env.NODE_ENV === 'development') {
      console.error('Fetch subscriptions error:', error.message || error)
    }
    
    // Return user-friendly error messages
    const errorMessage = error.message || 'Failed to fetch subscriptions'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

