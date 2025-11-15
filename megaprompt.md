# Complete Next.js 14 Weight Entry App - Full Stack Generation (REVISED)

## Context
I have a Supabase database with types already defined in `database.types.ts`. I need to build a complete Next.js 14 App Router application from scratch for a weight tracking system (logistics/J&T Express).

**IMPORTANT: Production database already has 25,000+ entries and 50,000+ photos. All stats and displays must show real data from existing database.**

## Existing Files
- ✅ `database.types.ts` - Supabase database types (already in project)

## Database Schema (Reference)
Tables:
- `users`: id, username, password, email, full_name, role (admin/user), is_active, created_at
- `entries`: id, nama, no_resi, berat_resi, berat_aktual, selisih, foto_url_1, foto_url_2, catatan, status, created_by, created_at
- `user_statistics`: username, total_entries, total_earnings, daily_entries, daily_earnings, avg_selisih
- `audit_logs`: id, user_id, action, resource, details

## Project Requirements

### Core Features
1. **Authentication**: JWT-based (access + refresh tokens), bcrypt password hashing
2. **Entry Management**: Create entries with 2 photos (Cloudinary), auto-calculate weight difference (selisih)
3. **Admin Dashboard**: View all entries, approve/reject, export to Excel/CSV
4. **User Dashboard**: View own entries, statistics, earnings, leaderboard
5. **PWA**: Installable, offline-capable, push notifications ready
6. **Role-based Access**: Admin (full access) vs User (own data only)

### Business Logic
- Weight difference (selisih) = berat_aktual - berat_resi
- Earnings = 500-1500 rupiah per entry (based on accuracy)
- User levels: Beginner (0-99), Bronze (100-499), Silver (500-999), Gold (1000-4999), Diamond (5000+)

### Critical Entry Form Features (MUST IMPLEMENT)
1. **Barcode Scanner**: 
   - Use `@ericblade/quagga2` library for JNT barcode scanning
   - Scan No Resi from package barcode
   - Support multiple barcode formats (Code128, EAN, etc.)
   - Show camera preview with scan overlay
   - Manual input fallback if scan fails

2. **Auto GPS Capture**:
   - Auto-capture GPS coordinates on page load
   - Display: latitude, longitude, accuracy
   - Show location name (reverse geocoding via browser API)
   - Store coordinates in entry metadata

3. **Auto Timestamp**:
   - Auto-fill current date & time
   - Display in Indonesian format: "14 November 2024, 15:30 WIB"
   - Store as ISO timestamp in database

4. **GPS Watermark on Photos**:
   - Before uploading to Cloudinary, add watermark to images
   - Watermark contains: Date, Time, GPS Coordinates, Location
   - Use HTML5 Canvas to draw watermark on image
   - Position: Bottom of image, semi-transparent overlay

5. **Direct Cloudinary Upload**:
   - Upload directly from browser to Cloudinary (NOT through API)
   - Use unsigned upload preset
   - Show upload progress
   - Generate thumbnail on upload
   - This saves 99% bandwidth (5KB vs 4MB per entry)

---

## TASK 1: Initialize & Install Dependencies
```bash
# Already initialized, just install packages
npm install @supabase/supabase-js zod bcryptjs jsonwebtoken jose
npm install xlsx papaparse
npm install @ericblade/quagga2
npm install -D @types/bcryptjs @types/jsonwebtoken @types/papaparse
npm install next-pwa
```

---

## TASK 2: Setup Environment & Config

