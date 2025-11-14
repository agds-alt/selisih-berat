'use client'

import { useEffect } from 'react'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  metadata?: {
    nama?: string
    no_resi?: string
    created_at?: string
    created_by?: string
  }
}

export function PhotoModal({ isOpen, onClose, photoUrl, metadata }: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Photo */}
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photoUrl}
            alt="Full size photo"
            crossOrigin="anonymous"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Metadata */}
        {metadata && (
          <div
            className="mt-4 bg-white rounded-lg p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {metadata.nama && (
                <div>
                  <span className="font-semibold text-gray-700">Nama:</span>
                  <p className="text-gray-900">{metadata.nama}</p>
                </div>
              )}
              {metadata.no_resi && (
                <div>
                  <span className="font-semibold text-gray-700">No Resi:</span>
                  <p className="text-gray-900">{metadata.no_resi}</p>
                </div>
              )}
              {metadata.created_at && (
                <div>
                  <span className="font-semibold text-gray-700">Tanggal:</span>
                  <p className="text-gray-900">
                    {new Date(metadata.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
              {metadata.created_by && (
                <div>
                  <span className="font-semibold text-gray-700">Dibuat oleh:</span>
                  <p className="text-gray-900">{metadata.created_by}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
