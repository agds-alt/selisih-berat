import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/auth'
import { auditService } from '@/lib/services/audit.service'

/**
 * GET /api/admin/audit-logs
 * Get audit logs with filters (Admin only)
 */
export const GET = withAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const { logs, total } = await auditService.getLogs(filters)

    return NextResponse.json({
      success: true,
      data: {
        logs,
        total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        pageSize: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      }
    })
  } catch (error: any) {
    console.error('Get audit logs error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch audit logs', error: error.message },
      { status: 500 }
    )
  }
})
