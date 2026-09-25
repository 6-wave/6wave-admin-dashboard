import type { PaymentMethod, PurchaseOption } from './types'

/**
 * The event and what's on sale. Kept in step with the booking app's
 * lib/event.ts; once the API exists, this should come from it instead.
 */
export const EVENT = {
  name: 'Sound Wave',
  subtitle: 'The Ember Prelude',
  date: '31st October',
  time: '8PM',
  venue: 'Jinos Lounge/Club',
  /** Nigerian time (UTC+1); the last day counts in full. */
  waves: [{ id: 'wave-1', label: 'Wave 1', startsOn: '2026-09-25', endsOn: '2026-10-18' }],
  eventDate: '2026-10-31',
}

export const OPTIONS: PurchaseOption[] = [
  { id: 'regular', kind: 'TICKET', label: 'Regular', priceNaira: 7000, admits: 1 },
  { id: 'vip', kind: 'TICKET', label: 'VIP', priceNaira: 10000, admits: 1 },
  { id: 'regular-group', kind: 'GROUP', label: 'Regular group', priceNaira: 35000, admits: 5 },
  { id: 'vip-group', kind: 'GROUP', label: 'VIP group', priceNaira: 50000, admits: 5 },
  { id: 'table-100k', kind: 'TABLE', label: 'Table ₦100k', priceNaira: 100000, admits: 1 },
  { id: 'table-150k', kind: 'TABLE', label: 'Table ₦150k', priceNaira: 150000, admits: 1 },
  { id: 'table-200k', kind: 'TABLE', label: 'Table ₦200k', priceNaira: 200000, admits: 1 },
  { id: 'table-250k', kind: 'TABLE', label: 'Table ₦250k', priceNaira: 250000, admits: 1 },
  { id: 'table-300k', kind: 'TABLE', label: 'Table ₦300k', priceNaira: 300000, admits: 1 },
]

export function getOption(id: string): PurchaseOption {
  return OPTIONS.find((o) => o.id === id) ?? OPTIONS[0]
}

export const KIND_LABELS = { TICKET: 'Ticket', GROUP: 'Group of 5', TABLE: 'Table' } as const

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  PAYSTACK: 'Paystack',
  POS: 'POS',
  CASH: 'Cash',
}

/** Today in Lagos as YYYY-MM-DD. */
export function todayInLagos(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(now)
}

export function getCurrentWave(now: Date = new Date()) {
  const today = todayInLagos(now)
  return EVENT.waves.find((w) => w.startsOn <= today && today <= w.endsOn)
}

/** Whole days from today (Lagos) until a YYYY-MM-DD date; negative once past. */
export function daysUntil(date: string, now: Date = new Date()): number {
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${todayInLagos(now)}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}
