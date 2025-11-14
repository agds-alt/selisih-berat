'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type LeaderboardType = 'daily' | 'alltime'

interface LeaderboardEntry {
  rank: number
  username: string
  entries: number
  earnings: number
  level: 'Beginner' | 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUser: LeaderboardEntry
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<LeaderboardType>('alltime')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (user) {
      const userData = JSON.parse(user)
      setCurrentUsername(userData.username)
    }

    fetchLeaderboard('alltime')
  }, [router])

  const fetchLeaderboard = async (type: LeaderboardType) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/leaderboard?type=${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch leaderboard:', result.message)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (type: LeaderboardType) => {
    setActiveTab(type)
    fetchLeaderboard(type)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-gray-100 text-gray-700'
      case 'Bronze':
        return 'bg-orange-100 text-orange-700'
      case 'Silver':
        return 'bg-gray-200 text-gray-700'
      case 'Gold':
        return 'bg-yellow-100 text-yellow-700'
      case 'Diamond':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <span className="text-3xl">🥇</span>
    } else if (rank === 2) {
      return <span className="text-3xl">🥈</span>
    } else if (rank === 3) {
      return <span className="text-3xl">🥉</span>
    } else {
      return <span className="text-xl font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBackground = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
    } else {
      return 'bg-white border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🏆 Leaderboard</h1>

          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-6">
            <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Leaderboard Skeleton */}
          <Card>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🏆 Leaderboard</h1>
          <Card>
            <div className="text-center py-12">
              <p className="text-6xl mb-4">😔</p>
              <p className="text-xl font-semibold text-gray-700">No Data Available</p>
              <p className="text-gray-500 mt-2">Belum ada data leaderboard</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏆 Leaderboard</h1>
          <div className="text-sm text-gray-500">
            Your rank: <span className="font-bold text-primary-600">#{data.currentUser.rank}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => handleTabChange('daily')}
            className={`flex-1 ${
              activeTab === 'daily'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            🌟 Daily Top
          </Button>
          <Button
            onClick={() => handleTabChange('alltime')}
            className={`flex-1 ${
              activeTab === 'alltime'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            👑 All Time
          </Button>
        </div>

        {/* Leaderboard */}
        <Card>
          <div className="p-6">
            {data.leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">📊</p>
                <p className="text-xl font-semibold text-gray-700">No Entries Yet</p>
                <p className="text-gray-500 mt-2">
                  {activeTab === 'daily' ? 'Belum ada entries hari ini' : 'Belum ada entries'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${getRankBackground(
                      entry.rank
                    )} ${
                      entry.username === currentUsername ? 'ring-2 ring-primary-400 shadow-lg' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards',
                    }}
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-16 text-center">
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {getInitials(entry.username)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{entry.username}</h3>
                        {entry.username === currentUsername && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(
                            entry.level
                          )}`}
                        >
                          {entry.level}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{entry.entries} entries</div>
                      <div className="text-sm text-green-600 font-semibold">
                        {formatCurrency(entry.earnings)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current User (if not in top 10) */}
                {data.currentUser.rank > 10 && (
                  <>
                    <div className="text-center py-2">
                      <span className="text-gray-400">...</span>
                    </div>
                    <div
                      className="flex items-center gap-4 p-4 rounded-lg border-2 bg-white border-primary-400 ring-2 ring-primary-200 shadow-lg"
                    >
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <span className="text-xl font-bold text-gray-500">
                          #{data.currentUser.rank}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {getInitials(data.currentUser.username)}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{data.currentUser.username}</h3>
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            YOU
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getLevelColor(
                              data.currentUser.level
                            )}`}
                          >
                            {data.currentUser.level}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {data.currentUser.entries} entries
                        </div>
                        <div className="text-sm text-green-600 font-semibold">
                          {formatCurrency(data.currentUser.earnings)}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-3">📊 Leaderboard Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • <strong>Daily Top:</strong> Peringkat berdasarkan entries hari ini
              </p>
              <p>
                • <strong>All Time:</strong> Peringkat berdasarkan total entries
              </p>
              <p>
                • <strong>Earnings:</strong> Pendapatan dihitung berdasarkan akurasi dan level
              </p>
              <p>
                • <strong>Levels:</strong> Beginner (0-99) → Bronze (100-499) → Silver (500-999) →
                Gold (1000-4999) → Diamond (5000+)
              </p>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
