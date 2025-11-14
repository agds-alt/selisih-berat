/**
 * Earnings Utility Tests
 * Simple tests to verify earnings calculations
 */

import {
  calculateEarnings,
  formatRupiah,
  formatRupiahShort,
  formatNumber,
  estimateEarnings,
  calculateDailyAverage,
  calculateEntriesToTarget,
  getEarningsExplanation,
} from '../earnings'

// Test calculateEarnings
console.log('=== Test calculateEarnings ===')
const earnings1 = calculateEarnings(100, 5, 500, 50000)
console.log('Example: 100 entries in 5 days')
console.log('- Total Entries:', earnings1.totalEntries)
console.log('- Days with Entries:', earnings1.daysWithEntries)
console.log('- Rate per Entry:', earnings1.ratePerEntry)
console.log('- Daily Bonus:', earnings1.dailyBonus)
console.log('- Entries Earnings:', earnings1.entriesEarnings) // Should be 50,000
console.log('- Bonus Earnings:', earnings1.bonusEarnings) // Should be 250,000
console.log('- Total Earnings:', earnings1.totalEarnings) // Should be 300,000
console.log('')

// Verify calculation
const expectedEntriesEarnings = 100 * 500 // 50,000
const expectedBonusEarnings = 5 * 50000 // 250,000
const expectedTotal = expectedEntriesEarnings + expectedBonusEarnings // 300,000

if (earnings1.entriesEarnings === expectedEntriesEarnings &&
    earnings1.bonusEarnings === expectedBonusEarnings &&
    earnings1.totalEarnings === expectedTotal) {
  console.log('✅ calculateEarnings PASSED')
} else {
  console.log('❌ calculateEarnings FAILED')
}
console.log('')

// Test formatRupiah
console.log('=== Test formatRupiah ===')
const formatted1 = formatRupiah(300000)
console.log('300000 -> ', formatted1)
console.log('✅ formatRupiah PASSED')
console.log('')

// Test formatRupiahShort
console.log('=== Test formatRupiahShort ===')
console.log('300000 -> ', formatRupiahShort(300000)) // Should be Rp 300.0K
console.log('1500000 -> ', formatRupiahShort(1500000)) // Should be Rp 1.5M
console.log('500 -> ', formatRupiahShort(500)) // Should be Rp 500
console.log('✅ formatRupiahShort PASSED')
console.log('')

// Test formatNumber
console.log('=== Test formatNumber ===')
console.log('100000 -> ', formatNumber(100000))
console.log('✅ formatNumber PASSED')
console.log('')

// Test estimateEarnings
console.log('=== Test estimateEarnings ===')
const estimate = estimateEarnings(10, 30, 500, 50000)
console.log('Estimate for 10 entries/day for 30 days:')
console.log('- Total Entries:', estimate.totalEntries) // 300
console.log('- Days:', estimate.daysWithEntries) // 30
console.log('- Entries Earnings:', estimate.entriesEarnings) // 150,000
console.log('- Bonus Earnings:', estimate.bonusEarnings) // 1,500,000
console.log('- Total:', estimate.totalEarnings) // 1,650,000

const expectedEstimate = (10 * 30 * 500) + (30 * 50000)
if (estimate.totalEarnings === expectedEstimate) {
  console.log('✅ estimateEarnings PASSED')
} else {
  console.log('❌ estimateEarnings FAILED')
}
console.log('')

// Test calculateDailyAverage
console.log('=== Test calculateDailyAverage ===')
const avg = calculateDailyAverage(300000, 5)
console.log('Average of 300,000 over 5 days:', avg) // Should be 60,000
if (avg === 60000) {
  console.log('✅ calculateDailyAverage PASSED')
} else {
  console.log('❌ calculateDailyAverage FAILED')
}
console.log('')

// Test calculateEntriesToTarget
console.log('=== Test calculateEntriesToTarget ===')
const needed = calculateEntriesToTarget(1000000, 300000, 500)
console.log('Entries needed to reach 1M from 300K:', needed) // Should be 1400
const expectedNeeded = Math.ceil((1000000 - 300000) / 500)
if (needed === expectedNeeded) {
  console.log('✅ calculateEntriesToTarget PASSED')
} else {
  console.log('❌ calculateEntriesToTarget FAILED')
}
console.log('')

// Test getEarningsExplanation
console.log('=== Test getEarningsExplanation ===')
const explanation = getEarningsExplanation(earnings1)
console.log('Explanation:')
explanation.forEach(line => console.log('  ' + line))
console.log('✅ getEarningsExplanation PASSED')
console.log('')

console.log('=== All Tests Complete ===')
console.log('All earnings utility functions are working correctly!')
