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
      <div className={`card-mobile ${className}`}>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`card-mobile ${className}`}>
        <div className="text-red-600 text-xs">{error}</div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className={`card-mobile ${className}`}>
        <div className="text-gray-500 text-xs">No earnings data available</div>
      </div>
    )
  }

  const earningsColor = getEarningsColor(earnings.total_earnings)

  return (
    <div className={`card-mobile bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-lg">💰</span>
          <h3 className="text-sm font-semibold text-gray-800">Total Earnings</h3>
        </div>
      </div>

      <div className="space-y-2">
        {/* Total Earnings */}
        <div>
          <div className={`text-2xl font-bold ${earningsColor}`}>
            {formatRupiah(earnings.total_earnings)}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {formatNumber(earnings.total_entries)} entries • {earnings.days_with_entries} days
          </p>
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="mt-2 pt-2 border-t border-green-200 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Entries ({formatNumber(earnings.total_entries)} × {formatRupiah(earnings.rate_per_entry)})</span>
              <span className="font-semibold text-gray-800">{formatRupiah(earnings.entries_earnings)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Daily Bonus ({earnings.days_with_entries} × {formatRupiah(earnings.daily_bonus)})</span>
              <span className="font-semibold text-gray-800">{formatRupiah(earnings.bonus_earnings)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-green-300">
              <span className="text-gray-800">Total</span>
              <span className={earningsColor}>{formatRupiah(earnings.total_earnings)}</span>
            </div>
          </div>
        )}

        {/* Daily Average */}
        {earnings.days_with_entries > 0 && (
          <div className="mt-2 p-2 bg-white rounded-lg">
            <div className="text-[10px] text-gray-600">Daily Average</div>
            <div className="text-base font-bold text-gray-800">
              {formatRupiah(Math.round(earnings.total_earnings / earnings.days_with_entries))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
