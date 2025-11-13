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
