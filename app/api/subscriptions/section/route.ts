export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get your Railway backend URL from environment variables
const SUBSCRIPTION_URL = process.env.SUBSCRIPTION_URL 

// Retry configuration
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const REQUEST_TIMEOUT = 15000 // 15 seconds

// Helper function to retry fetch with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    try {
      // Make fetch request with abort signal
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Connection': 'keep-alive',
        },
      })
      
      // Clear timeout since request completed
      clearTimeout(timeoutId)
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }
      
      // For server errors (5xx), retry
      if (response.status >= 500 && attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(timeoutId)
      lastError = error
      
      // Handle timeout/abort errors
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        throw new Error('Request timeout: The server took too long to respond. Please try again.')
      }
      
      // Handle network errors
      if (error.message?.includes('connection') || 
          error.message?.includes('network') || 
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('fetch failed')) {
        if (attempt < retries) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.')
      }
      
      // For other errors, retry if we have attempts left
      if (attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // No more retries, throw the error
      throw error
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Request failed after multiple attempts')
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to subscribe to sections' },
        { status: 401 }
      )
    }

    // Get the access token and user email from the session
    const accessToken = session.access_token
    const userEmail = session.user.email

    // Get the request body
    const body = await request.json()
    const { section_id, section_names, course_title } = body

    if (!section_id) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 401 }
      )
    }

    if (!SUBSCRIPTION_URL) {
      // Only log errors, not on every request
      if (process.env.NODE_ENV === 'development') {
        console.error('SUBSCRIPTION_URL is not set in environment variables')
      }
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward the request to the Railway backend with retry logic
    const response = await fetchWithRetry(`${SUBSCRIPTION_URL}/section-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': process.env.SUBSCRIPTION_API_KEY || '',
      },
      body: JSON.stringify({ 
        section_id,
        email: userEmail,
        section_names,
        course_title,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    // Only log errors in development, and don't log sensitive data
    if (process.env.NODE_ENV === 'development') {
      console.error('Section subscription error:', error.message || error)
    }
    
    // Return user-friendly error messages
    const errorMessage = error.message || 'Failed to subscribe to section'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Get the authenticated user's session
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to unsubscribe from sections' },
        { status: 401 }
      )
    }

    // Get the access token and user email from the session
    const accessToken = session.access_token
    const userEmail = session.user.email

    // Get the request body
    const body = await request.json()
    const { section_id } = body

    if (!section_id) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 401 }
      )
    }

    if (!SUBSCRIPTION_URL) {
      if (process.env.NODE_ENV === 'development') {
        console.error('SUBSCRIPTION_URL is not set in environment variables')
      }
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward the DELETE request to the Railway backend with retry logic
    const response = await fetchWithRetry(`${SUBSCRIPTION_URL}/section-subscription`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': process.env.SUBSCRIPTION_API_KEY || '',
      },
      body: JSON.stringify({ 
        section_id,
        email: userEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Section unsubscribe error:', error.message || error)
    }
    
    const errorMessage = error.message || 'Failed to unsubscribe from section'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
