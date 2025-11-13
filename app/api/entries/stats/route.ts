import { NextRequest, NextResponse } from 'next/server'
import { entryService } from '@/lib/services/entry.service'

export async function GET(request: NextRequest) {
  try {
    const result = await entryService.getStats()

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Get stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