Create `.env.local`: sesuaikan aja settingannya dengan nextjs karena ini gw ambil dari project lama
```env
==================== SERVER CONFIGURATION ====================

NODE_ENV=production PORT=3000



==================== CLOUDINARY CONFIGURATION ====================


CLOUDINARY_CLOUD_NAME=dl6xk437w
CLOUDINARY_UPLOAD_PRESET=selisih_berat
CLOUDINARY_FOLDER=selisih_berat


==================== SECURITY ====================
Comma-separated list of allowed origins for CORS

ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
==================== RATE LIMITING ====================
Optional: Configure rate limits
LOGIN_RATE_LIMIT_WINDOW=900000 # 15 minutes in ms
LOGIN_RATE_LIMIT_MAX=5 # Max attempts
API_RATE_LIMIT_WINDOW=60000 # 1 minute in ms
API_RATE_LIMIT_MAX=30 # Max requests

SUPABASE_URL=https://lvsfcxfrvtsjkhbpgllq.supabase.co 
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2c2ZjeGZydnRzamtoYnBnbGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDczNzAsImV4cCI6MjA3MzYyMzM3MH0.VC9Bv8eUAak4jX5Vmwd-jJUPPfb-fGYdEX33qfwHelQ
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2c2ZjeGZydnRzamtoYnBnbGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA0NzM3MCwiZXhwIjoyMDczNjIzMzcwfQ.g9QjdsU_UU9Xuvk8TmOhQ14Zfi5IFKBdXwrGKIeFxXY
==================== JWT ====================

==================== SESSION CONFIGURATION ====================
IMPORTANT: Change this to a long random string in production!

SESSION_SECRET=4c54fd6c6e8a627f464f71b3d6285df497875a7c4cdd32d300104269e3d1477f
JWT_SECRET=e1b01d591dc4ea53af1d4c7b7f7773a4657886a7eaea8e0daeac6c9abfcaca6b
JWT_REFRESH_SECRET=ac4b9c2c2d0bf23e759f2b6dceaf6470ddfd273e0d6e7639aa71a372c257c7f0
```

Create `.env.example` (same as above but with placeholder values)

Update `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Allow Quagga.js worker files
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = withPWA(nextConfig)
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // J&T Red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
```

---

## TASK 3: Create Complete Folder Structure

Create all these folders and empty files:
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── (protected)/
│   ├── entry/page.tsx
│   ├── dashboard/page.tsx
│   ├── leaderboard/page.tsx
│   └── layout.tsx
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── signup/route.ts
│   │   ├── refresh/route.ts
│   │   └── change-password/route.ts
│   ├── entries/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── stats/route.ts
│   └── users/
│       └── [username]/stats/route.ts
├── layout.tsx
├── page.tsx
└── globals.css

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── types.ts (already exists - reference this)
├── repositories/
│   ├── user.repository.ts
│   └── entry.repository.ts
├── services/
│   ├── auth.service.ts
│   └── entry.service.ts
├── utils/
│   ├── jwt.ts
│   ├── helpers.ts
│   ├── constants.ts
│   ├── export.ts
│   ├── gps.ts          # ← NEW: GPS utilities
│   ├── barcode.ts      # ← NEW: Barcode scanner setup
│   └── watermark.ts    # ← NEW: Image watermark utilities
├── middleware/
│   └── auth.ts
├── schemas/
│   ├── auth.schema.ts
│   └── entry.schema.ts
└── types/
    ├── auth.ts
    ├── entry.ts
    └── api.ts

components/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── toast.tsx
├── forms/
│   └── entry-form.tsx
├── entry/                # ← NEW: Entry-specific components
│   ├── barcode-scanner.tsx
│   ├── photo-upload.tsx
│   └── location-display.tsx
├── tables/
│   └── entries-table.tsx
└── charts/
    └── stats-card.tsx

public/
├── manifest.json
├── icon-192.png (placeholder)
├── icon-512.png (placeholder)
└── sw.js (auto-generated)

middleware.ts (root)
```

---

## TASK 4: Generate Core Files

### 4.1 Supabase Clients

`lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

`lib/supabase/server.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 4.2 Type Definitions

`lib/types/auth.ts`:
```typescript
import type { Database } from '@/lib/supabase/types'

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  password: string
  email?: string
  full_name?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: Omit<User, 'password'>
    accessToken: string
    refreshToken: string
  }
  message?: string
}

export interface JWTPayload {
  id: number
  username: string
  role: string
}
```

`lib/types/entry.ts`:
```typescript
import type { Database } from '@/lib/supabase/types'

export type Entry = Database['public']['Tables']['entries']['Row']
export type EntryInsert = Database['public']['Tables']['entries']['Insert']
export type EntryUpdate = Database['public']['Tables']['entries']['Update']

export interface CreateEntryRequest {
  nama: string
  no_resi: string
  berat_resi: number
  berat_aktual: number
  foto_url_1: string
  foto_url_2?: string
  catatan?: string
  // Metadata stored in catatan or separate fields
  gps_lat?: number
  gps_lng?: number
  location?: string
  timestamp?: string
}

