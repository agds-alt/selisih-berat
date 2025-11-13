'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

export default function LeaderboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🏆 Leaderboard</h1>

        <Card>
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🏆</p>
            <p className="text-xl font-semibold text-gray-700">Leaderboard Coming Soon</p>
            <p className="text-gray-500 mt-2">Fitur leaderboard akan segera hadir!</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
