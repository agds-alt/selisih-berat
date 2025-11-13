import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Refresh token wajib diisi',
        },
        { status: 400 }
      )
    }

    const result = await authService.refreshToken(refreshToken)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Refresh token API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
