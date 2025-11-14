import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auditService } from '@/lib/services/audit.service'

interface BulkUpdateRequest {
  ids: number[]
  status: 'approved' | 'rejected' | 'pending'
}

export const POST = withAdmin(async (request, { user }) => {
  try {
    const body: BulkUpdateRequest = await request.json()
    const { ids, status } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'IDs array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be approved, rejected, or pending' },
        { status: 400 }
      )
    }

    // Update all entries with the new status
    const { data, error } = await supabaseAdmin
      .from('entries')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id, no_resi, created_by')

    if (error) {
      console.error('Bulk update error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update entries' },
        { status: 500 }
      )
    }

    // Log to audit
    await auditService.log({
      userId: user.username,
      action: 'entry.bulk_update',
      resource: `bulk_${ids.length}_entries`,
      details: {
        entry_ids: ids,
        new_status: status,
        count: ids.length,
        affected_entries: data?.map(e => ({ id: e.id, no_resi: e.no_resi, user: e.created_by }))
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${ids.length} entries to ${status}`,
      data: {
        updated_count: data?.length || 0,
        status
      }
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})
