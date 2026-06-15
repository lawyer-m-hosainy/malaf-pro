import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface UsePaginatedQueryOptions {
  queryKey: string[]
  endpoint: string
  params?: Record<string, string | number | undefined>
  limit?: number
}

export function usePaginatedQuery<T>({
  queryKey,
  endpoint,
  params = {},
  limit = 20,
}: UsePaginatedQueryOptions) {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: [...queryKey, page, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      searchParams.set('page', String(page))
      searchParams.set('limit', String(limit))
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          searchParams.set(k, String(v))
        }
      })
      const { data } = await api.get(
        `${endpoint}?${searchParams.toString()}`
      )
      return data as { data: T[]; pagination: {
        total: number; page: number; limit: number
        totalPages: number; hasNext: boolean; hasPrev: boolean
      }}
    },
    staleTime: 30_000,
  })

  return {
    ...query,
    page,
    setPage,
    goToNext: () => setPage(p => p + 1),
    goToPrev: () => setPage(p => Math.max(1, p - 1)),
    pagination: query.data?.pagination,
  }
}
