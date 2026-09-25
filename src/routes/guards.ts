import { redirect, type MiddlewareFunction } from 'react-router'
import { getSession, sessionContext } from '@/lib/auth'

/**
 * Every page except /login sits behind this. No session, no page: you're sent
 * to the sign-in screen and brought back to where you were headed afterwards.
 */
export const requireAuth: MiddlewareFunction = async ({ request, context }) => {
  const user = await getSession()
  if (!user) {
    const url = new URL(request.url)
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`)
  }
  context.set(sessionContext, user)
}

/** The sign-in screen is pointless when you're already in. */
export const redirectIfSignedIn: MiddlewareFunction = async () => {
  if (await getSession()) throw redirect('/')
}
