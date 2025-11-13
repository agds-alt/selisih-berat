'use client'

import { useEffect, useState } from 'react'
import { getCurrentLocation, formatCoordinates } from '@/lib/utils/gps'
import type { LocationInfo } from '@/lib/types/entry'

interface Props {
  onLocationFetched: (location: LocationInfo) => void
}

export function LocationDisplay({ onLocationFetched }: Props) {
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocation()
  }, [])

  const fetchLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      const loc = await getCurrentLocation()
      setLocation(loc)
      onLocationFetched(loc)
    } catch (err: any) {
      console.error('Location error:', err)
      let errorMessage = 'Gagal mendapatkan lokasi'

      if (err.code === 1) {
        errorMessage = 'Izin lokasi ditolak. Mohon aktifkan izin lokasi di browser.'
      } else if (err.code === 2) {
        errorMessage = 'Lokasi tidak tersedia.'
      } else if (err.code === 3) {
        errorMessage = 'Waktu tunggu habis saat mendapatkan lokasi.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <span className="text-blue-700">📍 Mengambil lokasi GPS...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-red-700">⚠️ {error}</span>
          <button
            onClick={fetchLocation}
            className="ml-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!location) {
    return null
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <span className="text-green-700 font-semibold">📍 Lokasi GPS:</span>
          <div className="flex-1">
            <p className="text-green-800 font-mono text-sm">
              {formatCoordinates(location.latitude, location.longitude)}
            </p>
            <p className="text-green-600 text-xs mt-1">
              Akurasi: ±{Math.round(location.accuracy)}m
            </p>
          </div>
        </div>

        {location.address && (
          <div className="mt-2 pt-2 border-t border-green-300">
            <p className="text-green-700 text-sm">
              🌍 {location.address}
            </p>
          </div>
        )}

        {location.city && (
          <div className="text-green-600 text-xs">
            📍 {location.city}, {location.country}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-green-300 flex items-center justify-between">
          <span className="text-green-600 text-xs">
            ✓ Lokasi berhasil diambil
          </span>
          <button
            onClick={fetchLocation}
            className="text-green-700 text-xs hover:underline"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
