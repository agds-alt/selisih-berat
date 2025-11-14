/**
 * Settings Repository
 * Handles all database operations for settings
 */

import { supabaseAdmin } from '@/lib/supabase/server'
import type { Setting, SettingKey, EarningsSettings } from '@/lib/types/settings'

class SettingsRepository {
  /**
   * Get a setting by key
   */
  async getByKey(key: SettingKey): Promise<Setting | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error) {
        console.error('Error fetching setting:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getByKey:', error)
      return null
    }
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<Setting[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .order('key', { ascending: true })

      if (error) {
        console.error('Error fetching all settings:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAll:', error)
      return []
    }
  }

  /**
   * Get earnings settings
   */
  async getEarningsSettings(): Promise<EarningsSettings> {
    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select('*')
        .in('key', [
          'earnings_rate_per_entry',
          'earnings_daily_bonus',
          'earnings_enabled',
        ])

      if (error) {
        console.error('Error fetching earnings settings:', error)
        return this.getDefaultEarningsSettings()
      }

      if (!data || data.length === 0) {
        return this.getDefaultEarningsSettings()
      }

      // Convert to EarningsSettings object
      const settings: EarningsSettings = {
        rate_per_entry: 500, // Default
        daily_bonus: 50000, // Default
        enabled: true, // Default
      }

      data.forEach((setting) => {
        if (setting.key === 'earnings_rate_per_entry') {
          settings.rate_per_entry = parseFloat(setting.value)
        } else if (setting.key === 'earnings_daily_bonus') {
          settings.daily_bonus = parseFloat(setting.value)
        } else if (setting.key === 'earnings_enabled') {
          settings.enabled = setting.value === 'true'
        }
      })

      return settings
    } catch (error) {
      console.error('Error in getEarningsSettings:', error)
      return this.getDefaultEarningsSettings()
    }
  }

  /**
   * Update a setting by key
   */
  async updateByKey(
    key: SettingKey,
    value: string,
    updatedBy?: string
  ): Promise<Setting | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .update({
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key)
        .select()
        .single()

      if (error) {
        console.error('Error updating setting:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateByKey:', error)
      return null
    }
  }

  /**
   * Update earnings settings
   */
  async updateEarningsSettings(
    settings: Partial<EarningsSettings>,
    updatedBy?: string
  ): Promise<boolean> {
    try {
      const updates: Array<{
        key: SettingKey
        value: string
      }> = []

      if (settings.rate_per_entry !== undefined) {
        updates.push({
          key: 'earnings_rate_per_entry',
          value: settings.rate_per_entry.toString(),
        })
      }

      if (settings.daily_bonus !== undefined) {
        updates.push({
          key: 'earnings_daily_bonus',
          value: settings.daily_bonus.toString(),
        })
      }

      if (settings.enabled !== undefined) {
        updates.push({
          key: 'earnings_enabled',
          value: settings.enabled.toString(),
        })
      }

      // Update all settings
      for (const update of updates) {
        await this.updateByKey(update.key, update.value, updatedBy)
      }

      return true
    } catch (error) {
      console.error('Error in updateEarningsSettings:', error)
      return false
    }
  }

  /**
   * Get default earnings settings
   */
  private getDefaultEarningsSettings(): EarningsSettings {
    return {
      rate_per_entry: 500,
      daily_bonus: 50000,
      enabled: true,
    }
  }
}

export const settingsRepository = new SettingsRepository()
