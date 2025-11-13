import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { signupSchema } from '@/lib/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = signupSchema.safeParse(body)
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

    const result = await authService.signup(validation.data)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
