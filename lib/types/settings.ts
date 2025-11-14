/**
 * Settings types for admin-configurable application settings
 */

export type SettingType = 'string' | 'number' | 'boolean' | 'json'

export interface Setting {
  id: number
  key: string
  value: string
  description: string | null
  type: string
  updated_at: string | null
  updated_by: string | null
}

export interface EarningsSettings {
  rate_per_entry: number
  daily_bonus: number
  enabled: boolean
}

export interface EarningsCalculation {
  username: string
  total_entries: number
  days_with_entries: number
  rate_per_entry: number
  daily_bonus: number
  entries_earnings: number
  bonus_earnings: number
  total_earnings: number
}

export interface UpdateSettingRequest {
  key: string
  value: string
  updated_by: string
}

export interface UpdateEarningsSettingsRequest {
  rate_per_entry?: number
  daily_bonus?: number
  enabled?: boolean
  updated_by: string
}

export type SettingKey =
  | 'earnings_rate_per_entry'
  | 'earnings_daily_bonus'
  | 'earnings_enabled'
