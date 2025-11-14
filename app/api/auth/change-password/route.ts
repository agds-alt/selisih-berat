import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { changePasswordSchema } from '@/lib/schemas/auth.schema'
import { withAuth } from '@/lib/middleware/auth'
import { auditService } from '@/lib/services/audit.service'

async function handler(request: NextRequest, { user }: any) {
  try {
    const body = await request.json()

    // Validate request
    const validation = changePasswordSchema.safeParse(body)
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

    const { old_password, new_password } = validation.data

    const result = await authService.changePassword(user.id, old_password, new_password)

    if (!result.success) {
      // Audit failed attempt
      await auditService.log({
        userId: user.username,
        action: 'user.change_password',
        resource: 'password_change',
        details: { success: false, reason: result.message }
      })

      return NextResponse.json(result, { status: 400 })
    }

    // Audit successful change
    await auditService.log({
      userId: user.username,
      action: 'user.change_password',
      resource: 'password_change',
      details: { success: true }
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Change password API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
      },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handler)
