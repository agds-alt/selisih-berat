import { NextRequest, NextResponse } from 'next/server'
import { userRepository } from '@/lib/repositories/user.repository'
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

    let leaderboardData
    let currentUserStats

    if (type === 'daily') {
      // Get daily leaderboard
      leaderboardData = await userRepository.getDailyLeaderboard(10)

      // Get current user's rank
      const userRank = await userRepository.getUserRank(currentUsername, 'daily')

      // Find current user in the data
      const currentUserData = leaderboardData.find(u => u.username === currentUsername)

      if (currentUserData) {
        currentUserStats = {
          rank: userRank,
          username: currentUsername,
          entries: currentUserData.daily_entries,
          earnings: currentUserData.daily_earnings,
          level: getUserLevel(currentUserData.total_entries || 0).name,
        }
      } else {
        // User not in top 10, fetch their stats separately
        const { data: userStat } = await require('@/lib/supabase/server').supabaseAdmin
          .from('user_statistics')
          .select('daily_entries, daily_earnings, total_entries')
          .eq('username', currentUsername)
          .single()

        currentUserStats = {
          rank: userRank,
          username: currentUsername,
          entries: userStat?.daily_entries || 0,
          earnings: userStat?.daily_earnings || 0,
          level: getUserLevel(userStat?.total_entries || 0).name,
        }
      }

      // Format leaderboard
      const leaderboard = leaderboardData.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        entries: user.daily_entries,
        earnings: user.daily_earnings,
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
      // Get all-time leaderboard
      leaderboardData = await userRepository.getAllTimeLeaderboard(10)

      // Get current user's rank
      const userRank = await userRepository.getUserRank(currentUsername, 'alltime')

      // Find current user in the data
      const currentUserData = leaderboardData.find(u => u.username === currentUsername)

      if (currentUserData) {
        currentUserStats = {
          rank: userRank,
          username: currentUsername,
          entries: currentUserData.total_entries,
          earnings: currentUserData.total_earnings,
          level: getUserLevel(currentUserData.total_entries || 0).name,
        }
      } else {
        // User not in top 10, fetch their stats separately
        const { data: userStat } = await require('@/lib/supabase/server').supabaseAdmin
          .from('user_statistics')
          .select('total_entries, total_earnings')
          .eq('username', currentUsername)
          .single()

        currentUserStats = {
          rank: userRank,
          username: currentUsername,
          entries: userStat?.total_entries || 0,
          earnings: userStat?.total_earnings || 0,
          level: getUserLevel(userStat?.total_entries || 0).name,
        }
      }

      // Format leaderboard
      const leaderboard = leaderboardData.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        entries: user.total_entries,
        earnings: user.total_earnings,
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
