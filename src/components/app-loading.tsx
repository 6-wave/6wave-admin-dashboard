import { LoaderCircle } from 'lucide-react'

/** Shown for the split second before the first page is ready. */
export function AppLoading() {
  return (
    <div className="grid min-h-svh place-items-center bg-background" role="status" aria-label="Loading">
      <LoaderCircle className="size-6 animate-spin text-primary" />
    </div>
  )
}
