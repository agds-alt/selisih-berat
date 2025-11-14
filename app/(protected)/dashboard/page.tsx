'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StatsCard } from '@/components/charts/stats-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EarningsCard } from '@/components/earnings/earnings-card'
import { formatDate, formatNumber } from '@/lib/utils/helpers'
import type { EntryStats } from '@/lib/types/entry'
import type { Entry } from '@/lib/types/entry'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<EntryStats | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string>('')

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    // Get username
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUsername(user.username)
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')

      // Fetch stats
      const statsRes = await fetch('/api/entries/stats')
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.data)
      }

      // Fetch entries
      const entriesRes = await fetch('/api/entries?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const entriesData = await entriesRes.json()
      if (entriesData.success) {
        setEntries(entriesData.data || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-3 pb-16">
      <div className="container mx-auto px-3">
        <h1 className="text-lg font-bold text-gray-900 mb-3">📊 Dashboard</h1>

        {/* Stats Grid - 2x2 Mobile, 4x1 Desktop */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {/* Total Entries */}
            <div className="stats-card-mobile bg-primary-50 border border-primary-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stats-label text-primary-700">Total Entries</p>
                  <p className="stats-value text-primary-900">{formatNumber(stats.totalEntries)}</p>
                  <p className="stats-subtitle text-primary-600">All time</p>
                </div>
                <span className="text-2xl opacity-80">📦</span>
              </div>
            </div>

            {/* Total Photos */}
            <div className="stats-card-mobile bg-green-50 border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stats-label text-green-700">Total Photos</p>
                  <p className="stats-value text-green-900">{formatNumber(stats.totalPhotos)}</p>
                  <p className="stats-subtitle text-green-600">Documented</p>
                </div>
                <span className="text-2xl opacity-80">📸</span>
              </div>
            </div>

            {/* Today's Entries */}
            <div className="stats-card-mobile bg-yellow-50 border border-yellow-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stats-label text-yellow-700">Today</p>
                  <p className="stats-value text-yellow-900">{formatNumber(stats.todayEntries)}</p>
                  <p className="stats-subtitle text-yellow-600">Entries</p>
                </div>
                <span className="text-2xl opacity-80">🔥</span>
              </div>
            </div>

            {/* Avg Selisih */}
            <div className="stats-card-mobile bg-red-50 border border-red-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="stats-label text-red-700">Avg Selisih</p>
                  <p className="stats-value text-red-900">{stats.avgSelisih} kg</p>
                  <p className="stats-subtitle text-red-600">Average</p>
                </div>
                <span className="text-2xl opacity-80">⚖️</span>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Card - Compact Mobile */}
        {username && (
          <div className="mb-3">
            <EarningsCard username={username} showBreakdown={true} />
          </div>
        )}

        {/* Recent Entries - Compact Table */}
        <div className="card-mobile">
          <h2 className="text-base font-bold mb-3">Recent Entries</h2>

          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">Belum ada entry</p>
          ) : (
            <div className="overflow-x-auto -mx-3">
              <table className="table-mobile">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-2 text-[10px]">No Resi</th>
                    <th className="text-left py-2 px-2 text-[10px]">Nama</th>
                    <th className="text-right py-2 px-2 text-[10px]">Resi</th>
                    <th className="text-right py-2 px-2 text-[10px]">Aktual</th>
                    <th className="text-right py-2 px-2 text-[10px]">Selisih</th>
                    <th className="text-center py-2 px-2 text-[10px]">Status</th>
                    <th className="text-left py-2 px-2 text-[10px]">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50 active:bg-gray-100">
                      <td className="py-2 px-2 font-mono text-[10px]">{entry.no_resi}</td>
                      <td className="py-2 px-2 text-xs truncate max-w-[100px]">{entry.nama}</td>
                      <td className="py-2 px-2 text-right text-xs">{entry.berat_resi}</td>
                      <td className="py-2 px-2 text-right text-xs">{entry.berat_aktual}</td>
                      <td className="py-2 px-2 text-right text-xs font-bold">
                        <span className={
                          Math.abs(entry.selisih) < 0.5 ? 'text-green-600' :
                          Math.abs(entry.selisih) < 1 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {entry.selisih >= 0 ? '+' : ''}{entry.selisih}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`badge-mobile ${
                          entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[10px] text-gray-600">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short'
                        }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
