import { Search, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** Search box: press Enter to apply. The term lives in the URL as ?q= */
export function SearchBox({ placeholder }: { placeholder: string }) {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  return (
    <form
      role="search"
      className="relative w-full sm:max-w-xs"
      // Remounts if ?q= changes from outside (for example "Clear"), so the field never goes stale.
      key={q}
      onSubmit={(event) => {
        event.preventDefault()
        const value = String(new FormData(event.currentTarget).get('q') ?? '').trim()
        const next = new URLSearchParams(params)
        if (value) next.set('q', value)
        else next.delete('q')
        next.delete('page')
        setParams(next)
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 pl-8"
        autoComplete="off"
      />
    </form>
  )
}

/** A filter that lives in the URL. Choosing "all" removes it. */
export function FilterSelect({
  param,
  label,
  allLabel,
  options,
}: {
  param: string
  label: string
  allLabel: string
  options: { value: string; label: string }[]
}) {
  const [params, setParams] = useSearchParams()
  return (
    <Select
      value={params.get(param) ?? 'all'}
      onValueChange={(value) => {
        const next = new URLSearchParams(params)
        if (value === 'all') next.delete(param)
        else next.set(param, value)
        next.delete('page')
        setParams(next)
      }}
    >
      <SelectTrigger className="h-9 w-full sm:w-40" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Shows only when something is filtered. */
export function ClearFilters() {
  const [params] = useSearchParams()
  const active = ['q', 'status', 'kind', 'method'].some((key) => params.has(key))
  if (!active) return null
  return (
    <Button asChild variant="ghost" size="sm" className="h-9">
      <Link to="?">
        <X /> Clear
      </Link>
    </Button>
  )
}
