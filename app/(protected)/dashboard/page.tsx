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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Dashboard</h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Entries"
              value={stats.totalEntries}
              subtitle="All time entries"
              icon="📦"
              variant="primary"
            />

            <StatsCard
              title="Total Photos"
              value={stats.totalPhotos}
              subtitle="Documented photos"
              icon="📸"
              variant="success"
            />

            <StatsCard
              title="Today's Entries"
              value={stats.todayEntries}
              subtitle="Entries today"
              icon="🔥"
              variant="warning"
            />

            <StatsCard
              title="Avg Selisih"
              value={`${stats.avgSelisih} kg`}
              subtitle="Average difference"
              icon="⚖️"
              variant="danger"
            />
          </div>
        )}

        {/* Earnings Card */}
        {username && (
          <div className="mb-8">
            <EarningsCard username={username} showBreakdown={true} />
          </div>
        )}

        {/* Recent Entries */}
        <Card
          header={<h2 className="text-xl font-bold">Recent Entries</h2>}
        >
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada entry</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">No Resi</th>
                    <th className="text-left py-2 px-4">Nama</th>
                    <th className="text-right py-2 px-4">Berat Resi</th>
                    <th className="text-right py-2 px-4">Berat Aktual</th>
                    <th className="text-right py-2 px-4">Selisih</th>
                    <th className="text-center py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{entry.no_resi}</td>
                      <td className="py-3 px-4">{entry.nama}</td>
                      <td className="py-3 px-4 text-right">{entry.berat_resi} kg</td>
                      <td className="py-3 px-4 text-right">{entry.berat_aktual} kg</td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={
                          Math.abs(entry.selisih) < 0.5 ? 'text-green-600' :
                          Math.abs(entry.selisih) < 1 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {entry.selisih >= 0 ? '+' : ''}{entry.selisih} kg
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={entry.status as any}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {entry.created_at ? formatDate(entry.created_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
