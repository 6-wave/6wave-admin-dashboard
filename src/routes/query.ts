import type { PassStatus, PaymentMethod, PurchaseKind, TransactionStatus } from '@/lib/types'

/**
 * Filters and pages live in the URL (?q=&status=&page=), so any view can be
 * bookmarked or shared, and Back/Forward just work. These read them safely:
 * anything unexpected is ignored rather than trusted.
 */
function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => a === value)
}

export function readPage(params: URLSearchParams): number {
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export const USER_STATUSES = ['paid', 'pending', 'cancelled'] as const
export const KINDS = ['TICKET', 'GROUP', 'TABLE'] as const satisfies readonly PurchaseKind[]
export const TRANSACTION_STATUSES = ['SUCCESS', 'PENDING', 'FAILED', 'ABANDONED'] as const satisfies readonly TransactionStatus[]
export const METHODS = ['PAYSTACK', 'POS', 'CASH'] as const satisfies readonly PaymentMethod[]
export const PASS_STATUSES = ['UNUSED', 'USED', 'VOID'] as const satisfies readonly PassStatus[]

export function readUsersQuery(params: URLSearchParams) {
  return {
    q: params.get('q') ?? undefined,
    status: oneOf(params.get('status'), USER_STATUSES),
    kind: oneOf(params.get('kind'), KINDS),
    page: readPage(params),
  }
}

export function readTransactionsQuery(params: URLSearchParams) {
  return {
    q: params.get('q') ?? undefined,
    status: oneOf(params.get('status'), TRANSACTION_STATUSES),
    method: oneOf(params.get('method'), METHODS),
    page: readPage(params),
  }
}

export function readPassesQuery(params: URLSearchParams) {
  return {
    q: params.get('q') ?? undefined,
    status: oneOf(params.get('status'), PASS_STATUSES),
    page: readPage(params),
  }
}
