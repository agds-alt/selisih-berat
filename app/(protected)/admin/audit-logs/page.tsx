'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface AuditLog {
  id: number
  user_id: string
  action: string
  resource: string | null
  details: any
  timestamp: string
}

export default function AuditLogsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchLogs()
  }, [page])

  useEffect(() => {
    // Reset to page 1 when filters change
    if (page === 1) {
      fetchLogs()
    } else {
      setPage(1)
    }
  }, [filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      const params = new URLSearchParams({
        limit: '50',
        offset: ((page - 1) * 50).toString()
      })

      if (filters.userId) params.append('userId', filters.userId)
      if (filters.action) params.append('action', filters.action)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const result = await response.json()
      if (result.success) {
        setLogs(result.data.logs)
        setTotal(result.data.total)
      } else {
        showToast('Gagal memuat audit logs', 'error')
      }
    } catch (error) {
      console.error('Fetch logs error:', error)
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    if (action.startsWith('settings')) return 'bg-purple-100 text-purple-700'
    if (action.startsWith('entry')) return 'bg-blue-100 text-blue-700'
    if (action.startsWith('user')) return 'bg-orange-100 text-orange-700'
    if (action.startsWith('login')) return 'bg-green-100 text-green-700'
    if (action.startsWith('profile')) return 'bg-pink-100 text-pink-700'
    return 'bg-gray-100 text-gray-700'
  }

  const totalPages = Math.ceil(total / 50)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-3 py-3 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">📝 Audit Logs</h1>
          <p className="text-xs text-gray-600">
            Riwayat aktivitas sistem • Total: {total.toLocaleString()} logs
          </p>
        </div>

        {/* Filters */}
        <Card className="p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="settings.update">Settings Update</option>
              <option value="entry.create">Entry Create</option>
              <option value="entry.update">Entry Update</option>
              <option value="entry.delete">Entry Delete</option>
              <option value="entry.bulk_update">Entry Bulk Update</option>
              <option value="entry.bulk_delete">Entry Bulk Delete</option>
              <option value="user.change_password">Change Password</option>
              <option value="profile.update">Profile Update</option>
              <option value="login.success">Login Success</option>
              <option value="login.failed">Login Failed</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFilters({ userId: '', action: '', startDate: '', endDate: '' })
              }}
            >
              🔄 Reset
            </Button>
          </div>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm font-medium text-gray-900">Tidak ada audit logs</p>
            <p className="text-xs text-gray-600 mt-1">Belum ada aktivitas yang tercatat</p>
          </Card>
        )}

        {/* Logs List */}
        {!loading && logs.length > 0 && (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-gray-600">
                        by <span className="font-medium">{log.user_id}</span>
                      </span>
                    </div>
                    {log.resource && (
                      <p className="text-xs text-gray-700 mb-1">
                        Resource: <span className="font-medium">{log.resource}</span>
                      </p>
                    )}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="text-[10px] text-gray-600 mt-1">
                        <summary className="cursor-pointer hover:text-gray-900 font-medium">
                          View details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40 text-[10px]">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </Button>
            <span className="px-3 py-2 text-xs text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
