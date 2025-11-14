import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Entry } from '@/lib/types/entry'

// Query keys for cache management
export const entriesKeys = {
  all: ['entries'] as const,
  lists: () => [...entriesKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...entriesKeys.lists(), filters] as const,
  details: () => [...entriesKeys.all, 'detail'] as const,
  detail: (id: number) => [...entriesKeys.details(), id] as const,
}

interface EntriesResponse {
  success: boolean
  data: Entry[]
  message?: string
}

interface EntriesQueryParams {
  user_id?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

/**
 * Fetch entries with optional filters
 */
export function useEntries(params?: EntriesQueryParams) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useQuery({
    queryKey: entriesKeys.list(params),
    queryFn: async (): Promise<Entry[]> => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value))
          }
        })
      }

      const response = await fetch(`/api/entries?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }

      const data: EntriesResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch entries')
      }

      return data.data || []
    },
    enabled: !!token,
  })
}

/**
 * Fetch single entry by ID
 */
export function useEntry(id: number) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useQuery({
    queryKey: entriesKeys.detail(id),
    queryFn: async (): Promise<Entry> => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch entry')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch entry')
      }

      return data.data
    },
    enabled: !!token && !!id,
  })
}

/**
 * Create new entry mutation
 */
export function useCreateEntry() {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useMutation({
    mutationFn: async (entryData: Partial<Entry>): Promise<Entry> => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entryData),
      })

      if (!response.ok) {
        throw new Error('Failed to create entry')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create entry')
      }

      return data.data
    },
    onSuccess: () => {
      // Invalidate all entry lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: entriesKeys.lists() })
    },
  })
}

/**
 * Update entry mutation
 */
export function useUpdateEntry() {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Entry> }): Promise<Entry> => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update entry')
      }

      const responseData = await response.json()

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update entry')
      }

      return responseData.data
    },
    onSuccess: (_, variables) => {
      // Invalidate specific entry and all lists
      queryClient.invalidateQueries({ queryKey: entriesKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: entriesKeys.lists() })
    },
  })
}

/**
 * Delete entry mutation
 */
export function useDeleteEntry() {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete entry')
      }
    },
    onSuccess: (_, id) => {
      // Remove entry from cache and invalidate lists
      queryClient.removeQueries({ queryKey: entriesKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: entriesKeys.lists() })
    },
  })
}
