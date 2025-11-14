'use client'

import { useEffect, useState } from 'react'
import { formatRupiah, formatNumber, getEarningsColor } from '@/lib/utils/earnings'

interface EarningsCardProps {
  username: string
  showBreakdown?: boolean
  className?: string
}

interface EarningsData {
  total_entries: number
  days_with_entries: number
  rate_per_entry: number
  daily_bonus: number
  entries_earnings: number
  bonus_earnings: number
  total_earnings: number
}

export function EarningsCard({ username, showBreakdown = false, className = '' }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEarnings()
  }, [username])

  const fetchEarnings = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/earnings/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to fetch earnings')
        setLoading(false)
        return
      }

      setEarnings(data.data)
    } catch (err: any) {
      console.error('Error fetching earnings:', err)
      setError(err.message || 'Failed to fetch earnings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-gray-500 text-sm">No earnings data available</div>
      </div>
    )
  }

  const earningsColor = getEarningsColor(earnings.total_earnings)

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border-2 border-green-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💰</span>
          <h3 className="text-lg font-semibold text-gray-800">Total Earnings</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* Total Earnings */}
        <div>
          <div className={`text-3xl font-bold ${earningsColor}`}>
            {formatRupiah(earnings.total_earnings)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            From {formatNumber(earnings.total_entries)} entries in {earnings.days_with_entries} days
          </p>
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="mt-4 pt-4 border-t border-green-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Entries ({formatNumber(earnings.total_entries)} × {formatRupiah(earnings.rate_per_entry)})</span>
              <span className="font-semibold text-gray-800">{formatRupiah(earnings.entries_earnings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Bonus ({earnings.days_with_entries} × {formatRupiah(earnings.daily_bonus)})</span>
              <span className="font-semibold text-gray-800">{formatRupiah(earnings.bonus_earnings)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-green-300">
              <span className="text-gray-800">Total</span>
              <span className={earningsColor}>{formatRupiah(earnings.total_earnings)}</span>
            </div>
          </div>
        )}

        {/* Daily Average */}
        {earnings.days_with_entries > 0 && (
          <div className="mt-3 p-3 bg-white rounded-lg">
            <div className="text-xs text-gray-600">Daily Average</div>
            <div className="text-lg font-bold text-gray-800">
              {formatRupiah(Math.round(earnings.total_earnings / earnings.days_with_entries))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
