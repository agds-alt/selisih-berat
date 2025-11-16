import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics
 * Get analytics data for charts (Admin only)
 */
export const GET = withAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 1. ENTRIES OVER TIME (Line Chart) + data for summary stats
    const { data: entriesData } = await supabaseAdmin
      .from('entries')
      .select('created_at, created_by, berat_aktual, selisih')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Group by date
    const groupedByDate = (entriesData || []).reduce((acc: any, entry) => {
      const date = new Date(entry.created_at!).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const entriesOverTime = Object.entries(groupedByDate).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      count
    }))

    // 2. TOP PERFORMERS (Bar Chart)
    const { data: topPerformers } = await supabaseAdmin.rpc('get_total_top_performers', {
      limit_count: 5
    })

    const topPerformersFormatted = (topPerformers || []).map((p: any) => ({
      username: p.username,
      entries: p.total_entries,
      earnings: p.total_earnings
    }))

    // 3. STATUS DISTRIBUTION (Pie Chart)
    const { data: statusData } = await supabaseAdmin
      .from('entries')
      .select('status')

    const statusDistribution = {
      approved: (statusData || []).filter(e => e.status === 'approved').length,
      pending: (statusData || []).filter(e => e.status === 'pending' || !e.status).length,
      rejected: (statusData || []).filter(e => e.status === 'rejected').length
    }

    // 4. SUMMARY STATS - Calculate from entries data
    const totalEntries = (entriesData || []).length
    const uniqueUsers = new Set((entriesData || []).map(e => e.created_by).filter(Boolean))
    const totalUsers = uniqueUsers.size

    const weights = (entriesData || []).map(e => e.berat_aktual || 0).filter(w => w > 0)
    const avgWeight = weights.length > 0
      ? weights.reduce((sum, w) => sum + w, 0) / weights.length
      : 0

    const totalDifference = (entriesData || [])
      .map(e => e.selisih || 0)
      .reduce((sum, s) => sum + s, 0)

    return NextResponse.json({
      success: true,
      data: {
        entriesOverTime,
        topPerformers: topPerformersFormatted,
        statusDistribution,
        summary: {
          totalEntries,
          totalUsers,
          avgWeight,
          totalDifference
        }
      }
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics', error: error.message },
      { status: 500 }
    )
  }
})
