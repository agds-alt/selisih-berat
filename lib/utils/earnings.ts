/**
 * Earnings Utility
 * Client-side earnings calculations and formatting
 */

export interface EarningsBreakdown {
  totalEntries: number
  daysWithEntries: number
  ratePerEntry: number
  dailyBonus: number
  entriesEarnings: number
  bonusEarnings: number
  totalEarnings: number
}

/**
 * Calculate earnings based on entries and days
 */
export function calculateEarnings(
  totalEntries: number,
  daysWithEntries: number,
  ratePerEntry: number = 500,
  dailyBonus: number = 50000
): EarningsBreakdown {
  const entriesEarnings = totalEntries * ratePerEntry
  const bonusEarnings = daysWithEntries * dailyBonus
  const totalEarnings = entriesEarnings + bonusEarnings

  return {
    totalEntries,
    daysWithEntries,
    ratePerEntry,
    dailyBonus,
    entriesEarnings,
    bonusEarnings,
    totalEarnings,
  }
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency to short format (e.g., 1.5K, 2.3M)
 */
export function formatRupiahShort(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)}K`
  }
  return `Rp ${amount}`
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

/**
 * Calculate estimated earnings for a hypothetical scenario
 */
export function estimateEarnings(
  entriesPerDay: number,
  numberOfDays: number,
  ratePerEntry: number = 500,
  dailyBonus: number = 50000
): EarningsBreakdown {
  const totalEntries = entriesPerDay * numberOfDays
  const daysWithEntries = numberOfDays

  return calculateEarnings(totalEntries, daysWithEntries, ratePerEntry, dailyBonus)
}

/**
 * Get earnings color based on amount
 */
export function getEarningsColor(amount: number): string {
  if (amount >= 1000000) return 'text-green-600' // >= 1M
  if (amount >= 500000) return 'text-blue-600' // >= 500K
  if (amount >= 100000) return 'text-yellow-600' // >= 100K
  return 'text-gray-600'
}

/**
 * Get earnings badge variant
 */
export function getEarningsBadge(amount: number): {
  label: string
  variant: 'success' | 'info' | 'warning' | 'default'
} {
  if (amount >= 1000000) {
    return { label: 'Excellent', variant: 'success' }
  } else if (amount >= 500000) {
    return { label: 'Great', variant: 'info' }
  } else if (amount >= 100000) {
    return { label: 'Good', variant: 'warning' }
  }
  return { label: 'Keep Going', variant: 'default' }
}

/**
 * Calculate daily average earnings
 */
export function calculateDailyAverage(
  totalEarnings: number,
  daysWithEntries: number
): number {
  if (daysWithEntries === 0) return 0
  return totalEarnings / daysWithEntries
}

/**
 * Calculate entries needed to reach target earnings
 */
export function calculateEntriesToTarget(
  targetEarnings: number,
  currentEarnings: number,
  ratePerEntry: number = 500
): number {
  const remaining = Math.max(0, targetEarnings - currentEarnings)
  return Math.ceil(remaining / ratePerEntry)
}

/**
 * Get earnings breakdown explanation
 */
export function getEarningsExplanation(breakdown: EarningsBreakdown): string[] {
  return [
    `${formatNumber(breakdown.totalEntries)} entries × ${formatRupiah(breakdown.ratePerEntry)} = ${formatRupiah(breakdown.entriesEarnings)}`,
    `${breakdown.daysWithEntries} days × ${formatRupiah(breakdown.dailyBonus)} = ${formatRupiah(breakdown.bonusEarnings)}`,
    `Total: ${formatRupiah(breakdown.totalEarnings)}`,
  ]
}
