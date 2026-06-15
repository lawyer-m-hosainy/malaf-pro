import { ChevronRight, ChevronLeft } from 'lucide-react'

interface PaginationProps {
  pagination?: {
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
  onNext: () => void
  onPrev: () => void
  onPage: (page: number) => void
}

export function Pagination({
  pagination,
  onNext,
  onPrev,
  onPage,
}: PaginationProps) {
  if (!pagination || pagination.totalPages <= 1) return null

  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  // أرقام الصفحات المعروضة
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1);
         i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-muted-foreground">
        عرض {start} - {end} من {total} نتيجة
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="p-2 rounded-md hover:bg-accent
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`min-w-[32px] h-8 rounded-md text-sm font-medium
                ${page === p
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="p-2 rounded-md hover:bg-accent
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
