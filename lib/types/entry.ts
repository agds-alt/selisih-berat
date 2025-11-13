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
