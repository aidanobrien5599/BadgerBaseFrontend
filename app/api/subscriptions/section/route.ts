export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { NextResponse } from 'next/server'

const SUBSCRIPTION_URL = process.env.SUBSCRIPTION_URL

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
    const response = await fetchWithRetry(`${SUBSCRIPTION_URL}/v2/section-subscription`, {
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
    const response = await fetchWithRetry(`${SUBSCRIPTION_URL}/v2/section-subscription`, {
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
