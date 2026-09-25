import { useRouteLoaderData } from 'react-router'
import type { AdminUser } from './types'

/** The signed-in admin. Only call this inside the guarded layout. */
export function useAdmin(): AdminUser {
  const data = useRouteLoaderData('app') as { user: AdminUser } | undefined
  if (!data) throw new Error('useAdmin must be used inside the signed-in layout.')
  return data.user
}
