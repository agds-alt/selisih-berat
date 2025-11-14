import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (1 request per second per Nominatim ToS)
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 1000 // 1 second in milliseconds

// Cache for geocoding results (same coords = same result)
const geocodeCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

function getRateLimitKey(ip: string): string {
  return `geocode:${ip}`
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const lastRequest = rateLimitMap.get(key)

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return false // Rate limit exceeded
  }

  rateLimitMap.set(key, now)

  // Clean up old entries
  if (rateLimitMap.size > 1000) {
    const keysToDelete: string[] = []
    rateLimitMap.forEach((timestamp, k) => {
      if (now - timestamp > RATE_LIMIT_WINDOW * 10) {
        keysToDelete.push(k)
      }
    })
    keysToDelete.forEach(k => rateLimitMap.delete(k))
  }

  return true
}

function getCachedGeocode(lat: string, lon: string): any | null {
  const cacheKey = `${lat},${lon}`
  const cached = geocodeCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  if (cached) {
    geocodeCache.delete(cacheKey) // Remove stale cache
  }

  return null
}

function setCachedGeocode(lat: string, lon: string, data: any): void {
  const cacheKey = `${lat},${lon}`
  geocodeCache.set(cacheKey, { data, timestamp: Date.now() })

  // Clean up old cache entries
  if (geocodeCache.size > 100) {
    const now = Date.now()
    const keysToDelete: string[] = []
    geocodeCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_DURATION) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(k => geocodeCache.delete(k))
  }
}

/**
 * GET /api/geocode - Reverse geocoding proxy for Nominatim
 * Query params: lat, lon
 */
export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please wait 1 second between requests.'
        },
        { status: 429 }
      )
    }

    // Get and validate parameters
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters: lat and lon'
        },
        { status: 400 }
      )
    }

    // Validate coordinates
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid coordinates format'
        },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coordinates out of valid range'
        },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = getCachedGeocode(lat, lon)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      })
    }

    // Fetch from Nominatim with proper headers
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'WeightEntryApp/1.0 (J&T Express Weight Tracking)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText)

      // Return fallback on error
      return NextResponse.json({
        success: true,
        data: {
          address: 'Unknown Location',
          city: undefined,
          country: undefined,
        },
        fallback: true,
      })
    }

    const data = await response.json()

    // Format response
    const result = {
      address: data.display_name || 'Unknown Location',
      city: data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality,
      country: data.address?.country,
      state: data.address?.state,
      postcode: data.address?.postcode,
    }

    // Cache the result
    setCachedGeocode(lat, lon, result)

    return NextResponse.json({
      success: true,
      data: result,
    })

  } catch (error: any) {
    console.error('Geocode API error:', error)

    // Return fallback on error instead of failing
    return NextResponse.json({
      success: true,
      data: {
        address: 'Unknown Location',
        city: undefined,
        country: undefined,
      },
      fallback: true,
    })
  }
}
