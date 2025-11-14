'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EntriesTable } from '@/components/tables/entries-table'
import { exportToExcel, exportToCSV, generateExportFilename } from '@/lib/utils/export'
import type { Entry } from '@/lib/types/entry'
import type { ExportEntry } from '@/lib/utils/export'

export default function DataManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    // Check auth and admin role
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Admin only check
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }

    fetchEntries()
  }, [router])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [entries, searchQuery, statusFilter, dateFrom, dateTo])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      // Build query params
      const params = new URLSearchParams()
      params.append('limit', '10000') // Get all entries for filtering

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

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setEntries(entries.filter((e) => e.id !== id))
        alert('Entry berhasil dihapus!')
      } else {
        alert(`Gagal menghapus entry: ${data.message}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Terjadi kesalahan saat menghapus entry')
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const exportData: ExportEntry[] = filteredEntries.map((entry) => ({
        id: entry.id,
        no_resi: entry.no_resi,
        nama: entry.nama,
        berat_resi: entry.berat_resi,
        berat_aktual: entry.berat_aktual,
        selisih: entry.selisih,
        status: entry.status || 'pending',
        foto_url_1: entry.foto_url_1 || undefined,
        foto_url_2: entry.foto_url_2 || undefined,
        catatan: entry.catatan || undefined,
        created_by: entry.created_by || 'Unknown',
        created_at: entry.created_at || new Date().toISOString(),
      }))

      await exportToExcel(exportData, generateExportFilename('entries', 'xlsx'))
      alert('Data berhasil diexport ke Excel!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data ke Excel')
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const exportData: ExportEntry[] = filteredEntries.map((entry) => ({
        id: entry.id,
        no_resi: entry.no_resi,
        nama: entry.nama,
        berat_resi: entry.berat_resi,
        berat_aktual: entry.berat_aktual,
        selisih: entry.selisih,
        status: entry.status || 'pending',
        foto_url_1: entry.foto_url_1 || undefined,
        foto_url_2: entry.foto_url_2 || undefined,
        catatan: entry.catatan || undefined,
        created_by: entry.created_by || 'Unknown',
        created_at: entry.created_at || new Date().toISOString(),
      }))

      await exportToCSV(exportData, generateExportFilename('entries', 'csv'))
      alert('Data berhasil diexport ke CSV!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data ke CSV')
    } finally {
      setExporting(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
          <p className="text-gray-600">Manage and export all entry data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Entries</p>
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
                <p className="text-sm font-semibold text-gray-600 mb-1">Filtered Entries</p>
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

        {/* Filters and Export */}
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

            {/* Export Buttons */}
            <div className="pt-4 border-t">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Export Data</h2>
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExportExcel}
                  disabled={exporting || filteredEntries.length === 0}
                  loading={exporting}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to Excel
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleExportCSV}
                  disabled={exporting || filteredEntries.length === 0}
                  loading={exporting}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export to CSV
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Entries Table */}
        <Card>
          <EntriesTable
            entries={filteredEntries}
            loading={loading}
            onDelete={handleDelete}
            isAdmin={true}
          />
        </Card>
      </div>
    </div>
  )
}
