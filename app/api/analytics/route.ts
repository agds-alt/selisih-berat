import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/middleware/auth'
import { supabaseAdmin } from '@/lib/supabase/server'

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

    // 1. ENTRIES OVER TIME (Line Chart)
    const { data: entriesData } = await supabaseAdmin
      .from('entries')
      .select('created_at')
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

    // 4. SUMMARY STATS
    const { data: summaryData } = await supabaseAdmin
      .from('stats_summary')
      .select('*')
      .single()

    return NextResponse.json({
      success: true,
      data: {
        entriesOverTime,
        topPerformers: topPerformersFormatted,
        statusDistribution,
        summary: {
          totalEntries: summaryData?.total_entries || 0,
          totalUsers: summaryData?.total_users || 0,
          avgWeight: summaryData?.avg_weight || 0,
          totalDifference: summaryData?.total_difference || 0
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
