import type { GPSCoordinates, LocationInfo } from '@/lib/types/entry'

export async function getCurrentLocation(): Promise<LocationInfo> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
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
          resolve(coords)
        }
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address?: string; city?: string; country?: string }> {
  try {
    // Using OpenStreetMap Nominatim (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WeightEntryApp/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()

    return {
      address: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village,
      country: data.address?.country,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {}
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
