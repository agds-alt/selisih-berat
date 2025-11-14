'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console and analytics
    console.error('Protected Route Error:', error)

    // Log to analytics if available
    if (typeof window !== 'undefined') {
      try {
        const { trackError } = require('@/lib/analytics')
        trackError(error.message, {
          digest: error.digest,
          stack: error.stack,
          location: 'protected-routes',
        })
      } catch (e) {
        // Analytics not available yet
      }
    }
  }, [error])

  // Determine specific error types
  const isDataError = error.message.toLowerCase().includes('data') ||
                     error.message.toLowerCase().includes('fetch')
  const isPermissionError = error.message.toLowerCase().includes('permission') ||
                           error.message.toLowerCase().includes('forbidden')
  const isValidationError = error.message.toLowerCase().includes('validation') ||
                           error.message.toLowerCase().includes('invalid')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        {/* Error Icon */}
        <div className="mb-6 text-center">
          {isDataError && (
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
          )}
          {isPermissionError && (
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🚫</span>
            </div>
          )}
          {isValidationError && (
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          )}
          {!isDataError && !isPermissionError && !isValidationError && (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          )}
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {isDataError && 'Gagal Memuat Data'}
          {isPermissionError && 'Akses Ditolak'}
          {isValidationError && 'Data Tidak Valid'}
          {!isDataError && !isPermissionError && !isValidationError && 'Terjadi Kesalahan'}
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 text-center mb-6">
          {isDataError && 'Tidak dapat memuat data. Periksa koneksi atau coba lagi.'}
          {isPermissionError && 'Anda tidak memiliki izin untuk mengakses halaman ini.'}
          {isValidationError && 'Data yang Anda masukkan tidak valid. Periksa kembali input Anda.'}
          {!isDataError && !isPermissionError && !isValidationError &&
            'Maaf, terjadi kesalahan saat memproses permintaan Anda.'}
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Detail Error (Development)
            </summary>
            <div className="bg-gray-50 rounded-lg p-4 text-xs">
              <p className="font-mono text-red-600 mb-2 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-gray-500 mb-2">
                  Digest: {error.digest}
                </p>
              )}
              {error.stack && (
                <pre className="text-gray-600 overflow-x-auto max-h-40">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow hover:shadow-lg"
          >
            🔄 Coba Lagi
          </button>

          {isPermissionError && (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              📊 Kembali ke Dashboard
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Kembali
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Error Code: {error.digest || 'UNKNOWN'}
          </p>
          {isPermissionError && (
            <p className="text-xs text-gray-600 text-center mt-2">
              Hubungi administrator jika Anda merasa ini adalah kesalahan
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
