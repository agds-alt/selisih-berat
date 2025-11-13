export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export const ENTRY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const EARNINGS_RATE = {
  MIN: 500,
  MAX: 1500,
} as const

export const USER_LEVELS = {
  BEGINNER: { min: 0, max: 99, name: 'Beginner', color: 'gray' },
  BRONZE: { min: 100, max: 499, name: 'Bronze', color: 'orange' },
  SILVER: { min: 500, max: 999, name: 'Silver', color: 'gray' },
  GOLD: { min: 1000, max: 4999, name: 'Gold', color: 'yellow' },
  DIAMOND: { min: 5000, max: Infinity, name: 'Diamond', color: 'blue' },
} as const

export const BARCODE_FORMATS = [
  'code_128',
  'ean',
  'ean_8',
  'code_39',
  'codabar',
  'upc',
  'upc_e',
] as const

export type Role = typeof ROLES[keyof typeof ROLES]
export type EntryStatus = typeof ENTRY_STATUS[keyof typeof ENTRY_STATUS]

export function getUserLevel(totalEntries: number) {
  for (const [key, level] of Object.entries(USER_LEVELS)) {
    if (totalEntries >= level.min && totalEntries <= level.max) {
      return level
    }
  }
  return USER_LEVELS.BEGINNER
}

export function calculateEarnings(selisih: number, totalEntries: number): number {
  const level = getUserLevel(totalEntries)
  const baseRate = EARNINGS_RATE.MIN
  const maxRate = EARNINGS_RATE.MAX

  // Accuracy bonus: smaller selisih = better
  const accuracyBonus = Math.abs(selisih) < 0.5 ? 1.5 : 1.0

  // Level-based rate
  let rate: number = baseRate
  if (level.name === 'Bronze') rate = 700
  else if (level.name === 'Silver') rate = 900
  else if (level.name === 'Gold') rate = 1200
  else if (level.name === 'Diamond') rate = 1500

  return Math.round(rate * accuracyBonus)
}
