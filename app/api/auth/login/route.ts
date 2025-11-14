import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { loginSchema } from '@/lib/schemas/auth.schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Login request received')

    // Validate request
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors)
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
    console.log('✅ Validation passed for username:', username)

    // Login
    const result = await authService.login(username, password)

    if (!result.success) {
      console.log('❌ Login failed:', result.message)
      return NextResponse.json(result, { status: 401 })
    }

    console.log('✅ Login successful for username:', username)
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('💥 Login API error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
