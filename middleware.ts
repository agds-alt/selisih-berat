import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need auth
  const publicPaths = ['/', '/login', '/signup']
  const isPublicPath = publicPaths.some(path => pathname === path)

  // API routes and static files - skip
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/manifest')
  ) {
    return NextResponse.next()
  }

  // For protected routes, auth check happens on client side via useEffect
  // This middleware is mainly for server-side routing rules

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.svg).*)'],
}
