import { NextResponse, type NextRequest } from 'next/server'

/**
 * better-auth manages its own session cookie; there is no server-side refresh
 * step to perform here. The app stays anonymous-by-default — this middleware
 * deliberately does not gate any route.
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
