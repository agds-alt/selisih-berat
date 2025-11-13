import { NextRequest, NextResponse } from 'next/server'
import { entryService } from '@/lib/services/entry.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username wajib diisi',
        },
        { status: 400 }
      )
    }

    const result = await entryService.getUserStats(username)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Get user stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
