import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { loginSchema } from '@/lib/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = loginSchema.safeParse(body)
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

    const { username, password } = validation.data

    // Login
    const result = await authService.login(username, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}
