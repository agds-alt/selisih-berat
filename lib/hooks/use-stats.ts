import { useQuery } from '@tanstack/react-query'

// Query keys
export const statsKeys = {
  all: ['stats'] as const,
  summary: () => [...statsKeys.all, 'summary'] as const,
  user: (userId: string) => [...statsKeys.all, 'user', userId] as const,
  leaderboard: (period?: string) => [...statsKeys.all, 'leaderboard', period] as const,
}

interface StatsResponse {
  success: boolean
  data: any
  message?: string
}

/**
 * Fetch summary statistics
 */
export function useSummaryStats() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useQuery({
    queryKey: statsKeys.summary(),
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/stats/summary', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch summary stats')
      }

      const data: StatsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch summary stats')
      }

      return data.data
    },
    enabled: !!token,
    // Cache for 5 minutes since stats don't change frequently
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch user-specific statistics
 */
export function useUserStats(userId?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useQuery({
    queryKey: statsKeys.user(userId || ''),
    queryFn: async () => {
      if (!token || !userId) {
        throw new Error('No authentication token or user ID')
      }

      const response = await fetch(`/api/stats/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user stats')
      }

      const data: StatsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user stats')
      }

      return data.data
    },
    enabled: !!token && !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch leaderboard data
 */
export function useLeaderboard(period?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useQuery({
    queryKey: statsKeys.leaderboard(period),
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const params = new URLSearchParams()
      if (period) {
        params.append('period', period)
      }

      const response = await fetch(`/api/leaderboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const data: StatsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch leaderboard')
      }

      return data.data
    },
    enabled: !!token,
    // Cache for 2 minutes for leaderboard
    staleTime: 2 * 60 * 1000,
  })
}
