import { redirect, type MiddlewareFunction, type RouterContextProvider } from 'react-router'
import { getSession, sessionContext } from '@/lib/auth'
import type { AdminRole } from '@/lib/types'

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

/**
 * Throws a 403 unless the signed-in user has the role. Call it from a loader,
 * not middleware: a loader's error shows inside the layout (sidebar intact),
 * while a middleware error runs before any loader and skips past the layout.
 * Runs after requireAuth, so the user is already in context.
 */
export function assertRole(context: Readonly<RouterContextProvider>, role: AdminRole): void {
  if (context.get(sessionContext).role !== role) {
    throw new Response('You do not have access to this page.', { status: 403 })
  }
}
