'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console and analytics
    console.error('Global Error:', error)

    // Log to analytics if available
    if (typeof window !== 'undefined') {
      try {
        const { trackError } = require('@/lib/analytics')
        trackError(error.message, {
          digest: error.digest,
          stack: error.stack,
          location: 'global',
        })
      } catch (e) {
        // Analytics not available yet
      }
    }
  }, [error])

  // Determine error type and customize UI
  const isNetworkError = error.message.toLowerCase().includes('network') ||
                        error.message.toLowerCase().includes('fetch')
  const isAuthError = error.message.toLowerCase().includes('auth') ||
                     error.message.toLowerCase().includes('unauthorized')
  const isNotFoundError = error.message.toLowerCase().includes('not found')

  return (
    <html lang="id">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              {isNetworkError && (
                <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl">📡</span>
                </div>
              )}
              {isAuthError && (
                <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl">🔒</span>
                </div>
              )}
              {isNotFoundError && (
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl">🔍</span>
                </div>
              )}
              {!isNetworkError && !isAuthError && !isNotFoundError && (
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl">⚠️</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {isNetworkError && 'Koneksi Bermasalah'}
              {isAuthError && 'Autentikasi Gagal'}
              {isNotFoundError && 'Tidak Ditemukan'}
              {!isNetworkError && !isAuthError && !isNotFoundError && 'Terjadi Kesalahan'}
            </h1>

            <p className="text-gray-600 mb-6">
              {isNetworkError && 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'}
              {isAuthError && 'Sesi Anda telah berakhir. Silakan login kembali.'}
              {isNotFoundError && 'Halaman yang Anda cari tidak ditemukan.'}
              {!isNetworkError && !isAuthError && !isNotFoundError &&
                'Maaf, aplikasi mengalami masalah. Tim kami telah diberitahu.'}
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Detail Error (Development)
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 text-xs">
                  <p className="font-mono text-red-600 mb-2 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-gray-500">
                      Digest: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <pre className="mt-2 text-gray-600 overflow-x-auto">
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
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
              >
                🔄 Coba Lagi
              </button>

              {isAuthError && (
                <Link
                  href="/login"
                  className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  🔑 Login Kembali
                </Link>
              )}

              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                🏠 Kembali ke Beranda
              </Link>
            </div>

            {/* Support Info */}
            <p className="mt-6 text-xs text-gray-500">
              Jika masalah berlanjut, hubungi tim support IT
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
