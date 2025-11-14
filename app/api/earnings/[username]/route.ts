import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/utils/jwt'
import { settingsService } from '@/lib/services/settings.service'

/**
 * GET /api/earnings/[username] - Get user earnings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let currentUsername: string
    let userRole: string

    try {
      const payload = verifyAccessToken(token)
      currentUsername = payload.username
      userRole = payload.role
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { username } = params

    // Users can only view their own earnings unless they're admin
    if (currentUsername !== username && userRole !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You can only view your own earnings' },
        { status: 403 }
      )
    }

    // Get user earnings
    const result = await settingsService.getUserEarnings(username)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error: any) {
    console.error('Earnings API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
