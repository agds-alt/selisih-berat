import { NextRequest, NextResponse } from 'next/server'
import { entryService } from '@/lib/services/entry.service'
import { updateEntrySchema } from '@/lib/schemas/entry.schema'
import { withAuth, withAdmin } from '@/lib/middleware/auth'

// GET - Get single entry
async function getHandler(
  request: NextRequest,
  { params, user }: any
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      )
    }

    const result = await entryService.getById(id, user.role, user.username)

    if (!result.success) {
      return NextResponse.json(result, { status: result.data ? 403 : 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Get entry API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}

// PUT - Update entry
async function putHandler(
  request: NextRequest,
  { params, user }: any
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request
    const validation = updateEntrySchema.safeParse(body)
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

    const result = await entryService.update(
      id,
      validation.data,
      user.role,
      user.username
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Update entry API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete entry (admin only)
async function deleteHandler(
  request: NextRequest,
  { params, user }: any
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID tidak valid',
        },
        { status: 400 }
      )
    }

    const result = await entryService.delete(id, user.role, user.username)

    if (!result.success) {
      return NextResponse.json(result, { status: 403 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Delete entry API error:', error)
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
export const PUT = withAuth(putHandler)
export const DELETE = withAdmin(deleteHandler)
