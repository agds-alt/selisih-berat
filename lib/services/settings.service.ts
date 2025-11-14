/**
 * Settings Service
 * Business logic for settings management
 */

import { settingsRepository } from '@/lib/repositories/settings.repository'
import { userRepository } from '@/lib/repositories/user.repository'
import type { EarningsSettings, UpdateEarningsSettingsRequest } from '@/lib/types/settings'

class SettingsService {
  /**
   * Get earnings settings
   */
  async getEarningsSettings(): Promise<{
    success: boolean
    data?: EarningsSettings
    message?: string
  }> {
    try {
      const settings = await settingsRepository.getEarningsSettings()

      return {
        success: true,
        data: settings,
      }
    } catch (error: any) {
      console.error('Error getting earnings settings:', error)
      return {
        success: false,
        message: error.message || 'Failed to get earnings settings',
      }
    }
  }

  /**
   * Update earnings settings (Admin only)
   */
  async updateEarningsSettings(
    request: UpdateEarningsSettingsRequest
  ): Promise<{
    success: boolean
    data?: EarningsSettings
    message?: string
  }> {
    try {
      // Validate inputs
      if (request.rate_per_entry !== undefined) {
        if (request.rate_per_entry < 0) {
          return {
            success: false,
            message: 'Rate per entry must be a positive number',
          }
        }
      }

      if (request.daily_bonus !== undefined) {
        if (request.daily_bonus < 0) {
          return {
            success: false,
            message: 'Daily bonus must be a positive number',
          }
        }
      }

      // Update settings
      const updated = await settingsRepository.updateEarningsSettings(
        {
          rate_per_entry: request.rate_per_entry,
          daily_bonus: request.daily_bonus,
          enabled: request.enabled,
        },
        request.updated_by
      )

      if (!updated) {
        return {
          success: false,
          message: 'Failed to update earnings settings',
        }
      }

      // Get updated settings
      const settings = await settingsRepository.getEarningsSettings()

      // Update all user statistics with new rates
      await userRepository.updateAllUserEarnings()

      return {
        success: true,
        data: settings,
        message: 'Earnings settings updated successfully',
      }
    } catch (error: any) {
      console.error('Error updating earnings settings:', error)
      return {
        success: false,
        message: error.message || 'Failed to update earnings settings',
      }
    }
  }

  /**
   * Get user earnings
   */
  async getUserEarnings(username: string): Promise<{
    success: boolean
    data?: any
    message?: string
  }> {
    try {
      const earnings = await userRepository.calculateUserEarnings(username)

      if (!earnings) {
        return {
          success: false,
          message: 'User not found or has no entries',
        }
      }

      return {
        success: true,
        data: earnings,
      }
    } catch (error: any) {
      console.error('Error getting user earnings:', error)
      return {
        success: false,
        message: error.message || 'Failed to get user earnings',
      }
    }
  }

  /**
   * Recalculate all user earnings (Admin only)
   */
  async recalculateAllEarnings(): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const updated = await userRepository.updateAllUserEarnings()

      if (!updated) {
        return {
          success: false,
          message: 'Failed to recalculate earnings',
        }
      }

      return {
        success: true,
        message: 'All user earnings recalculated successfully',
      }
    } catch (error: any) {
      console.error('Error recalculating earnings:', error)
      return {
        success: false,
        message: error.message || 'Failed to recalculate earnings',
      }
    }
  }
}

export const settingsService = new SettingsService()