export interface EntryStats {
  totalEntries: number
  todayEntries: number
  avgSelisih: number
  totalPhotos: number
}

export interface GPSCoordinates {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface LocationInfo extends GPSCoordinates {
  address?: string
  city?: string
  country?: string
}
```

`lib/types/api.ts`:
```typescript
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

### 4.3 Constants

`lib/utils/constants.ts`:
```typescript
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export const ENTRY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export const EARNINGS_RATE = {
  MIN: 500,
  MAX: 1500,
} as const

export const USER_LEVELS = {
  BEGINNER: { min: 0, max: 99, name: 'Beginner', color: 'gray' },
  BRONZE: { min: 100, max: 499, name: 'Bronze', color: 'orange' },
  SILVER: { min: 500, max: 999, name: 'Silver', color: 'gray' },
  GOLD: { min: 1000, max: 4999, name: 'Gold', color: 'yellow' },
  DIAMOND: { min: 5000, max: Infinity, name: 'Diamond', color: 'blue' },
} as const

export const BARCODE_FORMATS = [
  'code_128',
  'ean',
  'ean_8',
  'code_39',
  'codabar',
  'upc',
  'upc_e',
] as const

export type Role = typeof ROLES[keyof typeof ROLES]
export type EntryStatus = typeof ENTRY_STATUS[keyof typeof ENTRY_STATUS]

export function getUserLevel(totalEntries: number) {
  for (const [key, level] of Object.entries(USER_LEVELS)) {
    if (totalEntries >= level.min && totalEntries <= level.max) {
      return level
    }
  }
  return USER_LEVELS.BEGINNER
}

export function calculateEarnings(selisih: number, totalEntries: number): number {
  const level = getUserLevel(totalEntries)
  const baseRate = EARNINGS_RATE.MIN
  const maxRate = EARNINGS_RATE.MAX
  
  // Accuracy bonus: smaller selisih = better
  const accuracyBonus = Math.abs(selisih) < 0.5 ? 1.5 : 1.0
  
  // Level-based rate
  let rate = baseRate
  if (level.name === 'BRONZE') rate = 700
  else if (level.name === 'SILVER') rate = 900
  else if (level.name === 'GOLD') rate = 1200
  else if (level.name === 'DIAMOND') rate = 1500
  
  return Math.round(rate * accuracyBonus)
}
```

### 4.4 NEW: GPS Utilities

`lib/utils/gps.ts`:
```typescript
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
```

### 4.5 NEW: Barcode Scanner Setup

`lib/utils/barcode.ts`:
```typescript
import Quagga from '@ericblade/quagga2'

export interface BarcodeConfig {
  inputStream: {
    type: string
    target: HTMLElement | string
    constraints: {
      width: number
      height: number
      facingMode: string
    }
  }
  decoder: {
    readers: string[]
  }
  locate: boolean
}

export function getDefaultBarcodeConfig(target: HTMLElement | string): BarcodeConfig {
  return {
    inputStream: {
      type: 'LiveStream',
      target,
      constraints: {
        width: { min: 640 },
        height: { min: 480 },
        facingMode: 'environment', // Use back camera
      },
    },
    decoder: {
      readers: [
        'code_128_reader',
        'ean_reader',
        'ean_8_reader',
        'code_39_reader',
        'codabar_reader',
        'upc_reader',
        'upc_e_reader',
      ],
    },
    locate: true,
  }
}

export async function initBarcodeScanner(
  targetElement: HTMLElement | string,
  onDetected: (code: string) => void,
  onError?: (error: any) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = getDefaultBarcodeConfig(targetElement)

    Quagga.init(config, (err) => {
      if (err) {
        console.error('Barcode scanner init error:', err)
        if (onError) onError(err)
        reject(err)
        return
      }

      Quagga.start()
      resolve()
    })

    // Listen for detected barcodes
    Quagga.onDetected((result) => {
      if (result.codeResult) {
        const code = result.codeResult.code
        if (code) {
          onDetected(code)
        }
      }
    })
  })
}

export function stopBarcodeScanner(): void {
  Quagga.stop()
}

export function validateJNTBarcode(code: string): boolean {
  // JNT barcode format validation
  // Typically: JNT + numbers, length 10-20 characters
  const jntPattern = /^[A-Z0-9]{10,20}$/
  return jntPattern.test(code)
}
```

### 4.6 NEW: Image Watermark Utilities

`lib/utils/watermark.ts`:
```typescript
import type { LocationInfo } from '@/lib/types/entry'

export interface WatermarkOptions {
  location: LocationInfo
  timestamp: Date
  text?: string
}

export async function addWatermarkToImage(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Draw watermark overlay
        drawWatermark(ctx, canvas.width, canvas.height, options)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.95 // Quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkOptions
): void {
  const padding = 20
  const lineHeight = 30
  const fontSize = 24

  // Semi-transparent overlay at bottom
  const overlayHeight = lineHeight * 4 + padding * 2
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight)

  // Text styling
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'left'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  let yPosition = height - overlayHeight + padding + fontSize

  // Draw timestamp
  const dateStr = options.timestamp.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = options.timestamp.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  ctx.fillText(`📅 ${dateStr} ${timeStr} WIB`, padding, yPosition)
  yPosition += lineHeight

  // Draw coordinates
  const coordsStr = `📍 ${options.location.latitude.toFixed(6)}, ${options.location.longitude.toFixed(6)}`
  ctx.fillText(coordsStr, padding, yPosition)
  yPosition += lineHeight

  // Draw location if available
  if (options.location.address) {
    ctx.font = `${fontSize - 4}px Arial`
    const maxWidth = width - padding * 2
    const locationText = truncateText(ctx, options.location.address, maxWidth)
    ctx.fillText(`🌍 ${locationText}`, padding, yPosition)
    yPosition += lineHeight
  }

  // Draw accuracy
  ctx.font = `${fontSize - 6}px Arial`
  ctx.fillText(`✓ Accuracy: ±${Math.round(options.location.accuracy)}m`, padding, yPosition)

  // Reset shadow
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const metrics = ctx.measureText(text)
  if (metrics.width <= maxWidth) {
    return text
  }

  let truncated = text
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }

  return truncated + '...'
}
```

### 4.7 Zod Schemas

`lib/schemas/auth.schema.ts`:
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  full_name: z.string().max(100, 'Nama maksimal 100 karakter').optional(),
})

