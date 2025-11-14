import { supabaseAdmin } from '@/lib/supabase/server'
import type { Entry, EntryInsert, EntryUpdate, EntryStats } from '@/lib/types/entry'

export class EntryRepository {
  async create(entryData: EntryInsert): Promise<Entry> {
    const { data, error } = await supabaseAdmin
      .from('entries')
      .insert({
        ...entryData,
        status: 'submitted',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating entry:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findAll(
    filter?: { search?: string; status?: string; created_by?: string },
    limit: number = 50,
    offset: number = 0
  ): Promise<Entry[]> {
    let query = supabaseAdmin
      .from('entries')
      .select('*')
      .range(offset, offset + limit - 1)

    if (filter?.search) {
      query = query.or(`nama.ilike.%${filter.search}%,no_resi.ilike.%${filter.search}%`)
    }

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }

    if (filter?.created_by) {
      query = query.eq('created_by', filter.created_by)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error finding all entries:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  async findById(id: number): Promise<Entry | null> {
    const { data, error } = await supabaseAdmin
      .from('entries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error finding entry by id:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findByNoResi(noResi: string): Promise<Entry | null> {
    const { data, error } = await supabaseAdmin
      .from('entries')
      .select('*')
      .eq('no_resi', noResi)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error finding entry by no_resi:', error)
      throw new Error(error.message)
    }

    return data
  }

  async findByUser(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Entry[]> {
    const { data, error } = await supabaseAdmin
      .from('entries')
      .select('*')
      .eq('created_by', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error finding entries by user:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  async update(id: number, updateData: EntryUpdate): Promise<Entry> {
    const { data, error } = await supabaseAdmin
      .from('entries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating entry:', error)
      throw new Error(error.message)
    }

    return data
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error)
      throw new Error(error.message)
    }
  }

  async getStats(): Promise<EntryStats> {
    // Get total entries count
    const { count: totalEntries, error: totalError } = await supabaseAdmin
      .from('entries')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error getting total entries:', totalError)
      throw new Error(totalError.message)
    }

    // Get today's entries count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const { count: todayEntries, error: todayError } = await supabaseAdmin
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO)

    if (todayError) {
      console.error('Error getting today entries:', todayError)
      throw new Error(todayError.message)
    }

    // Get average selisih
    const { data: avgData, error: avgError } = await supabaseAdmin
      .from('entries')
      .select('selisih')

    if (avgError) {
      console.error('Error getting average selisih:', avgError)
      throw new Error(avgError.message)
    }

    const avgSelisih = avgData && avgData.length > 0
      ? avgData.reduce((sum, entry) => sum + entry.selisih, 0) / avgData.length
      : 0

    // Total photos = total entries * 2 (each entry has 2 photos)
    const totalPhotos = (totalEntries || 0) * 2

    return {
      totalEntries: totalEntries || 0,
      todayEntries: todayEntries || 0,
      avgSelisih: Number(avgSelisih.toFixed(2)),
      totalPhotos,
    }
  }

  async getUserStats(username: string): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('user_statistics')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No stats yet, return default
        return {
          username,
          total_entries: 0,
          total_earnings: 0,
          daily_entries: 0,
          daily_earnings: 0,
          avg_selisih: 0,
        }
      }
      console.error('Error getting user stats:', error)
      throw new Error(error.message)
    }

    return data
  }

  async count(filter?: { search?: string; status?: string; created_by?: string }): Promise<number> {
    let query = supabaseAdmin
      .from('entries')
      .select('*', { count: 'exact', head: true })

    if (filter?.search) {
      query = query.or(`nama.ilike.%${filter.search}%,no_resi.ilike.%${filter.search}%`)
    }

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }

    if (filter?.created_by) {
      query = query.eq('created_by', filter.created_by)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting entries:', error)
      throw new Error(error.message)
    }

    return count || 0
  }
}

export const entryRepository = new EntryRepository()
