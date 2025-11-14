'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AnalyticsData {
  entriesOverTime: { date: string; count: number }[]
  topPerformers: { username: string; entries: number; earnings: number }[]
  statusDistribution: { approved: number; pending: number; rejected: number }
  summary: {
    totalEntries: number
    totalUsers: number
    avgWeight: number
    totalDifference: number
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()
      if (result.success) {
        setAnalyticsData(result.data)
      } else {
        showToast('Gagal memuat analytics', 'error')
      }
    } catch (error) {
      console.error('Fetch analytics error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Chart configurations
  const entriesOverTimeData = {
    labels: analyticsData.entriesOverTime.map((d) => d.date),
    datasets: [
      {
        label: 'Entries per Day',
        data: analyticsData.entriesOverTime.map((d) => d.count),
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  }

  const topPerformersData = {
    labels: analyticsData.topPerformers.map((p) => p.username),
    datasets: [
      {
        label: 'Total Entries',
        data: analyticsData.topPerformers.map((p) => p.entries),
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }

  const statusDistributionData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          analyticsData.statusDistribution.approved,
          analyticsData.statusDistribution.pending,
          analyticsData.statusDistribution.rejected
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
        labels: { font: { size: 10 } }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } }
      },
      x: {
        ticks: { font: { size: 10 } }
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 10 }, padding: 10 }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-3 py-3 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">📈 Analytics</h1>
            <p className="text-xs text-gray-600">Data visualization & insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <Card className="p-3">
            <p className="text-[10px] text-gray-600 mb-1">Total Entries</p>
            <p className="text-xl font-bold text-gray-900">
              {analyticsData.summary.totalEntries.toLocaleString()}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-[10px] text-gray-600 mb-1">Active Users</p>
            <p className="text-xl font-bold text-gray-900">
              {analyticsData.summary.totalUsers}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-[10px] text-gray-600 mb-1">Avg Weight (kg)</p>
            <p className="text-xl font-bold text-gray-900">
              {Math.round(analyticsData.summary.avgWeight).toLocaleString()}
            </p>
          </Card>
          <Card className="p-3">
            <p className="text-[10px] text-gray-600 mb-1">Total Diff (kg)</p>
            <p className="text-xl font-bold text-gray-900">
              {Math.round(analyticsData.summary.totalDifference).toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          {/* Entries Over Time - Line Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📊 Entries Over Time
            </h3>
            <div className="h-64">
              <Line data={entriesOverTimeData} options={chartOptions} />
            </div>
          </Card>

          {/* Top Performers - Bar Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              🏆 Top 5 Performers
            </h3>
            <div className="h-64">
              <Bar data={topPerformersData} options={chartOptions} />
            </div>
          </Card>

          {/* Status Distribution - Pie Chart */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📋 Status Distribution
            </h3>
            <div className="max-w-xs mx-auto">
              <Pie data={statusDistributionData} options={pieChartOptions} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
