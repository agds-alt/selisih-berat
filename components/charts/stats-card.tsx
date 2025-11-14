'use client'

import { formatNumber } from '@/lib/utils/helpers'
import { ReactNode, useEffect, useState } from 'react'
import { StatCardSkeleton } from '@/components/ui/loading-skeleton'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
  animated?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  loading = false,
  animated = true,
  className = '',
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Count-up animation effect
  useEffect(() => {
    if (!animated || typeof value !== 'number' || loading) {
      return
    }

    setIsAnimating(true)
    const duration = 1000 // 1 second
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
        setIsAnimating(false)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, animated, loading])

  // Show loading skeleton
  if (loading) {
    return <StatCardSkeleton className={className} />
  }

  const variants = {
    default: 'bg-white border-gray-200 text-gray-700',
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }

  const iconColors = {
    default: 'text-gray-600',
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }

  const trendColors = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
  }

  return (
    <div
      className={`p-6 rounded-lg border-2 ${variants[variant]} transition-all hover:shadow-lg ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-75">
            {title}
          </p>

          <div className="mt-2 flex items-baseline space-x-2">
            <p className={`text-3xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
              {typeof value === 'number'
                ? formatNumber(animated ? displayValue : value)
                : value
              }
            </p>

            {trend && (
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  trend.isPositive ? trendColors.positive : trendColors.negative
                }`}
              >
                <span className="mr-1">
                  {trend.isPositive ? '↑' : '↓'}
                </span>
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-sm opacity-75">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div className={`text-4xl ${iconColors[variant]} opacity-80`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized stats card variants

export function MetricCard({
  label,
  value,
  unit,
  change,
  icon,
  loading = false,
}: {
  label: string
  value: number
  unit?: string
  change?: number
  icon?: ReactNode
  loading?: boolean
}) {
  return (
    <StatsCard
      title={label}
      value={`${value}${unit || ''}`}
      variant="default"
      loading={loading}
      icon={icon}
      trend={change !== undefined ? {
        value: change,
        isPositive: change > 0,
      } : undefined}
    />
  )
}

export function CountCard({
  label,
  count,
  icon,
  variant = 'primary',
  loading = false,
}: {
  label: string
  count: number
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
}) {
  return (
    <StatsCard
      title={label}
      value={count}
      variant={variant}
      loading={loading}
      icon={icon}
      animated={true}
    />
  )
}

export function PercentageCard({
  label,
  percentage,
  subtitle,
  icon,
  loading = false,
}: {
  label: string
  percentage: number
  subtitle?: string
  icon?: ReactNode
  loading?: boolean
}) {
  const variant: 'success' | 'warning' | 'danger' =
    percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger'

  return (
    <StatsCard
      title={label}
      value={`${percentage}%`}
      subtitle={subtitle}
      variant={variant}
      loading={loading}
      icon={icon}
    />
  )
}
