export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get your Railway backend URL from environment variables
const SUBSCRIPTION_URL = process.env.SUBSCRIPTION_URL 

console.log('SUBSCRIPTION_URL', SUBSCRIPTION_URL)


export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to subscribe to courses' },
        { status: 401 }
      )
    }

    // Get the access token and user email from the session
    const accessToken = session.access_token
    const userEmail = session.user.email

    console.log('accessToken', accessToken)
    console.log('userEmail', userEmail)

    // Get the request body
    const body = await request.json()
    const { course_id } = body

    if (!course_id) {
      return NextResponse.json(
        { error: 'course_id is required' },
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
      console.error('SUBSCRIPTION_URL is not set in environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward the request to the Railway backend with the auth token and email
    const response = await fetch(`${SUBSCRIPTION_URL}/course-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': process.env.SUBSCRIPTION_API_KEY || '',
      },
      body: JSON.stringify({ 
        course_id,
        email: userEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Course subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to course' },
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
        { error: 'Unauthorized: Please log in to unsubscribe from courses' },
        { status: 401 }
      )
    }

    // Get the access token and user email from the session
    const accessToken = session.access_token
    const userEmail = session.user.email

    // Get the request body
    const body = await request.json()
    const { course_id } = body

    if (!course_id) {
      return NextResponse.json(
        { error: 'course_id is required' },
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
      console.error('SUBSCRIPTION_URL is not set in environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward the DELETE request to the Railway backend
    const response = await fetch(`${SUBSCRIPTION_URL}/course-subscription`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': process.env.SUBSCRIPTION_API_KEY || '',
      },
      body: JSON.stringify({ 
        course_id,
        email: userEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Course unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from course' },
      { status: 500 }
    )
  }
}
