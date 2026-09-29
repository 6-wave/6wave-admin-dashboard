import { createContext } from 'react-router'
import { API_BASE_URL } from './config'
import type { AdminUser } from './types'

/** The signed-in admin, put there by the route guard and read by loaders and actions. */
export const sessionContext = createContext<AdminUser>()

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

function isAdminUser(value: unknown): value is AdminUser {
  const v = value as Partial<AdminUser> | null
  return !!v && typeof v.id === 'string' && typeof v.name === 'string' && typeof v.email === 'string'
}

/** Who is signed in right now, or null. GET /api/admin/auth/me */
export async function getSession(): Promise<AdminUser | null> {
  try {
    // The server keeps the session in an httpOnly cookie; the browser only sends it.
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, { credentials: 'include' })
    if (!response.ok) return null
    const body: unknown = await response.json()
    return isAdminUser(body) ? body : null
  } catch {
    return null
  }
}

/** POST /api/admin/auth/login  { email, password } */
export async function signIn(email: string, password: string): Promise<AdminUser> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new AuthError("Can't reach the server. Check your connection.")
  }
  if (response.status === 429) throw new AuthError('Too many attempts. Wait a few minutes and try again.')
  if (response.status === 400 || response.status === 401) throw new AuthError('Wrong email or password.')
  if (!response.ok) throw new AuthError('Something went wrong. Please try again.')
  const body: unknown = await response.json()
  if (!isAdminUser(body)) throw new AuthError('Something went wrong. Please try again.')
  return body
}

/** POST /api/admin/auth/logout */
export async function signOut(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/admin/auth/logout`, { method: 'POST', credentials: 'include' })
  } catch {
    // The cookie expires on its own; nothing more to do here.
  }
}

/** Only ever go back to a page inside this app (never off-site, never `//host`). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  if (next.startsWith('/login') || next.startsWith('/logout')) return '/'
  return next
}
