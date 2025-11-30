'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntriesTable } from '@/components/tables/entries-table'
import type { Entry } from '@/lib/types/entry'

export default function MyEntriesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    }

    fetchMyEntries()
  }, [router])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [entries, searchQuery, statusFilter, dateFrom, dateTo])

  const fetchMyEntries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const userData = localStorage.getItem('user')

      if (!userData) return

      const user = JSON.parse(userData)

      // Fetch only current user's entries
      const params = new URLSearchParams()
      params.append('limit', '10000')
      params.append('created_by', user.username)

      const response = await fetch(`/api/entries?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        setEntries(data.data || [])
      } else {
        console.error('Failed to fetch entries:', data.message)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...entries]

    // Search filter (nama or no_resi)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.nama.toLowerCase().includes(query) ||
          entry.no_resi.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((entry) => entry.status === statusFilter)
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((entry) => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate >= fromDate
      })
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((entry) => {
        if (!entry.created_at) return false
        const entryDate = new Date(entry.created_at)
        return entryDate <= toDate
      })
    }

    setFilteredEntries(filtered)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Entries</h1>
          <p className="text-gray-600">View and search your entry data</p>
        </div>

        {/* Stats Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total My Entries</p>
                <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
              </div>
              <div className="bg-primary-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900">{filteredEntries.length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="space-y-6">
            {/* Filter Controls */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Search by Nama or No Resi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Date From */}
                <Input
                  type="date"
                  placeholder="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full"
                />

                {/* Date To */}
                <Input
                  type="date"
                  placeholder="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
                <div className="text-sm text-gray-600 flex items-center ml-2">
                  Showing {filteredEntries.length} of {entries.length} entries
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Read-Only View</h3>
                  <p className="text-sm text-blue-800">
                    You can view and search your entries. Click any row to see full details.
                    Contact admin if you need to modify or delete entries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Entries Table - Read Only (no delete, no selection) */}
        <Card>
          <EntriesTable
            entries={filteredEntries}
            loading={loading}
            isAdmin={false}
          />
        </Card>
      </div>
    </div>
  )
}
