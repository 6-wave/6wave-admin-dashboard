import { useEffect } from 'react'
import { toast } from 'sonner'
import type { ActionResult } from '@/routes/loaders'

/** Turns an action's result into a toast: green for success, red with the reason for failure. */
export function useActionToast(result: ActionResult | undefined): void {
  useEffect(() => {
    if (!result) return
    if (result.ok) toast.success(result.message)
    else toast.error(result.error)
  }, [result])
}
