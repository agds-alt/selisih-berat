'use client'

import { useState } from 'react'
import { estimateEarnings, formatRupiah, formatNumber } from '@/lib/utils/earnings'

interface EarningsCalculatorProps {
  defaultRate?: number
  defaultBonus?: number
}

export function EarningsCalculator({
  defaultRate = 500,
  defaultBonus = 50000
}: EarningsCalculatorProps) {
  const [entriesPerDay, setEntriesPerDay] = useState(10)
  const [numberOfDays, setNumberOfDays] = useState(30)
  const [ratePerEntry, setRatePerEntry] = useState(defaultRate)
  const [dailyBonus, setDailyBonus] = useState(defaultBonus)

  const estimated = estimateEarnings(entriesPerDay, numberOfDays, ratePerEntry, dailyBonus)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🧮</span>
        <h3 className="text-lg font-semibold text-gray-800">Earnings Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entries per Day
            </label>
            <input
              type="number"
              min="0"
              value={entriesPerDay}
              onChange={(e) => setEntriesPerDay(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Days
            </label>
            <input
              type="number"
              min="0"
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate per Entry (Rp.)
            </label>
            <input
              type="number"
              min="0"
              value={ratePerEntry}
              onChange={(e) => setRatePerEntry(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Bonus (Rp.)
            </label>
            <input
              type="number"
              min="0"
              value={dailyBonus}
              onChange={(e) => setDailyBonus(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Estimated Earnings</h4>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Entries</span>
              <span className="font-semibold text-gray-800">{formatNumber(estimated.totalEntries)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Entries Earnings ({formatNumber(estimated.totalEntries)} × {formatRupiah(ratePerEntry)})
              </span>
              <span className="font-semibold text-gray-800">{formatRupiah(estimated.entriesEarnings)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Daily Bonus ({numberOfDays} × {formatRupiah(dailyBonus)})
              </span>
              <span className="font-semibold text-gray-800">{formatRupiah(estimated.bonusEarnings)}</span>
            </div>

            <div className="pt-3 mt-3 border-t-2 border-blue-300">
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-800">Total Earnings</span>
                <span className="text-xl font-bold text-green-600">{formatRupiah(estimated.totalEarnings)}</span>
              </div>
            </div>

            {numberOfDays > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average per Day</span>
                  <span className="font-semibold text-gray-800">
                    {formatRupiah(Math.round(estimated.totalEarnings / numberOfDays))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Quick Presets:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEntriesPerDay(10)
                setNumberOfDays(30)
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              1 Month (10/day)
            </button>
            <button
              onClick={() => {
                setEntriesPerDay(20)
                setNumberOfDays(30)
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              1 Month (20/day)
            </button>
            <button
              onClick={() => {
                setEntriesPerDay(50)
                setNumberOfDays(30)
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              1 Month (50/day)
            </button>
            <button
              onClick={() => {
                setEntriesPerDay(100)
                setNumberOfDays(30)
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              1 Month (100/day)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
