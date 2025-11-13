import { formatNumber } from '@/lib/utils/helpers'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'primary',
}: StatsCardProps) {
  const variants = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }

  const iconColors = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${variants[variant]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-75">
            {title}
          </p>

          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-3xl font-bold">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>

            {trend && (
              <span
                className={`text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-sm opacity-75">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div className={`text-4xl ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
