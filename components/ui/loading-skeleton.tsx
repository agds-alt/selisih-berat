import { ReactNode } from 'react'

export interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'grid' | 'circle' | 'custom'
  width?: string | number
  height?: string | number
  count?: number
  className?: string
  children?: ReactNode
}

export function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded'

  const variantStyles = {
    text: 'h-4 w-full',
    card: 'h-48 w-full',
    table: 'h-12 w-full',
    grid: 'h-64 w-full',
    circle: 'rounded-full',
    custom: '',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  const skeletonClass = `${baseClasses} ${variantStyles[variant]} ${className}`

  if (count === 1) {
    return <div className={skeletonClass} style={style} />
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} style={style} />
      ))}
    </div>
  )
}

// Specialized skeleton variants for common use cases
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="40%" />
          <LoadingSkeleton variant="text" width="60%" height={32} />
        </div>
        <LoadingSkeleton variant="circle" width={48} height={48} />
      </div>
      <LoadingSkeleton variant="text" width="30%" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <LoadingSkeleton variant="table" height={48} className="bg-gray-300" />

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} variant="table" />
      ))}
    </div>
  )
}

export function GridSkeleton({
  columns = 3,
  rows = 2,
  className = ''
}: {
  columns?: number
  rows?: number
  className?: string
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 ${className}`}>
      {Array.from({ length: columns * rows }).map((_, i) => (
        <LoadingSkeleton key={i} variant="grid" />
      ))}
    </div>
  )
}

export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 rounded-lg border-2 border-gray-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <LoadingSkeleton variant="text" width="50%" height={16} />
          <LoadingSkeleton variant="text" width="70%" height={36} />
          <LoadingSkeleton variant="text" width="40%" height={14} />
        </div>
        <LoadingSkeleton variant="circle" width={56} height={56} />
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <LoadingSkeleton variant="circle" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" width="60%" />
            <LoadingSkeleton variant="text" width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PhotoSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      <LoadingSkeleton variant="custom" className="w-full h-full" />
    </div>
  )
}

// Shimmer animation keyframes (add to your global CSS if not using Tailwind plugins)
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
