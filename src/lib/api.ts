import { USE_MOCKS } from './config'
import { getOption, OPTIONS } from './event'
import { readDb, resetDb, writeDb } from './mock/store'
import type { MockDb } from './mock/seed'
import type {
  Page,
  PassRow,
  PassStatus,
  PaymentMethod,
  PurchaseKind,
  TransactionRow,
  TransactionStatus,
  User,
  UserDetail,
  UserRow,
} from './types'

export const PAGE_SIZE = 10

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Everything the dashboard reads or changes goes through this file. Today it
 * runs on the demo data in lib/mock; connecting the ASP.NET Core API means
 * replacing each function body (the endpoint to call is noted above each one).
 * Outside demo mode nothing pretends to work: it fails loudly instead.
 */
function requireMocks(): void {
  if (!USE_MOCKS) throw new ApiError("The API isn't connected yet.", 501)
}

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

// ---- helpers ---------------------------------------------------------------

function toRow(db: MockDb, user: User): UserRow {
  const option = getOption(user.optionId)
  const mine = db.passes.filter((p) => p.userId === user.id)
  return {
    ...user,
    option,
    amount: option.priceNaira,
    passesUsed: mine.filter((p) => p.status === 'USED').length,
    passesTotal: mine.length,
  }
}

function paginate<T>(items: T[], page: number): Page<T> {
  const current = Math.min(Math.max(1, page), Math.max(1, Math.ceil(items.length / PAGE_SIZE)))
  return {
    items: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    total: items.length,
    page: current,
    pageSize: PAGE_SIZE,
  }
}

const includes = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase())

function findUser(db: MockDb, id: string): User {
  const user = db.users.find((u) => u.id === id)
  if (!user) throw new ApiError('User not found', 404)
  return user
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
  requireMocks()
  await delay()
  const db = readDb()
  const q = query.q?.trim()
  const rows = db.users
    .filter((u) => {
      if (query.status === 'cancelled') return u.status === 'CANCELLED'
      if (query.status === 'paid') return u.status !== 'CANCELLED' && u.paymentStatus === 'PAID'
      if (query.status === 'pending') return u.status !== 'CANCELLED' && u.paymentStatus === 'PENDING'
      return true
    })
    .filter((u) => !query.kind || getOption(u.optionId).kind === query.kind)
    .filter(
      (u) =>
        !q ||
        includes(u.fullName, q) ||
        includes(u.reference, q) ||
        includes(u.email, q) ||
        u.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§'),
    )
    .map((u) => toRow(db, u))
  return paginate(rows, query.page ?? 1)
}

/** GET /api/admin/users/:id */
export async function getUser(id: string): Promise<UserDetail> {
  requireMocks()
  await delay(250)
  const db = readDb()
  const user = findUser(db, id)
  return {
    user: toRow(db, user),
    passes: db.passes.filter((p) => p.userId === id).sort((a, b) => a.guestIndex - b.guestIndex),
    transactions: db.transactions.filter((t) => t.userId === id),
  }
}

/**
 * POST /api/admin/users/:id/payments  { method: "POS" | "CASH" }
 * Staff took the money at the gate. The existing QR codes simply become valid.
 */
export async function recordPayment(
  id: string,
  method: Extract<PaymentMethod, 'POS' | 'CASH'>,
  actor: string,
): Promise<UserDetail> {
  requireMocks()
  await delay()
  const db = readDb()
  const user = findUser(db, id)
  if (user.status === 'CANCELLED') throw new ApiError('This registration is cancelled.', 409)
  if (user.paymentStatus === 'PAID') throw new ApiError('This registration is already paid.', 409)

  user.paymentStatus = 'PAID'
  db.transactions.unshift({
    reference: `MAN_${Math.random().toString(16).slice(2, 10)}`,
    userId: id,
    amount: getOption(user.optionId).priceNaira,
    method,
    status: 'SUCCESS',
    recordedBy: actor,
    createdAt: new Date().toISOString(),
  })
  writeDb(db)
  return getUserSync(db, id)
}

/** POST /api/admin/users/:id/cancel: only for registrations nobody has paid for. */
export async function cancelRegistration(id: string): Promise<UserDetail> {
  requireMocks()
  await delay()
  const db = readDb()
  const user = findUser(db, id)
  if (user.status === 'CANCELLED') throw new ApiError('Already cancelled.', 409)
  if (user.paymentStatus === 'PAID')
    throw new ApiError('A paid registration needs a refund, not a cancellation.', 409)
  user.status = 'CANCELLED'
  db.passes.forEach((p) => {
    if (p.userId === id) p.status = 'VOID'
  })
  writeDb(db)
  return getUserSync(db, id)
}

