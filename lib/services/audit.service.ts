import { supabaseAdmin } from '@/lib/supabase/server'

export type AuditAction =
  | 'settings.update'
  | 'entry.create'
  | 'entry.update'
  | 'entry.delete'
  | 'entry.bulk_update'
  | 'entry.bulk_delete'
  | 'user.create'
  | 'user.update'
  | 'user.activate'
  | 'user.deactivate'
  | 'user.reset_password'
  | 'user.change_password'
  | 'login.success'
  | 'login.failed'
  | 'profile.update'

interface AuditLogData {
  userId: string
  action: AuditAction
  resource?: string
  details?: Record<string, any>
}

export class AuditService {
  /**
   * Log an action to audit_logs table
   * NOTE: This should never throw errors to avoid breaking main functionality
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      const { error } = await supabaseAdmin.from('audit_logs').insert({
        user_id: data.userId,
        action: data.action,
        resource: data.resource || null,
        details: data.details || null,
        timestamp: new Date().toISOString(),
      })

      if (error) {
        console.error('Audit log insert error:', error)
      }
    } catch (error) {
      // Silently fail - audit logging should never break main functionality
      console.error('Audit service error:', error)
    }
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filters: {
    userId?: string
    action?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabaseAdmin
        .from('audit_logs')
        .select('*', { count: 'exact' })

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters.action) {
        query = query.eq('action', filters.action)
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate)
      }

      query = query
        .order('timestamp', { ascending: false })
        .range(
          filters.offset || 0,
          (filters.offset || 0) + (filters.limit || 50) - 1
        )

      const { data, error, count } = await query

      if (error) throw error

      return { logs: data || [], total: count || 0 }
    } catch (error) {
      console.error('Get audit logs error:', error)
      return { logs: [], total: 0 }
    }
  }

  /**
   * Get recent activity for a specific user
   */
  async getUserActivity(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Get user activity error:', error)
      return []
    }
  }

  /**
   * Get activity count by action type
   */
  async getActivityStats(startDate?: string, endDate?: string) {
    try {
      let query = supabaseAdmin
        .from('audit_logs')
        .select('action')

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Count by action type
      const stats = (data || []).reduce((acc: Record<string, number>, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {})

      return stats
    } catch (error) {
      console.error('Get activity stats error:', error)
      return {}
    }
  }
}

// Export singleton instance
export const auditService = new AuditService()
