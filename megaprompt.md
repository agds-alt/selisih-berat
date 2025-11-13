# Complete Next.js 14 Weight Entry App - Full Stack Generation

## Context
I have a Supabase database with types already defined in `database.types.ts`. I need to build a complete Next.js 14 App Router application from scratch for a weight tracking system (logistics/J&T Express).

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

---

## TASK 1: Initialize & Install Dependencies
```bash
# Already initialized, just install packages
npm install @supabase/supabase-js zod bcryptjs jsonwebtoken jose
npm install xlsx papaparse
npm install -D @types/bcryptjs @types/jsonwebtoken @types/papaparse
npm install next-pwa
```

---

## TASK 2: Setup Environment & Config

Create `.env.local`(PERBAIKI PENULISAN .ENV KARENA INI DIAMBIL DARI PROJECT EXPRESSJS) SESUAIKAN DENGAN NEXTJS:
```env 
==================== SERVER CONFIGURATION ====================

NODE_ENV=production PORT=3000



==================== CLOUDINARY CONFIGURATION ====================
GOOGLE_PROJECT_ID=1RVHdOROo6o0dK5YoO8b2KyxnRwbQ24Fcv6oFL1e8q74 
GOOGLE_PRIVATE_KEY_ID=5f4695ab9660de02db6777e73d7dd21eff2e8eef 
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9YtKQltoMWjJz\nvRtznlV5dUwD8cJmDr5c7g7c5SFGWpU7w851FZm7j9pceRxqhOyLpKONdiLpa3hv\n4KZkhVU+LTe8drdzNRFF20qVnu/a5Gi3/CA5sLEdl0oDq/z9El7CojBwy1TgPFF2\nOP30zEBc8hvt3jzt7J9Ln5kWgaKHUJXDx2eOVavgROPSSJ4dTqwd7FlxPi+87SoL\nU45fqmKLqFBzsWTecKMISifX7DkSA4kV+wj4tQVCucWVGtdE8b/VjJMxz3JIsPsu\nFZNIOC0NkYQ+tehCy703Hz8645xfv/TRQjqWp0S9TvS4RBYaGAnxNeh1NtEyrXXw\nGRToSC3JAgMBAAECggEAASO4FUtNvTyfCG0/M186L8SR6YV/NZ1UbeYMzC12GXXw\nEe+oArJXk3ZWdQSm3sk1TH3NciDKLadfjnob5jJF2ghBnpkEROWGg2oXX8vDW7N7\ndyfwNbNSItXHNJBzXD52YtYWU9zAAlK6lsCEXqsKnsSM1c3m20j3iGf0bts8KXOY\nW7GxpbMb/v5ZnK2j1PLdq/4pyI2BY0uHSON+dDdYnhJR2dbvkQPShvwSBvdsBBZb\nuFX+23uZVEQOxTFEUSrbKPMFld6eLxT/7suZtBULwq+buKDhzORobMYQUr4Zhb/4\n+mMbG1mTJC9BHCMISgNgWg7Lzr51IiFgR1I2Nm1lpQKBgQDo3WoMTansSDTRyM+K\nI39e9MLRnoLzRRS/t+DGlE5OhkyawG6SIb3Ft/IBWRbHg4UykYUTXA/tdX0eCcgv\np5QB1fyeE/XRs+aaNw8+M9hZ1lnXZm8qDA9scnhp67e1vboUyMfZ3rRcy4X6yF3c\nbqOPi3WvbcnSmwcbodw9e5vSNwKBgQDQM5XU1Gm6VWdRo9F4b4K54oHADg25BvB9\n9sHCkpOVltGykTVb906JQoohforMHRLppp67vT3GvWexxNxi82FswjQS1XDa/MJc\nxR+LK0JHz/jfHLMY0K0tl/kAf5YyeF6PFTDqDWqwRQ7l/agPAnK59Aud8/5+iQlq\nFTkIWTv//wKBgF6p8/yAbf2B9Qb7TXNortTZR4GToMRoZuDxTU0s6RB/BBE8/TYm\nxVDlUFo/70S4MKO4CJMwL8Fmq7BUZa8Jvt9oMEPK9XmEWtCCZY3x4ZfTzb4FBFfh\ngzug5VaZ3prhQA5G+QeWw1ed3R9v6Mg9qfwmw3bHeO5G24LeL/xGjbfNAoGBAMXm\nIqc4eH7rKtgJFNSbefDigl5hfV3AYNv6rtYZqTrpLs3DBKsz+Wyy2MVZmOjHQfDh\ntcPR72R3KJdq/ej4WkScnA7C3xDobH7tyDvqlIfaAT9h8kLGJ7ZM3BxDKiszCv6K\nMAJpWl3OZojqgNIzi4WBmYE8KU1xSIeTQLDU0RlVAoGBAMImXpMmLFyVQb6GDoRX\noLB3wc2K5fPxPdV2IsHaDO/g8ZXN8R3at3p0eoRh3iC1c3UJ/kvPojbR3I6GJCdO\n6CnlglepHqG3lVEI6zGGMrlr65u55AJ06I+0E5Xw9tsslU6VVVn1Mk0f79zczXMZ\n2ExnElUOxnQwPjF8zIXPd9nK\n-----END PRIVATE KEY-----\n" 
GOOGLE_CLIENT_EMAIL=sheet-for-pict-jnt@entry-data-apps.iam.gserviceaccount.com 
GOOGLE_CLIENT_ID=106499173174858269676 
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/sheet-for-pict-jnt%40entry-data-apps.iam.gserviceaccount.com 
SPREADSHEET_ID=1RVHdOROo6o0dK5YoO8b2KyxnRwbQ24Fcv6oFL1e8q74

CLOUDINARY_CLOUD_NAME=dl6xk437w
CLOUDINARY_UPLOAD_PRESET=selisih_berat
CLOUDINARY_FOLDER=selisih_berat


==================== GOOGLE SHEETS API CONFIGURATION ====================

GOOGLE_PROJECT_ID=1RVHdOROo6o0dK5YoO8b2KyxnRwbQ24Fcv6oFL1e8q74 
GOOGLE_PRIVATE_KEY_ID=5f4695ab9660de02db6777e73d7dd21eff2e8eef 
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9YtKQltoMWjJz\nvRtznlV5dUwD8cJmDr5c7g7c5SFGWpU7w851FZm7j9pceRxqhOyLpKONdiLpa3hv\n4KZkhVU+LTe8drdzNRFF20qVnu/a5Gi3/CA5sLEdl0oDq/z9El7CojBwy1TgPFF2\nOP30zEBc8hvt3jzt7J9Ln5kWgaKHUJXDx2eOVavgROPSSJ4dTqwd7FlxPi+87SoL\nU45fqmKLqFBzsWTecKMISifX7DkSA4kV+wj4tQVCucWVGtdE8b/VjJMxz3JIsPsu\nFZNIOC0NkYQ+tehCy703Hz8645xfv/TRQjqWp0S9TvS4RBYaGAnxNeh1NtEyrXXw\nGRToSC3JAgMBAAECggEAASO4FUtNvTyfCG0/M186L8SR6YV/NZ1UbeYMzC12GXXw\nEe+oArJXk3ZWdQSm3sk1TH3NciDKLadfjnob5jJF2ghBnpkEROWGg2oXX8vDW7N7\ndyfwNbNSItXHNJBzXD52YtYWU9zAAlK6lsCEXqsKnsSM1c3m20j3iGf0bts8KXOY\nW7GxpbMb/v5ZnK2j1PLdq/4pyI2BY0uHSON+dDdYnhJR2dbvkQPShvwSBvdsBBZb\nuFX+23uZVEQOxTFEUSrbKPMFld6eLxT/7suZtBULwq+buKDhzORobMYQUr4Zhb/4\n+mMbG1mTJC9BHCMISgNgWg7Lzr51IiFgR1I2Nm1lpQKBgQDo3WoMTansSDTRyM+K\nI39e9MLRnoLzRRS/t+DGlE5OhkyawG6SIb3Ft/IBWRbHg4UykYUTXA/tdX0eCcgv\np5QB1fyeE/XRs+aaNw8+M9hZ1lnXZm8qDA9scnhp67e1vboUyMfZ3rRcy4X6yF3c\nbqOPi3WvbcnSmwcbodw9e5vSNwKBgQDQM5XU1Gm6VWdRo9F4b4K54oHADg25BvB9\n9sHCkpOVltGykTVb906JQoohforMHRLppp67vT3GvWexxNxi82FswjQS1XDa/MJc\nxR+LK0JHz/jfHLMY0K0tl/kAf5YyeF6PFTDqDWqwRQ7l/agPAnK59Aud8/5+iQlq\nFTkIWTv//wKBgF6p8/yAbf2B9Qb7TXNortTZR4GToMRoZuDxTU0s6RB/BBE8/TYm\nxVDlUFo/70S4MKO4CJMwL8Fmq7BUZa8Jvt9oMEPK9XmEWtCCZY3x4ZfTzb4FBFfh\ngzug5VaZ3prhQA5G+QeWw1ed3R9v6Mg9qfwmw3bHeO5G24LeL/xGjbfNAoGBAMXm\nIqc4eH7rKtgJFNSbefDigl5hfV3AYNv6rtYZqTrpLs3DBKsz+Wyy2MVZmOjHQfDh\ntcPR72R3KJdq/ej4WkScnA7C3xDobH7tyDvqlIfaAT9h8kLGJ7ZM3BxDKiszCv6K\nMAJpWl3OZojqgNIzi4WBmYE8KU1xSIeTQLDU0RlVAoGBAMImXpMmLFyVQb6GDoRX\noLB3wc2K5fPxPdV2IsHaDO/g8ZXN8R3at3p0eoRh3iC1c3UJ/kvPojbR3I6GJCdO\n6CnlglepHqG3lVEI6zGGMrlr65u55AJ06I+0E5Xw9tsslU6VVVn1Mk0f79zczXMZ\n2ExnElUOxnQwPjF8zIXPd9nK\n-----END PRIVATE KEY-----\n" 
GOOGLE_CLIENT_EMAIL=sheet-for-pict-jnt@entry-data-apps.iam.gserviceaccount.com 
GOOGLE_CLIENT_ID=106499173174858269676 
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/sheet-for-pict-jnt%40entry-data-apps.iam.gserviceaccount.com 
SPREADSHEET_ID=1RVHdOROo6o0dK5YoO8b2KyxnRwbQ24Fcv6oFL1e8q74
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
│   └── export.ts
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
}

export interface EntryStats {
  totalEntries: number
  todayEntries: number
  avgSelisih: number
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
  // More entries = higher rate
  const level = getUserLevel(totalEntries)
  const baseRate = EARNINGS_RATE.MIN
  const maxRate = EARNINGS_RATE.MAX
  
  // Calculate rate based on accuracy (smaller selisih = better)
  const accuracyBonus = Math.abs(selisih) < 0.5 ? 1.5 : 1.0
  
  // Calculate rate based on level
  let rate = baseRate
  if (level.name === 'BRONZE') rate = 700
  else if (level.name === 'SILVER') rate = 900
  else if (level.name === 'GOLD') rate = 1200
  else if (level.name === 'DIAMOND') rate = 1500
  
  return Math.round(rate * accuracyBonus)
}
```

