'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface PhotoFilters {
  startDate: string
  endDate: string
  search: string
}

interface PhotoFiltersProps {
  onFilterChange: (filters: PhotoFilters) => void
  onReset: () => void
}

export function PhotoFiltersComponent({ onFilterChange, onReset }: PhotoFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Trigger filter change when debounced search changes
  useEffect(() => {
    if (debouncedSearch.length === 0 || debouncedSearch.length >= 3) {
      handleApply()
    }
  }, [debouncedSearch])

  const handleApply = () => {
    onFilterChange({
      startDate,
      endDate,
      search: debouncedSearch,
    })
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    setSearch('')
    setDebouncedSearch('')
    onReset()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">🔍 Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search (min 3 chars)
          </label>
          <Input
            type="text"
            placeholder="Nama, No Resi, Filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleApply}
          className="bg-primary-600 text-white hover:bg-primary-700"
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleReset}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Reset
        </Button>
      </div>

      {/* Active Filters Display */}
      {(startDate || endDate || debouncedSearch) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {startDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                From: {new Date(startDate).toLocaleDateString('id-ID')}
              </span>
            )}
            {endDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                To: {new Date(endDate).toLocaleDateString('id-ID')}
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                Search: "{debouncedSearch}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
