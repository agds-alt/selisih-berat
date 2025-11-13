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