export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Password lama wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
})
```

`lib/schemas/entry.schema.ts`:
```typescript
import { z } from 'zod'

export const createEntrySchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  no_resi: z.string().min(1, 'No Resi wajib diisi').max(50),
  berat_resi: z.number().positive('Berat resi harus positif'),
  berat_aktual: z.number().positive('Berat aktual harus positif'),
  foto_url_1: z.string().url('URL foto 1 tidak valid'),
  foto_url_2: z.string().url('URL foto 2 tidak valid').optional().or(z.literal('')),
  catatan: z.string().max(500).optional(),
})

export const updateEntrySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  catatan: z.string().max(500).optional(),
})
```

---

## TASK 5: Generate Utilities

`lib/utils/jwt.ts`:
```typescript
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/lib/types/auth'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
}
```

`lib/utils/helpers.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function calculateSelisih(beratResi: number, beratAktual: number): number {
  return Number((beratAktual - beratResi).toFixed(2))
}
```

`lib/utils/export.ts`:
```typescript
import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`)
}

export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${Date.now()}.csv`)
  link.click()
  URL.revokeObjectURL(url)
}
```

---

## TASK 6: Generate Repositories

`lib/repositories/user.repository.ts`:

Create a complete TypeScript class with these methods:
- `async create(userData)` - Create new user with bcrypt password hashing
- `async findByUsername(username)` - Find user by username
- `async findById(id)` - Find user by ID (exclude password in return)
- `async findAll(filter, limit, offset)` - Get all users with pagination
- `async update(id, updateData)` - Update user
- `async updateLastLogin(id)` - Update last_login timestamp
- `async count(filter)` - Count users

Use `supabaseAdmin` from `@/lib/supabase/server` and proper error handling.

`lib/repositories/entry.repository.ts`:

Create a complete TypeScript class with these methods:
- `async create(entryData)` - Create new entry
- `async findAll(filter, limit, offset)` - Get entries with filters (search, status)
- `async findById(id)` - Get entry by ID
- `async findByNoResi(noResi)` - Check if no_resi exists (duplicate check)
- `async findByUser(userId, limit, offset)` - Get user's entries
- `async update(id, updateData)` - Update entry (status, catatan)
- `async delete(id)` - Delete entry
- `async getStats()` - Get aggregate stats:
  - Total entries count
  - Today's entries count
  - Average selisih
  - **Total photos = total entries * 2** (each entry has 2 photos)
- `async getUserStats(username)` - Get user-specific stats from user_statistics table
- `async count(filter)` - Count entries

**IMPORTANT for getStats()**: Total photos should be calculated as `total_entries * 2` since each entry has 2 photos (foto_url_1 and foto_url_2).

---

## TASK 7: Generate Services

`lib/services/auth.service.ts`:

Create service class with:
- `async signup(data)` - Register new user, hash password with bcrypt, return tokens
- `async login(username, password)` - Verify credentials with bcrypt.compare, return tokens
- `async refreshToken(refreshToken)` - Verify refresh token, return new access token
- `async changePassword(userId, oldPassword, newPassword)` - Verify old password, hash and save new password

Use UserRepository and JWT utils. Include proper error handling. Never return password in responses.

`lib/services/entry.service.ts`:

Create service class with:
- `async create(data, userId)` - Create entry with auto selisih calculation
  - Calculate selisih = berat_aktual - berat_resi
  - Validate no_resi uniqueness
  - Save metadata (GPS, timestamp) in catatan or notes field
- `async getAll(filter, role, userId, page, limit)` - Get entries with pagination
  - Admin sees all entries
  - User sees only own entries
  - Support search (nama, no_resi)
  - Support status filter
- `async getById(id, role, userId)` - Get single entry with access control
- `async update(id, data, role, userId)` - Update entry
  - Admin can update any entry
  - User can only add catatan to own entries
- `async delete(id, role, userId)` - Delete entry (admin only)
- `async getStats()` - Get global stats with total photos calculation
- `async getUserStats(username)` - Get user-specific stats

Use EntryRepository and implement role-based access control.

---

## TASK 8: Generate Auth Middleware

`lib/middleware/auth.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/utils/jwt'
import type { JWTPayload } from '@/lib/types/auth'

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)
    return decoded
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function withAuth(
  handler: (request: NextRequest, context: { params: any; user: JWTPayload }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    return handler(request, { ...context, user })
  }
}

