import type { GPSCoordinates, LocationInfo } from '@/lib/types/entry'

export interface GPSError {
  code: number
  message: string
  userMessage: string
}

export async function getCurrentLocation(): Promise<LocationInfo> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error: GPSError = {
        code: 0,
        message: 'Geolocation not supported',
        userMessage: 'Browser Anda tidak mendukung GPS. Gunakan browser modern seperti Chrome atau Firefox.'
      }
      reject(error)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: GPSCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }

        // Try to get address via reverse geocoding
        try {
          const address = await reverseGeocode(coords.latitude, coords.longitude)
          resolve({ ...coords, ...address })
        } catch (error) {
          // Even if geocoding fails, we still have coordinates
          resolve(coords)
        }
      },
      (error) => {
        // Enhance error with user-friendly messages
        const gpsError: GPSError = {
          code: error.code,
          message: error.message,
          userMessage: getGPSErrorMessage(error.code)
        }
        reject(gpsError)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased from 10s to 15s for better reliability
        maximumAge: 0,
      }
    )
  })
}

function getGPSErrorMessage(code: number): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return 'Izin lokasi ditolak. Mohon aktifkan izin lokasi di pengaturan browser Anda.'
    case 2: // POSITION_UNAVAILABLE
      return 'Lokasi tidak tersedia. Pastikan GPS/WiFi aktif dan Anda berada di area dengan sinyal baik.'
    case 3: // TIMEOUT
      return 'Waktu tunggu habis. Silakan coba lagi atau periksa koneksi GPS Anda.'
    default:
      return 'Gagal mendapatkan lokasi. Silakan coba lagi.'
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address?: string; city?: string; country?: string }> {
  try {
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch(
      `/api/geocode?lat=${lat}&lon=${lng}`
    )

    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return { address: 'Unknown Location' }
    }

    const result = await response.json()

    if (!result.success) {
      console.error('Geocoding failed:', result.message)
      return { address: 'Unknown Location' }
    }

    return {
      address: result.data.address || 'Unknown Location',
      city: result.data.city,
      country: result.data.country,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return { address: 'Unknown Location' }
  }
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

export function formatLocation(location: LocationInfo): string {
  if (location.address) {
    return location.address
  }
  return formatCoordinates(location.latitude, location.longitude)
}
