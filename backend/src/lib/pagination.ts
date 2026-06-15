export interface PaginationParams {
  page?: string | number
  limit?: string | number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function getPaginationParams(query: PaginationParams) {
  const page = Math.max(1, parseInt(String(query.page || '1')))
  const limit = Math.min(100, Math.max(1,
    parseInt(String(query.limit || '20'))
  ))
  const skip = (page - 1) * limit
  return { page, limit, skip, take: limit }
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
