import { API_BASE_URL } from './config'
import type { Page, PassRow, PassStatus, PaymentMethod, PurchaseKind, TransactionRow, TransactionStatus, UserDetail, UserRow } from './types'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Everything the dashboard reads or changes goes through this file, talking to the real ASP.NET Core API. */

/** Thin fetch wrapper for the real backend: sends the admin session cookie, surfaces its `{ error }` body. */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0)
  }
  if (!response.ok) {
    let message = response.status === 404 ? 'Not found' : 'Something went wrong. Please try again.'
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        message = body.error
      }
    } catch {
      // No JSON body to read; keep the default message.
    }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Like apiFetch, but for the CSV export endpoint, which returns plain text, not JSON. */
async function apiFetchText(path: string): Promise<string> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0)
  }
  if (!response.ok) throw new ApiError('Something went wrong. Please try again.', response.status)
  return response.text()
}

// ---- users -----------------------------------------------------------------

export interface UsersQuery {
  q?: string
  status?: 'paid' | 'pending' | 'cancelled'
  kind?: PurchaseKind
  page?: number
}

/** GET /api/admin/users?q=&status=&kind=&page= */
export async function listUsers(query: UsersQuery): Promise<Page<UserRow>> {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.status) params.set('status', query.status)
  if (query.kind) params.set('kind', query.kind)
  params.set('page', String(query.page ?? 1))
  return apiFetch<Page<UserRow>>(`/api/admin/users?${params.toString()}`)
}

/** GET /api/admin/users/:id */
export async function getUser(id: string): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/api/admin/users/${encodeURIComponent(id)}`)
}

/**
 * POST /api/admin/users/:id/payments  { method: "POS" | "CASH" | "BANK_TRANSFER" }
 * The money was taken at the gate or by bank transfer. The existing QR codes simply become valid.
 * The backend records who's signed in as the one who recorded it.
 */
export async function recordPayment(
  id: string,
  method: Extract<PaymentMethod, 'POS' | 'CASH' | 'BANK_TRANSFER'>,
): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/api/admin/users/${encodeURIComponent(id)}/payments`, {
    method: 'POST',
    body: JSON.stringify({ method }),
  })
}

/** POST /api/admin/users/:id/cancel: only for registrations nobody has paid for. */
export async function cancelRegistration(id: string): Promise<UserDetail> {
  return apiFetch<UserDetail>(`/api/admin/users/${encodeURIComponent(id)}/cancel`, { method: 'POST' })
}

// ---- transactions ----------------------------------------------------------

export interface TransactionsQuery {
  q?: string
  status?: TransactionStatus
  method?: PaymentMethod
  page?: number
}

export interface TransactionsPage extends Page<TransactionRow> {
  /** Sum and count of successful payments across the whole filtered set. */
  successAmount: number
  successCount: number
}

function transactionsParams(query: Omit<TransactionsQuery, 'page'>): URLSearchParams {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.status) params.set('status', query.status)
  if (query.method) params.set('method', query.method)
  return params
}

/** GET /api/admin/transactions?q=&status=&method=&page= */
export async function listTransactions(query: TransactionsQuery): Promise<TransactionsPage> {
  const params = transactionsParams(query)
  params.set('page', String(query.page ?? 1))
  return apiFetch<TransactionsPage>(`/api/admin/transactions?${params.toString()}`)
}

/** GET /api/admin/transactions/export?q=&status=&method= (every match, not one page) */
export async function exportTransactionsCsv(query: Omit<TransactionsQuery, 'page'>): Promise<string> {
  return apiFetchText(`/api/admin/transactions/export?${transactionsParams(query).toString()}`)
}

/** GET /api/admin/transactions/:reference */
export async function getTransaction(reference: string): Promise<TransactionRow> {
  return apiFetch<TransactionRow>(`/api/admin/transactions/${encodeURIComponent(reference)}`)
}

// ---- QR codes / passes -----------------------------------------------------

export interface PassesQuery {
  q?: string
  status?: PassStatus
  page?: number
}

export interface PassesPage extends Page<PassRow> {
  counts: { total: number; used: number; unused: number; void: number }
}

/** GET /api/admin/passes?q=&status=&page= (q also matches a pasted token) */
export async function listPasses(query: PassesQuery): Promise<PassesPage> {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.status) params.set('status', query.status)
  params.set('page', String(query.page ?? 1))
  return apiFetch<PassesPage>(`/api/admin/passes?${params.toString()}`)
}

// ---- dashboard -------------------------------------------------------------

export interface DashboardData {
  registrations: { total: number; paid: number; pending: number; cancelled: number }
  revenue: number
  outstanding: number
  checkedIn: { used: number; total: number }
  byKind: { kind: PurchaseKind; count: number; revenue: number }[]
  byMethod: { method: PaymentMethod; amount: number }[]
  perDay: { day: string; count: number }[]
  recent: TransactionRow[]
}

/** GET /api/admin/dashboard */
export async function getDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>('/api/admin/dashboard')
}
