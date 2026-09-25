import { cn } from '@/lib/utils'

/**
 * The 6ixwave wordmark. `onDark` picks the white one; otherwise it switches
 * with the theme (ink on light, white on dark).
 */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const alt = '6ixwave Entertainment'
  if (onDark) {
    return <img src="/brand/6ixwave-wordmark-white.svg" alt={alt} className={cn('h-6 w-auto', className)} />
  }
  return (
    <>
      <img src="/brand/6ixwave-wordmark-ink.svg" alt={alt} className={cn('h-6 w-auto dark:hidden', className)} />
      <img src="/brand/6ixwave-wordmark-white.svg" alt={alt} className={cn('hidden h-6 w-auto dark:block', className)} />
    </>
  )
}