export function withAdmin(
  handler: (request: NextRequest, context: { params: any; user: JWTPayload }) => Promise<Response>
) {
  return async (request: NextRequest, context: { params: any }) => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    return handler(request, { ...context, user })
  }
}
```

---

## TASK 9: Generate API Routes

Generate ALL API routes with proper implementations:

### Auth Routes:
- `app/api/auth/login/route.ts` - POST (validate with loginSchema, call auth service, return tokens)
- `app/api/auth/signup/route.ts` - POST (validate with signupSchema, call auth service, return tokens)
- `app/api/auth/refresh/route.ts` - POST (refresh token endpoint, validate refresh token, return new access token)
- `app/api/auth/change-password/route.ts` - POST (with withAuth middleware, validate with changePasswordSchema)

### Entry Routes:
- `app/api/entries/route.ts`:
  - GET (list with filters: search, status, pagination) - use withAuth
  - POST (create new entry) - use withAuth, validate with createEntrySchema
- `app/api/entries/[id]/route.ts`:
  - GET (single entry) - use withAuth
  - PUT (update) - use withAuth, validate with updateEntrySchema
  - DELETE - use withAdmin
- `app/api/entries/stats/route.ts`:
  - GET (global stats: total entries, today entries, avg selisih, **total photos**)

### User Routes:
- `app/api/users/[username]/stats/route.ts` - GET (user-specific stats from user_statistics table)

All routes should:
- Use proper middleware (withAuth/withAdmin)
- Validate input with Zod schemas
- Handle errors with try-catch
- Return consistent API response format: `{ success: boolean, data?: any, message?: string }`
- Use NextResponse.json() for responses

---

## TASK 10: Generate Entry-Specific Components

### Barcode Scanner Component

`components/entry/barcode-scanner.tsx`:

Create a React component that:
- Shows camera preview for barcode scanning
- Uses Quagga2 library for scanning
- Supports multiple barcode formats (Code128, EAN, etc.)
- Shows visual feedback (red/green border) when scanning
- Props: `onScan(code: string)`, `onError(error: string)`
- Has start/stop controls
- Auto-validates JNT barcode format
- Clean up camera on unmount

Example structure:
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { initBarcodeScanner, stopBarcodeScanner, validateJNTBarcode } from '@/lib/utils/barcode'

interface Props {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export function BarcodeScanner({ onScan, onError }: Props) {
  // Implementation here
  // - Video element ref
  // - Scanner state (scanning, stopped, error)
  // - Start/stop functions
  // - Visual feedback overlay
}
```

