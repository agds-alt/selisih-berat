import { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode | string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'py-8',
      icon: 'text-4xl mb-3',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'text-6xl mb-4',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'text-8xl mb-6',
      title: 'text-2xl',
      description: 'text-lg',
    },
  }

  const actionVariants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes[size].container} ${className}`}>
      {icon && (
        <div className={`${sizes[size].icon} opacity-40`}>
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}

      <h3 className={`font-semibold text-gray-800 mb-2 ${sizes[size].title}`}>
        {title}
      </h3>

      {description && (
        <p className={`text-gray-600 max-w-md mb-6 ${sizes[size].description}`}>
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${
            actionVariants[action.variant || 'primary']
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Pre-configured empty state variants for common scenarios

export function NoDataEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon="📊"
      title="Belum Ada Data"
      description="Belum ada data yang tersedia saat ini. Data akan muncul setelah Anda melakukan input pertama."
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
        variant: 'outline',
      } : undefined}
    />
  )
}

export function NoResultsEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="Tidak Ada Hasil"
      description="Tidak ditemukan hasil yang sesuai dengan pencarian Anda. Coba gunakan kata kunci lain."
      action={onClear ? {
        label: 'Hapus Filter',
        onClick: onClear,
        variant: 'outline',
      } : undefined}
      size="sm"
    />
  )
}

export function NoEntriesEmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="📦"
      title="Belum Ada Entry"
      description="Mulai tambahkan entry pertama Anda untuk melacak selisih berat paket."
      action={onCreate ? {
        label: 'Tambah Entry Pertama',
        onClick: onCreate,
        variant: 'primary',
      } : undefined}
    />
  )
}

export function NoPhotosEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon="📷"
      title="Belum Ada Foto"
      description="Upload foto untuk mendokumentasikan kondisi paket."
      action={onUpload ? {
        label: 'Upload Foto',
        onClick: onUpload,
        variant: 'primary',
      } : undefined}
      size="sm"
    />
  )
}

export function ErrorEmptyState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Terjadi Kesalahan"
      description={message || 'Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.'}
      action={onRetry ? {
        label: 'Coba Lagi',
        onClick: onRetry,
        variant: 'primary',
      } : undefined}
    />
  )
}

export function PermissionDeniedEmptyState({ onRequestPermission }: { onRequestPermission?: () => void }) {
  return (
    <EmptyState
      icon="🔒"
      title="Akses Ditolak"
      description="Anda tidak memiliki izin untuk mengakses halaman atau fitur ini."
      action={onRequestPermission ? {
        label: 'Minta Izin',
        onClick: onRequestPermission,
        variant: 'primary',
      } : undefined}
    />
  )
}

export function OfflineEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="📡"
      title="Tidak Ada Koneksi"
      description="Sepertinya Anda sedang offline. Periksa koneksi internet Anda dan coba lagi."
      action={onRetry ? {
        label: 'Coba Lagi',
        onClick: onRetry,
        variant: 'primary',
      } : undefined}
    />
  )
}
