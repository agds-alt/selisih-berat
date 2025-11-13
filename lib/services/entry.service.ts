import { entryRepository } from '@/lib/repositories/entry.repository'
import type { CreateEntryRequest, Entry, EntryStats } from '@/lib/types/entry'
import type { APIResponse, PaginatedResponse } from '@/lib/types/api'
import { calculateSelisih } from '@/lib/utils/helpers'
import { calculateEarnings } from '@/lib/utils/constants'

export class EntryService {
  async create(
    data: CreateEntryRequest,
    userId: string
  ): Promise<APIResponse<Entry>> {
    try {
      // Check if no_resi already exists
      const existingEntry = await entryRepository.findByNoResi(data.no_resi)
      if (existingEntry) {
        return {
          success: false,
          message: 'Nomor resi sudah pernah diinput',
        }
      }

      // Calculate selisih
      const selisih = calculateSelisih(data.berat_resi, data.berat_aktual)

      // Create entry
      const entry = await entryRepository.create({
        nama: data.nama,
        no_resi: data.no_resi,
        berat_resi: data.berat_resi,
        berat_aktual: data.berat_aktual,
        selisih,
        foto_url_1: data.foto_url_1,
        foto_url_2: data.foto_url_2 || null,
        catatan: data.catatan || null,
        created_by: userId,
      })

      return {
        success: true,
        data: entry,
        message: 'Entry berhasil dibuat',
      }
    } catch (error: any) {
      console.error('Create entry error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat membuat entry',
      }
    }
  }

  async getAll(
    filter?: { search?: string; status?: string; created_by?: string },
    role?: string,
    userId?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Entry>> {
    try {
      const offset = (page - 1) * limit

      // If user role, only show their entries
      const actualFilter = {
        ...filter,
        created_by: role === 'user' ? userId : filter?.created_by,
      }

      const entries = await entryRepository.findAll(actualFilter, limit, offset)
      const total = await entryRepository.count(actualFilter)
      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: entries,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      }
    } catch (error: any) {
      console.error('Get all entries error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengambil data entries',
      }
    }
  }

  async getById(
    id: number,
    role?: string,
    userId?: string
  ): Promise<APIResponse<Entry>> {
    try {
      const entry = await entryRepository.findById(id)

      if (!entry) {
        return {
          success: false,
          message: 'Entry tidak ditemukan',
        }
      }

      // Check access control
      if (role === 'user' && entry.created_by !== userId) {
        return {
          success: false,
          message: 'Anda tidak memiliki akses ke entry ini',
        }
      }

      return {
        success: true,
        data: entry,
      }
    } catch (error: any) {
      console.error('Get entry by id error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengambil data entry',
      }
    }
  }

  async update(
    id: number,
    data: { status?: string; catatan?: string },
    role?: string,
    userId?: string
  ): Promise<APIResponse<Entry>> {
    try {
      const entry = await entryRepository.findById(id)

      if (!entry) {
        return {
          success: false,
          message: 'Entry tidak ditemukan',
        }
      }

      // Access control
      if (role === 'user') {
        // User can only add catatan to own entries
        if (entry.created_by !== userId) {
          return {
            success: false,
            message: 'Anda tidak memiliki akses ke entry ini',
          }
        }
        // User cannot change status
        if (data.status) {
          return {
            success: false,
            message: 'Anda tidak memiliki akses untuk mengubah status',
          }
        }
      }

      const updatedEntry = await entryRepository.update(id, {
        status: data.status,
        catatan: data.catatan,
        updated_by: userId || null,
      })

      return {
        success: true,
        data: updatedEntry,
        message: 'Entry berhasil diupdate',
      }
    } catch (error: any) {
      console.error('Update entry error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengupdate entry',
      }
    }
  }

  async delete(
    id: number,
    role?: string,
    userId?: string
  ): Promise<APIResponse<null>> {
    try {
      // Only admin can delete
      if (role !== 'admin') {
        return {
          success: false,
          message: 'Hanya admin yang dapat menghapus entry',
        }
      }

      const entry = await entryRepository.findById(id)
      if (!entry) {
        return {
          success: false,
          message: 'Entry tidak ditemukan',
        }
      }

      await entryRepository.delete(id)

      return {
        success: true,
        data: null,
        message: 'Entry berhasil dihapus',
      }
    } catch (error: any) {
      console.error('Delete entry error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat menghapus entry',
      }
    }
  }

  async getStats(): Promise<APIResponse<EntryStats>> {
    try {
      const stats = await entryRepository.getStats()
      return {
        success: true,
        data: stats,
      }
    } catch (error: any) {
      console.error('Get stats error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengambil statistik',
      }
    }
  }

  async getUserStats(username: string): Promise<APIResponse<any>> {
    try {
      const stats = await entryRepository.getUserStats(username)
      return {
        success: true,
        data: stats,
      }
    } catch (error: any) {
      console.error('Get user stats error:', error)
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat mengambil statistik user',
      }
    }
  }
}

export const entryService = new EntryService()