### Photo Upload Component

`components/entry/photo-upload.tsx`:

Create a component that:
- Accepts 2 photo uploads (required: foto_url_1, optional: foto_url_2)
- Captures photo from camera OR select from gallery
- **Before upload**: Add GPS watermark using `addWatermarkToImage()`
- Upload directly to Cloudinary (unsigned upload preset)
- Show upload progress
- Show image preview after upload
- Return Cloudinary URLs
- Props: `onUpload(urls: { foto_url_1: string, foto_url_2?: string })`, `location: LocationInfo`

Implementation requirements:
1. Use `<input type="file" capture="environment" />` for camera
2. Before Cloudinary upload:
```tsx
   const watermarkedBlob = await addWatermarkToImage(file, {
     location: gpsLocation,
     timestamp: new Date(),
   })
```
3. Upload watermarked blob to Cloudinary
4. Show thumbnail previews

### Location Display Component

`components/entry/location-display.tsx`:

Create a component that:
- Auto-fetches GPS location on mount using `getCurrentLocation()`
- Shows loading state while fetching
- Displays: latitude, longitude, accuracy, address
- Shows map icon and formatted coordinates
- Props: `onLocationFetched(location: LocationInfo)`
- Handle permission denied gracefully

---

## TASK 11: Generate UI Components

### Basic UI Components:

`components/ui/button.tsx`:
- Modern button with variants (primary, secondary, danger, outline)
- Sizes (sm, md, lg)
- Loading state with spinner
- Disabled state
- Full Tailwind styling with J&T red primary color

`components/ui/input.tsx`:
- Input field with label
- Error message display
- Helper text support
- Proper TypeScript types
- Variants (text, password, number, email)

`components/ui/card.tsx`:
- Card wrapper component
- Optional header, body, footer sections
- Elevation shadows
- Border variants

`components/ui/badge.tsx`:
- Status badge component
- Variants for entry status (pending=yellow, approved=green, rejected=red)
- Size variants

`components/ui/toast.tsx`:
- Toast notification system (use React state)
- Types: success, error, warning, info
- Auto-dismiss after 3s
- Position: top-right
- Stack multiple toasts

### Form Components:

`components/forms/entry-form.tsx`:

Create a **COMPLETE** entry form component with:

**Required Fields:**
1. No Resi input with barcode scanner button
2. Nama input
3. Berat Resi (number)
4. Berat Aktual (number)
5. Selisih (auto-calculated, read-only, highlighted)
6. 2 Photo uploads with GPS watermark
7. Catatan (textarea, optional)

**Features:**
- Barcode scanner modal (opens when scan button clicked)
- Auto GPS location on mount
- Location display (always visible)
- Auto timestamp display
- Selisih auto-calculates when weights change
- Color-code selisih (green if <0.5kg, yellow if <1kg, red if >1kg)
- Photo watermark with GPS + timestamp before upload
- Upload progress indicators
- Form validation before submit
- Loading state during submission
- Success/error toasts

**State Management:**
```tsx
interface FormState {
  nama: string
  no_resi: string
  berat_resi: number
  berat_aktual: number
  selisih: number
  foto_url_1: string
  foto_url_2: string
  catatan: string
  gps_location: LocationInfo | null
  timestamp: Date
}
```

**Submit Flow:**
1. Validate all fields
2. Ensure both photos uploaded
3. POST to `/api/entries` with auth token
4. Show success toast
5. Reset form or redirect to dashboard

### Table Components:

