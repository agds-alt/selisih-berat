import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/utils/jwt'
import type { JWTPayload } from '@/lib/types/auth'

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    return decoded
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function withAuth(
  handler: (request: NextRequest, context: { params: any; user: JWTPayload }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    return handler(request, { ...context, user })
  }
}

export function withAdmin(
  handler: (request: NextRequest, context: { params: any; user: JWTPayload }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    return handler(request, { ...context, user })
  }
}
