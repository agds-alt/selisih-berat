/**
 * Analytics Tracking System
 *
 * Console-based analytics that can be easily extended with
 * Google Analytics, Mixpanel, or other analytics providers.
 */

type EventCategory =
  | 'page_view'
  | 'user_action'
  | 'error'
  | 'performance'
  | 'auth'
  | 'entry'
  | 'export'

interface AnalyticsEvent {
  category: EventCategory
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: string
  userId?: string
  sessionId?: string
}

class Analytics {
  private isEnabled: boolean
  private sessionId: string
  private events: AnalyticsEvent[] = []

  constructor() {
    // Only enable in production or if explicitly enabled
    this.isEnabled =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

    // Generate session ID
    this.sessionId = this.generateSessionId()

    // Initialize
    if (this.isEnabled) {
      this.init()
    }
  }

  private init() {
    console.log('[Analytics] Initialized', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    })

    // Track page visibility changes
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_view', 'page_hidden')
        } else {
          this.track('page_view', 'page_visible')
        }
      })
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined

    try {
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return userData.username || userData.id
      }
    } catch (e) {
      // Ignore errors
    }

    return undefined
  }

  /**
   * Track a custom event
   */
  track(
    category: EventCategory,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
    }

    this.events.push(event)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event)
    }

    // Send to analytics provider if configured
    this.sendToProvider(event)
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    this.track('page_view', 'view', path, undefined, { title })
  }

  /**
   * Track user action
   */
  trackAction(action: string, label?: string, metadata?: Record<string, any>) {
    this.track('user_action', action, label, undefined, metadata)
  }

  /**
   * Track error
   */
  trackError(message: string, metadata?: Record<string, any>) {
    this.track('error', 'error_occurred', message, undefined, metadata)
  }

  /**
   * Track authentication events
   */
  trackAuth(action: 'login' | 'logout' | 'signup' | 'password_change', metadata?: Record<string, any>) {
    this.track('auth', action, undefined, undefined, metadata)
  }

  /**
   * Track entry operations
   */
  trackEntry(
    action: 'create' | 'update' | 'delete' | 'view',
    metadata?: Record<string, any>
  ) {
    this.track('entry', action, undefined, undefined, metadata)
  }

  /**
   * Track export operations
   */
  trackExport(format: 'csv' | 'excel' | 'zip', count?: number) {
    this.track('export', 'export_data', format, count)
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, metadata?: Record<string, any>) {
    this.track('performance', metric, undefined, value, metadata)
  }

  /**
   * Send event to analytics provider
   */
  private sendToProvider(event: AnalyticsEvent) {
    if (!this.isEnabled) return

    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      })
    }

    // Example: Custom API endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't let analytics break the app
      })
    }
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = []
  }

  /**
   * Export events as JSON
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const summary = {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      eventsByCategory: {} as Record<string, number>,
      firstEvent: this.events[0]?.timestamp,
      lastEvent: this.events[this.events.length - 1]?.timestamp,
    }

    this.events.forEach(event => {
      summary.eventsByCategory[event.category] =
        (summary.eventsByCategory[event.category] || 0) + 1
    })

    return summary
  }
}

// Create singleton instance
const analytics = new Analytics()

// Export individual functions for convenience
export const trackPageView = (path: string, title?: string) =>
  analytics.trackPageView(path, title)

export const trackAction = (action: string, label?: string, metadata?: Record<string, any>) =>
  analytics.trackAction(action, label, metadata)

export const trackError = (message: string, metadata?: Record<string, any>) =>
  analytics.trackError(message, metadata)

export const trackAuth = (action: 'login' | 'logout' | 'signup' | 'password_change', metadata?: Record<string, any>) =>
  analytics.trackAuth(action, metadata)

export const trackEntry = (action: 'create' | 'update' | 'delete' | 'view', metadata?: Record<string, any>) =>
  analytics.trackEntry(action, metadata)

export const trackExport = (format: 'csv' | 'excel' | 'zip', count?: number) =>
  analytics.trackExport(format, count)

export const trackPerformance = (metric: string, value: number, metadata?: Record<string, any>) =>
  analytics.trackPerformance(metric, value, metadata)

export default analytics