function getUserSync(db: MockDb, id: string): UserDetail {
  const user = findUser(db, id)
  return {
    user: toRow(db, user),
    passes: db.passes.filter((p) => p.userId === id).sort((a, b) => a.guestIndex - b.guestIndex),
    transactions: db.transactions.filter((t) => t.userId === id),
  }
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

function toTransactionRow(db: MockDb, t: MockDb['transactions'][number]): TransactionRow {
  const user = db.users.find((u) => u.id === t.userId)
  return {
    ...t,
    userName: user?.fullName ?? 'Unknown',
    userReference: user?.reference ?? '-',
    optionLabel: user ? getOption(user.optionId).label : '-',
  }
}

function filterTransactions(db: MockDb, query: TransactionsQuery): TransactionRow[] {
  const q = query.q?.trim()
  return db.transactions
    .map((t) => toTransactionRow(db, t))
    .filter((t) => !query.status || t.status === query.status)
    .filter((t) => !query.method || t.method === query.method)
    .filter(
      (t) =>
        !q ||
        includes(t.reference, q) ||
        includes(t.userName, q) ||
        includes(t.userReference, q),
    )
}

/** GET /api/admin/transactions?q=&status=&method=&page= */
export async function listTransactions(query: TransactionsQuery): Promise<TransactionsPage> {
  requireMocks()
  await delay()
  const rows = filterTransactions(readDb(), query)
  const success = rows.filter((t) => t.status === 'SUCCESS')
  return {
    ...paginate(rows, query.page ?? 1),
    successAmount: success.reduce((sum, t) => sum + t.amount, 0),
    successCount: success.length,
  }
}

/**
 * A spreadsheet treats a cell starting with = + - @ as a formula, so a name
 * like "=HYPERLINK(...)" could run something on whoever opens the export.
 * Prefixing an apostrophe keeps every cell plain text.
 */
function csvCell(value: string | number): string {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** GET /api/admin/transactions/export?q=&status=&method= (every match, not one page) */
export async function exportTransactionsCsv(query: Omit<TransactionsQuery, 'page'>): Promise<string> {
  requireMocks()
  await delay(200)
  const header = ['Reference', 'Date', 'Person', 'Registration', 'Purchase', 'Amount (NGN)', 'Method', 'Status', 'Recorded by']
  const lines = filterTransactions(readDb(), query).map((t) =>
    [t.reference, t.createdAt, t.userName, t.userReference, t.optionLabel, t.amount, t.method, t.status, t.recordedBy ?? '']
      .map(csvCell)
      .join(','),
  )
  return [header.map(csvCell).join(','), ...lines].join('\n')
}

/** GET /api/admin/transactions/:reference */
export async function getTransaction(reference: string): Promise<TransactionRow> {
  requireMocks()
  await delay(250)
  const db = readDb()
  const t = db.transactions.find((x) => x.reference === reference)
  if (!t) throw new ApiError('Transaction not found', 404)
  return toTransactionRow(db, t)
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
  requireMocks()
  await delay()
  const db = readDb()
  const q = query.q?.trim()
  const all: PassRow[] = db.passes.map((p) => {
    const user = findUser(db, p.userId)
    return {
      ...p,
      userName: user.fullName,
      userReference: user.reference,
      optionLabel: getOption(user.optionId).label,
      passesTotal: db.passes.filter((x) => x.userId === p.userId).length,
    }
  })
  const rows = all
    .filter((p) => !query.status || p.status === query.status)
    .filter(
      (p) => !q || includes(p.token, q) || includes(p.userName, q) || includes(p.userReference, q),
    )
  return {
    ...paginate(rows, query.page ?? 1),
    counts: {
      total: all.length,
      used: all.filter((p) => p.status === 'USED').length,
      unused: all.filter((p) => p.status === 'UNUSED').length,
      void: all.filter((p) => p.status === 'VOID').length,
    },
  }
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
  requireMocks()
  await delay(300)
  const db = readDb()
  const live = db.users.filter((u) => u.status !== 'CANCELLED')
  const success = db.transactions.filter((t) => t.status === 'SUCCESS')
  const activePasses = db.passes.filter((p) => p.status !== 'VOID')

  const kinds: PurchaseKind[] = ['TICKET', 'GROUP', 'TABLE']
  const byKind = kinds.map((kind) => {
    const ofKind = live.filter((u) => getOption(u.optionId).kind === kind)
    return {
      kind,
      count: ofKind.length,
      revenue: ofKind
        .filter((u) => u.paymentStatus === 'PAID')
        .reduce((sum, u) => sum + getOption(u.optionId).priceNaira, 0),
    }
  })

  const methods: PaymentMethod[] = ['PAYSTACK', 'POS', 'CASH']
  const byMethod = methods.map((method) => ({
    method,
    amount: success.filter((t) => t.method === method).reduce((sum, t) => sum + t.amount, 0),
  }))

  const perDay: DashboardData['perDay'] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(d)
    perDay.push({
      day,
      count: db.users.filter(
        (u) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date(u.createdAt)) === day,
      ).length,
    })
  }

  return {
    registrations: {
      total: live.length,
      paid: live.filter((u) => u.paymentStatus === 'PAID').length,
      pending: live.filter((u) => u.paymentStatus === 'PENDING').length,
      cancelled: db.users.length - live.length,
    },
    revenue: success.reduce((sum, t) => sum + t.amount, 0),
    outstanding: live
      .filter((u) => u.paymentStatus === 'PENDING')
      .reduce((sum, u) => sum + getOption(u.optionId).priceNaira, 0),
    checkedIn: {
      used: activePasses.filter((p) => p.status === 'USED').length,
      total: activePasses.length,
    },
    byKind,
    byMethod,
    perDay,
    recent: db.transactions.slice(0, 6).map((t) => toTransactionRow(db, t)),
  }
}

// ---- demo ------------------------------------------------------------------

/** Demo mode only: put the demo data back the way it started. */
export async function resetDemoData(): Promise<void> {
  requireMocks()
  await delay(200)
  resetDb()
}

export { OPTIONS }