### 4.4 Zod Schemas

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
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.click()
}
```

---

## TASK 6: Generate Repositories

`lib/repositories/user.repository.ts`:

Create a complete TypeScript class with these methods:
- `async create(userData)` - Create new user with bcrypt password hashing
- `async findByUsername(username)` - Find user by username
- `async findById(id)` - Find user by ID
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
- `async findByNoResi(noResi)` - Check if no_resi exists
- `async findByUser(userId, limit, offset)` - Get user's entries
- `async update(id, updateData)` - Update entry (status, catatan)
- `async delete(id)` - Delete entry
- `async getStats()` - Get aggregate stats (total entries, today entries, avg selisih)
- `async getUserStats(username)` - Get user-specific stats
- `async count(filter)` - Count entries

---

## TASK 7: Generate Services

`lib/services/auth.service.ts`:

Create service class with:
- `async signup(data)` - Register new user, hash password, return tokens
- `async login(username, password)` - Verify credentials, return tokens
- `async refreshToken(refreshToken)` - Verify refresh token, return new access token
- `async changePassword(userId, oldPassword, newPassword)` - Change password

Use UserRepository and JWT utils. Include proper error handling.

`lib/services/entry.service.ts`:

Create service class with:
- `async create(data, userId)` - Create entry with auto selisih calculation
- `async getAll(filter, role, userId, page, limit)` - Get entries (admin sees all, user sees own)
- `async getById(id, role, userId)` - Get single entry with access control
- `async update(id, data, role, userId)` - Update entry with access control
- `async delete(id, role, userId)` - Delete entry (admin only)
- `async getStats()` - Get global stats
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
        { success: false, message: 'Unauthorized' },
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
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Admin only' },
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
- `app/api/auth/login/route.ts` - POST (validate with loginSchema, call auth service)
- `app/api/auth/signup/route.ts` - POST (validate with signupSchema, call auth service)
- `app/api/auth/refresh/route.ts` - POST (refresh token endpoint)
- `app/api/auth/change-password/route.ts` - POST (with withAuth middleware)

### Entry Routes:
- `app/api/entries/route.ts` - GET (list with filters), POST (create new)
- `app/api/entries/[id]/route.ts` - GET (single), PUT (update), DELETE
- `app/api/entries/stats/route.ts` - GET (global stats)

### User Routes:
- `app/api/users/[username]/stats/route.ts` - GET (user-specific stats)

All routes should:
- Use proper middleware (withAuth/withAdmin)
- Validate with Zod schemas
- Handle errors properly
- Return consistent API response format

---

## TASK 10: Generate UI Components

### Basic UI Components:

`components/ui/button.tsx` - Modern button with variants (primary, secondary, danger), sizes, loading state

`components/ui/input.tsx` - Input field with label, error display, proper styling

`components/ui/card.tsx` - Card wrapper component

`components/ui/badge.tsx` - Status badge component

`components/ui/toast.tsx` - Toast notification system (you can use a simple implementation)

### Form Components:

`components/forms/entry-form.tsx`:
Create a complete entry form with:
- Name input
- No Resi input (with duplicate check)
- Berat Resi & Berat Aktual inputs
- Auto-calculate and display Selisih
- Cloudinary upload widget integration for 2 photos
- Image previews
- Catatan textarea
- Submit with loading state
- Error handling

### Table Components:

`components/tables/entries-table.tsx`:
Data table showing entries with:
- Columns: No Resi, Nama, Berat Resi, Berat Aktual, Selisih, Status, Created At, Actions
- Status badges (color-coded)
- Action buttons (View, Edit, Delete for admin)
- Pagination
- Search & filter

### Stats Components:

`components/charts/stats-card.tsx`:
Stats display card showing:
- Title, value, icon
- Trend indicator (up/down)
- Color variants

---

## TASK 11: Generate Pages

### Auth Pages:

`app/(auth)/login/page.tsx`:
- Professional login form
- Username & password fields
- Remember me checkbox
- Link to signup
- Error handling
- Redirect to /entry on success

`app/(auth)/signup/page.tsx`:
- Registration form (username, email, full_name, password, confirm password)
- Real-time username availability check
- Password strength indicator
- Error handling
- Redirect to /entry on success

`app/(auth)/layout.tsx`:
- Clean auth layout with J&T branding
- Centered form card
- Red/white gradient background

### Protected Pages:

`app/(protected)/entry/page.tsx`:
- Entry form page
- Use EntryForm component
- Show user stats sidebar (total entries, earnings, level)

`app/(protected)/dashboard/page.tsx`:
- Admin dashboard with stats cards
- Entries table with search/filter
- Export buttons (Excel/CSV)
- Charts (optional)

`app/(protected)/leaderboard/page.tsx`:
- Top performers leaderboard
- Daily & all-time rankings
- User avatars, levels, stats

`app/(protected)/layout.tsx`:
- Protected layout with navigation
- Sidebar (Entry, Dashboard, Leaderboard, Logout)
- Header with user info
- Check auth on mount, redirect to login if not authenticated

### Root Pages:

`app/page.tsx`:
- Landing page
- Hero section with CTA
- Features showcase
- Redirect to /entry if logged in, /login if not

`app/layout.tsx`:
- Root layout with metadata
- PWA manifest link
- Font optimization
- Global CSS

---

## TASK 12: Generate PWA Files

`public/manifest.json`:
```json
{
  "name": "Weight Entry App - J&T Express",
  "short_name": "WeightApp",
  "description": "Professional weight tracking for logistics operations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#dc2626",
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

Create placeholder icon files (can be simple colored squares for now).

---

## TASK 13: Generate Root Middleware

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
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/icon')) {
    return NextResponse.next()
  }

  // For protected routes, we'll check auth on client side
  // This middleware just handles basic redirects
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## TASK 14: Update Global Styles

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

@layer utilities {
  .animate-in {
    animation: fadeIn 0.3s ease-in-out;
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
  @apply bg-gray-300 rounded-lg;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
```

---

## SUCCESS CRITERIA

After all tasks:
✅ Complete folder structure created
✅ All utilities, types, schemas generated
✅ Repositories with full CRUD operations
✅ Services with business logic
✅ All API routes implemented
✅ Auth system with JWT
✅ UI components (Button, Input, Card, etc.)
✅ All pages (Login, Signup, Entry, Dashboard, Leaderboard)
✅ PWA configured
✅ Middleware for auth
✅ TypeScript strict mode with no errors

## FINAL STEPS

1. Review all generated files
2. Test compilation: `npm run build`
3. Test development: `npm run dev`
4. User needs to fill `.env.local` with actual values
5. User needs to create icon images (or use placeholders)

## NOTES

- All TypeScript files should have proper types
- Use `'use client'` directive for client components
- Use `'use server'` for server actions if needed
- Follow Next.js 14 App Router conventions
- Implement proper error boundaries
- Add loading states to all async operations
- Use Tailwind for all styling
- Keep J&T branding (red #dc2626) throughout

---

**EXECUTE ALL TASKS NOW. Generate complete, production-ready code.**
