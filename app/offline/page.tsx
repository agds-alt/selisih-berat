'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Check if online
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Auto redirect when back online
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Connection Status Icon */}
        <div className="mb-6 relative">
          {isOnline ? (
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-in">
              <span className="text-6xl">✓</span>
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <div className="relative">
                <span className="text-6xl">📡</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          )}
        </div>

        {/* Status Message */}
        {isOnline ? (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-3">
              Kembali Online!
            </h1>
            <p className="text-gray-600 mb-6">
              Koneksi telah terhubung kembali. Mengalihkan ke aplikasi...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Tidak Ada Koneksi
            </h1>
            <p className="text-gray-600 mb-6">
              Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
            </p>

            {/* Offline Features */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">
                Fitur yang Masih Tersedia:
              </h2>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Lihat data yang sudah dimuat sebelumnya</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Draft entry akan disimpan lokal</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Navigasi antar halaman yang sudah dikunjungi</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow hover:shadow-lg"
              >
                🔄 Coba Lagi
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                🏠 Kembali ke Beranda
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">
                Tips untuk koneksi:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Periksa koneksi WiFi atau data seluler Anda</li>
                <li>• Coba aktifkan mode pesawat kemudian matikan</li>
                <li>• Pastikan Anda berada di area dengan sinyal baik</li>
              </ul>
            </div>
          </>
        )}

        {/* Connection Status Indicator */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
