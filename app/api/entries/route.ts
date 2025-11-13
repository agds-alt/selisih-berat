import { NextRequest, NextResponse } from 'next/server'
import { entryService } from '@/lib/services/entry.service'
import { createEntrySchema } from '@/lib/schemas/entry.schema'
import { withAuth } from '@/lib/middleware/auth'

// GET - List entries with filters
async function getHandler(request: NextRequest, { user }: any) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await entryService.getAll(
      { search, status },
      user.role,
      user.username,
      page,
      limit
    )

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Get entries API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}

// POST - Create entry
async function postHandler(request: NextRequest, { user }: any) {
  try {
    const body = await request.json()

    // Validate request
    const validation = createEntrySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasi gagal',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const result = await entryService.create(validation.data, user.username)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Create entry API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