`components/tables/entries-table.tsx`:

Data table showing entries with:
- Columns: No Resi, Nama, Berat Resi, Berat Aktual, Selisih, Status, Photos, Created At, Actions
- Photo thumbnails (clickable to view full size)
- Status badges (color-coded)
- Selisih color-coded
- Action buttons:
  - View (eye icon)
  - Edit status (admin only)
  - Delete (admin only, red)
- Pagination controls (prev, next, page numbers)
- Search bar (nama, no_resi)
- Filter dropdown (status: all, pending, approved, rejected)
- Export buttons (Excel, CSV)

Props:
```tsx
interface Props {
  entries: Entry[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onFilter: (status: string) => void
  onExport: (format: 'excel' | 'csv') => void
  isAdmin: boolean
}
```

### Stats Components:

`components/charts/stats-card.tsx`:

Stats display card showing:
- Icon (customizable)
- Title
- Large number value (formatted with commas)
- Subtitle/description
- Optional trend indicator (up/down arrow with %)
- Color variants (primary, success, warning, danger)
- Responsive grid layout

Example stats:
- Total Entries: 25,487 ↑ 12%
- Total Photos: 50,974
- Today's Entries: 234
- Avg Selisih: 0.34 kg

---

## TASK 12: Generate Pages

### Auth Pages:

`app/(auth)/login/page.tsx`:
- Professional login form using Input and Button components
- Username & password fields
- "Remember me" checkbox (save to localStorage)
- Link to signup page
- Error handling with toast
- Redirect to /entry on successful login
- Loading state during auth
- Save tokens to localStorage
- Modern gradient background (red/white J&T theme)

`app/(auth)/signup/page.tsx`:
- Registration form (username, email, full_name, password, confirm password)
- Real-time username availability check (debounced)
- Password strength indicator (weak/medium/strong)
- Show password toggle
- Terms & conditions checkbox
- Error handling with field-specific errors
- Success redirect to /entry
- Link back to login

`app/(auth)/layout.tsx`:
- Clean auth layout with centered card
- J&T branding (logo/text)
- Red/white gradient background
- Animated entry (fade-in)
- Responsive (mobile-optimized)

### Protected Pages:

`app/(protected)/entry/page.tsx`:
- Page title: "Entry Baru"
- EntryForm component (main)
- Sidebar showing:
  - User stats card (total entries, total earnings, level badge)
  - Today's progress (entries today, earnings today)
  - Quick tips
- Check auth on mount, redirect to /login if not authenticated
- Show loading skeleton while checking auth

`app/(protected)/dashboard/page.tsx`:
- Page title: "Dashboard"
- Stats cards row:
  - Total Entries: **Show real count from database (25K+)**
  - Total Photos: **Show real count (50K+)** = entries * 2
  - Today's Entries
  - Avg Selisih
- EntriesTable component
- Search & filter controls
- Export buttons (Excel, CSV) - admin only
- Pagination
- Check admin role, show limited view for regular users

