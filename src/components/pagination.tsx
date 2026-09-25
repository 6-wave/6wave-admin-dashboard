import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'

export function Pagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const [params] = useSearchParams()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const href = (target: number) => {
    const next = new URLSearchParams(params)
    if (target <= 1) next.delete('page')
    else next.set('page', String(target))
    return `?${next.toString()}`
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">
          Page {page} of {pages}
        </span>
        <Button asChild variant="outline" size="icon" aria-label="Previous page" aria-disabled={page <= 1}>
          <Link to={href(page - 1)} tabIndex={page <= 1 ? -1 : undefined}>
            <ChevronLeft />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" aria-label="Next page" aria-disabled={page >= pages}>
          <Link to={href(page + 1)} tabIndex={page >= pages ? -1 : undefined}>
            <ChevronRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}
