'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateShort, formatTime } from '@/lib/utils/helpers'
import type { Entry } from '@/lib/types/entry'

interface EntriesTableProps {
  entries: Entry[]
  loading?: boolean
  onDelete?: (id: number) => void
  isAdmin?: boolean
}

type SortField = 'id' | 'no_resi' | 'nama' | 'berat_aktual' | 'selisih' | 'status' | 'created_at'
type SortDirection = 'asc' | 'desc'

export function EntriesTable({
  entries,
  loading = false,
  onDelete,
  isAdmin = false
}: EntriesTableProps) {
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Sort entries
  const sortedEntries = [...entries].sort((a, b) => {
    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    // Handle null values
    if (aVal === null) aVal = ''
    if (bVal === null) bVal = ''

    // Convert to comparable values
    if (sortField === 'created_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedEntries = sortedEntries.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  const getSelisihColor = (selisih: number) => {
    const abs = Math.abs(selisih)
    if (abs < 0.5) return 'text-green-600'
    if (abs < 1) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSelisihBgColor = (selisih: number) => {
    const abs = Math.abs(selisih)
    if (abs < 0.5) return 'bg-green-50'
    if (abs < 1) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada data</h3>
        <p className="mt-1 text-sm text-gray-500">Tidak ada entri yang sesuai dengan filter.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('no_resi')}
              >
                <div className="flex items-center">
                  No Resi
                  <SortIcon field="no_resi" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('nama')}
              >
                <div className="flex items-center">
                  Nama
                  <SortIcon field="nama" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('berat_aktual')}
              >
                <div className="flex items-center justify-end">
                  Berat Aktual
                  <SortIcon field="berat_aktual" />
                </div>
              </th>
              <th
                className="text-right py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('selisih')}
              >
                <div className="flex items-center justify-end">
                  Selisih
                  <SortIcon field="selisih" />
                </div>
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center justify-center">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Created
                  <SortIcon field="created_at" />
                </div>
              </th>
              {isAdmin && (
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.map((entry) => (
              <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-semibold text-gray-900">{entry.id}</td>
                <td className="py-3 px-4 font-mono text-sm text-gray-700">{entry.no_resi}</td>
                <td className="py-3 px-4 text-gray-900">{entry.nama}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {entry.berat_aktual} kg
                </td>
                <td className={`py-3 px-4 text-right ${getSelisihBgColor(entry.selisih)}`}>
                  <span className={`font-bold ${getSelisihColor(entry.selisih)}`}>
                    {entry.selisih >= 0 ? '+' : ''}{entry.selisih} kg
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    variant={
                      entry.status === 'approved' ? 'approved' :
                      entry.status === 'rejected' ? 'rejected' :
                      'pending'
                    }
                    size="sm"
                  >
                    {entry.status || 'pending'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.created_at ? formatDateShort(entry.created_at) : '-'}</span>
                    <span className="text-xs text-gray-500">
                      {entry.created_at ? formatTime(entry.created_at) : ''} {entry.created_by ? `by ${entry.created_by}` : ''}
                    </span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="py-3 px-4 text-center">
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus entry ini?')) {
                            onDelete(entry.id)
                          }
                        }}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>

        {/* Page info */}
        <div className="text-sm text-gray-700">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(endIndex, sortedEntries.length)}</span> of{' '}
          <span className="font-semibold">{sortedEntries.length}</span> entries
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          <span className="text-sm text-gray-700 px-2">
            Page <span className="font-semibold">{currentPage}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