`app/(protected)/leaderboard/page.tsx`:
- Page title: "Leaderboard"
- Tabs: "Today" and "All Time"
- Top performers list:
  - Rank badge (#1 gold, #2 silver, #3 bronze)
  - Username
  - User level badge
  - Total entries / Today's entries
  - Total earnings
  - Avatar placeholder
- Current user's rank highlighted
- Animated list items (stagger effect)

`app/(protected)/layout.tsx`:
- Protected layout with navigation
- Sidebar:
  - App logo/title
  - Menu items:
    - Entry (+ icon)
    - Dashboard (📊 icon)
    - Leaderboard (🏆 icon)
    - Logout (power icon)
  - User info at bottom (username, role badge)
- Mobile: Bottom navigation bar
- Desktop: Persistent sidebar
- Check auth on mount:
```tsx
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
    }
  }, [])
```

### Root Pages:

`app/page.tsx`:
- Landing page
- Hero section:
  - Main headline: "Sistem Entry Berat J&T Express"
  - Subheadline: "Track weight discrepancies with precision"
  - CTA buttons: "Mulai Entry" (to /entry), "Login"
  - Hero image/illustration
- Features section (3 columns):
  - ⚡ Fast Entry
  - 📸 Photo Documentation
  - 💰 Earn Rewards
- Stats showcase (if not logged in):
  - "25,000+ entries processed"
  - "50,000+ photos documented"
  - "Trusted by 19+ users"
- Auto-redirect logic:
```tsx
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      router.push('/entry')
    }
  }, [])
```

`app/layout.tsx`:
- Root layout
- Metadata:
```tsx
  export const metadata = {
    title: 'Weight Entry App - J&T Express',
    description: 'Professional weight tracking for logistics operations',
    manifest: '/manifest.json',
    themeColor: '#dc2626',
  }
```
- Font optimization (use next/font)
- Global CSS import
- Toast provider wrapper
- PWA meta tags

---

## TASK 13: Generate PWA Files

`public/manifest.json`:
```json
{
  "name": "Weight Entry App - J&T Express",
  "short_name": "WeightApp",
  "description": "Professional weight tracking for logistics operations with 25,000+ entries",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc2626",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Create placeholder icon files (simple red square with "W" for now - user can replace).

---

## TASK 14: Generate Root Middleware

`middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need auth
  const publicPaths = ['/', '/login', '/signup']
  const isPublicPath = publicPaths.some(path => pathname === path)

  // API routes and static files - skip
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/manifest')
  ) {
    return NextResponse.next()
  }

  // For protected routes, auth check happens on client side via useEffect
  // This middleware is mainly for server-side routing rules
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
}
```

---

## TASK 15: Update Global Styles

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 84.2% 60.2%;
    --primary-foreground: 0 0% 98%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
}

@layer utilities {
  .animate-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #fee2e2 0%, #ffffff 50%, #fecaca 100%);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-lg hover:bg-gray-400;
}

/* Barcode scanner overlay */
.barcode-scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.barcode-scanner-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: #dc2626;
  box-shadow: 0 0 10px #dc2626;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0%, 100% {
    top: 0;
  }
  50% {
    top: 100%;
  }
}

/* Photo upload preview */
.photo-preview {
  @apply relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-200;
}

.photo-preview img {
  @apply object-cover w-full h-full;
}

/* Loading skeleton */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
```

---

## SUCCESS CRITERIA

After all tasks:
✅ Complete folder structure created
✅ All utilities generated (JWT, GPS, Barcode, Watermark, Export)
✅ Types and schemas defined
✅ Repositories with full CRUD + stats
✅ Services with business logic
✅ All API routes implemented with auth middleware
✅ Entry form with barcode scanner, GPS, photo watermark
✅ Dashboard showing real 25K+ entries, 50K+ photos
✅ UI components (Button, Input, Card, Badge, Toast)
✅ All pages (Login, Signup, Entry, Dashboard, Leaderboard)
✅ PWA configured and installable
✅ Root middleware for auth routing
✅ TypeScript strict mode with no errors

## FINAL VERIFICATION STEPS

1. Review all generated files
2. Test TypeScript compilation: `npm run build`
3. Test development server: `npm run dev`
4. User fills `.env.local` with actual values:
   - Supabase URL & keys
   - JWT secrets (min 32 chars each)
   - Cloudinary cloud name, upload preset, API key
5. Test features:
   - Login/Signup
   - Barcode scanning (needs camera permission)
   - GPS location (needs location permission)
   - Photo upload with watermark
   - Entry creation
   - Dashboard stats (should show 25K+ entries)
   - Export to Excel/CSV

## CRITICAL IMPLEMENTATION NOTES

1. **Dashboard Stats**: Use real database counts, not hardcoded values
2. **Barcode Scanner**: Requires HTTPS for camera access (use localhost for dev)
3. **GPS Watermark**: Canvas-based, works in browser, no server processing
4. **Direct Cloudinary Upload**: Use unsigned preset to avoid bandwidth costs
5. **TypeScript Strict**: All files must have proper types, no `any` unless necessary
6. **Mobile-First**: All components responsive, test on mobile viewport
7. **Error Handling**: Every async operation wrapped in try-catch
8. **Loading States**: Every data fetch shows loading indicator
9. **Auth Flow**: Tokens in localStorage, check on protected routes
10. **PWA**: Test install prompt, offline caching, manifest

---

**EXECUTE ALL TASKS NOW. Generate complete, production-ready code with ALL features.**
