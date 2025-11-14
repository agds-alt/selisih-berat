import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { auditService } from '@/lib/services/audit.service'

interface BulkDeleteRequest {
  ids: number[]
}

export const POST = withAdmin(async (request, { user }) => {
  try {
    const body: BulkDeleteRequest = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'IDs array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Get entry details before deletion for audit log
    const { data: entriesToDelete } = await supabaseAdmin
      .from('entries')
      .select('id, no_resi, created_by, berat_resi, berat_aktual, selisih')
      .in('id', ids)

    // Delete all entries
    const { error } = await supabaseAdmin
      .from('entries')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Bulk delete error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to delete entries' },
        { status: 500 }
      )
    }

    // Log to audit
    await auditService.log({
      userId: user.username,
      action: 'entry.bulk_delete',
      resource: `bulk_${ids.length}_entries`,
      details: {
        entry_ids: ids,
        count: ids.length,
        deleted_entries: entriesToDelete?.map(e => ({
          id: e.id,
          no_resi: e.no_resi,
          user: e.created_by,
          weights: {
            berat_resi: e.berat_resi,
            berat_aktual: e.berat_aktual,
            selisih: e.selisih
          }
        }))
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} entries`,
      data: {
        deleted_count: entriesToDelete?.length || 0
      }
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
})
