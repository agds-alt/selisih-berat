import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserLevel } from '@/lib/utils/constants'
import { verifyAccessToken } from '@/lib/utils/jwt'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let currentUsername: string

    try {
      const payload = verifyAccessToken(token)
      currentUsername = payload.username
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'alltime' // 'daily' or 'alltime'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (type === 'daily') {
      // Use database function for daily leaderboard (OPTIMIZED!)
      const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin.rpc(
        'get_daily_top_performers',
        { limit_count: limit }
      )

      if (leaderboardError) {
        console.error('Daily leaderboard error:', leaderboardError)
        throw leaderboardError
      }

      // Get current user stats
      const { data: userStat } = await supabaseAdmin
        .from('user_statistics')
        .select('daily_entries, daily_earnings, total_entries')
        .eq('username', currentUsername)
        .single()

      // Find user's rank in leaderboard
      const currentUserData = leaderboardData?.find((u: any) => u.username === currentUsername)
      const userRank = currentUserData?.rank || null

      const currentUserStats = {
        rank: userRank,
        username: currentUsername,
        entries: userStat?.daily_entries || 0,
        earnings: userStat?.daily_earnings || 0,
        level: getUserLevel(userStat?.total_entries || 0).name,
      }

      // Format leaderboard
      const leaderboard = (leaderboardData || []).map((user: any) => ({
        rank: user.rank,
        username: user.username,
        entries: user.daily_entries,
        earnings: user.daily_earnings,
        avgSelisih: user.avg_selisih,
        level: getUserLevel(user.total_entries || 0).name,
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          currentUser: currentUserStats,
        },
      })
    } else {
      // Use database function for all-time leaderboard (OPTIMIZED!)
      const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin.rpc(
        'get_total_top_performers',
        { limit_count: limit }
      )

      if (leaderboardError) {
        console.error('All-time leaderboard error:', leaderboardError)
        throw leaderboardError
      }

      // Get current user stats
      const { data: userStat } = await supabaseAdmin
        .from('user_statistics')
        .select('total_entries, total_earnings')
        .eq('username', currentUsername)
        .single()

      // Find user's rank in leaderboard
      const currentUserData = leaderboardData?.find((u: any) => u.username === currentUsername)
      const userRank = currentUserData?.rank || null

      const currentUserStats = {
        rank: userRank,
        username: currentUsername,
        entries: userStat?.total_entries || 0,
        earnings: userStat?.total_earnings || 0,
        level: getUserLevel(userStat?.total_entries || 0).name,
      }

      // Format leaderboard
      const leaderboard = (leaderboardData || []).map((user: any) => ({
        rank: user.rank,
        username: user.username,
        entries: user.total_entries,
        earnings: user.total_earnings,
        avgSelisih: user.avg_selisih,
        firstEntry: user.first_entry,
        lastEntry: user.last_entry,
        level: getUserLevel(user.total_entries || 0).name,
      }))

      return NextResponse.json({
        success: true,
        data: {
          leaderboard,
          currentUser: currentUserStats,
        },
      })
    }
  } catch (error: any) {
    console.error('Leaderboard API error:', error)
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
