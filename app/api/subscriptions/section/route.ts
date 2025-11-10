import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get your Railway backend URL from environment variables
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
      console.error('RAILWAY_BACKEND_URL is not set in environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward the request to the Railway backend with the auth token and email
    const response = await fetch(`${SUBSCRIPTION_URL}/section-subscription`, {
      method: 'POST',
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
  } catch (error) {
    console.error('Section subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to section' },
      { status: 500 }
    )
  }
}

