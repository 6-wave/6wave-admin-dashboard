import { OPTIONS } from '../event'
import type { Pass, PaymentMethod, Transaction, User } from '../types'

export interface MockDb {
  users: User[]
  passes: Pass[]
  transactions: Transaction[]
}

/** Small deterministic PRNG so the demo data is the same on every reset. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = [
  'Tunde', 'Amaka', 'Chidi', 'Ngozi', 'Emeka', 'Kunle', 'Bisi', 'Ife', 'Seyi', 'Dami',
  'Zainab', 'Hauwa', 'Ibrahim', 'Tobi', 'Sola', 'Yemi', 'Uche', 'Nneka', 'Femi', 'Kemi',
  'Tayo', 'Bola', 'Lola', 'Segun', 'Ada', 'Obinna', 'Halima', 'Musa', 'Efe', 'Osas',
]
const LAST = [
  'Balogun', 'Okafor', 'Adeyemi', 'Obi', 'Adebayo', 'Ogunleye', 'Nwosu', 'Bello', 'Ibe',
  'Lawal', 'Eze', 'Afolabi', 'Danjuma', 'Okoro', 'Salako', 'Akinola', 'Umeh', 'Yusuf',
  'Onyeka', 'Fashola', 'Ojo', 'Ajayi', 'Musa', 'Ezekwe', 'Alabi',
]
const STAFF = ['Tobi (staff)', 'Amina (staff)']

// Roughly how the sales mix looks: mostly single tickets, a few big tables.
const WEIGHTS: Record<string, number> = {
  regular: 34, vip: 20, 'regular-group': 8, 'vip-group': 6,
  'table-100k': 7, 'table-150k': 7, 'table-200k': 6, 'table-250k': 5, 'table-300k': 4,
}

const hex = (rand: () => number, bytes: number) =>
  Array.from({ length: bytes }, () =>
    Math.floor(rand() * 256).toString(16).padStart(2, '0'),
  ).join('')

/** The demo data set. Dates are relative to `now`, so it always looks fresh. */
export function buildSeed(now: number = Date.now()): MockDb {
  const rand = mulberry32(6)
  const pick = <T,>(items: T[]): T => items[Math.floor(rand() * items.length)]
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
  const pickOption = () => {
    let r = rand() * total
    for (const option of OPTIONS) {
      r -= WEIGHTS[option.id] ?? 0
      if (r <= 0) return option
    }
    return OPTIONS[0]
  }

  const users: User[] = []
  const passes: Pass[] = []
  const transactions: Transaction[] = []
  const usedRefs = new Set<string>()
  const COUNT = 72

  for (let i = 0; i < COUNT; i++) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const option = pickOption()
    // Oldest first, spread over the last ~25 days.
    const ageMs = ((COUNT - i) / COUNT) * 25 * 86_400_000 + rand() * 6 * 3_600_000
    const createdAt = new Date(now - ageMs).toISOString()

    let reference: string
    do reference = `WAVE-${10000 + Math.floor(rand() * 90000)}`
    while (usedRefs.has(reference))
    usedRefs.add(reference)

    const paid = rand() < 0.62
    const cancelled = !paid && rand() < 0.1
    const user: User = {
      id: `usr_${hex(rand, 5)}`,
      reference,
      fullName: `${first} ${last}`,
      phone: `+23480${Math.floor(10000000 + rand() * 89999999)}`.slice(0, 14),
      email: `${first}.${last}${Math.floor(rand() * 90)}@example.com`.toLowerCase(),
      optionId: option.id,
      paymentStatus: paid ? 'PAID' : 'PENDING',
      status: cancelled ? 'CANCELLED' : 'CONFIRMED',
      createdAt,
    }
    users.push(user)

    // Passes: one per person covered. A few checked in, purely for the demo.
    for (let g = 0; g < option.admits; g++) {
      const used = paid && rand() < 0.15
      passes.push({
        token: `WAVE-2026-${hex(rand, 16)}`,
        userId: user.id,
        guestIndex: g,
        status: cancelled ? 'VOID' : used ? 'USED' : 'UNUSED',
        usedAt: used ? new Date(now - rand() * 86_400_000).toISOString() : undefined,
        scannedBy: used ? pick(STAFF) : undefined,
      })
    }

    // An earlier attempt that didn't go through, sometimes.
    if (!cancelled && rand() < (paid ? 0.25 : 0.22)) {
      transactions.push({
        reference: `PAY_${hex(rand, 6)}`,
        userId: user.id,
        amount: option.priceNaira,
        method: 'PAYSTACK',
        status: rand() < 0.5 ? 'FAILED' : 'ABANDONED',
        failureReason: rand() < 0.5 ? 'Insufficient funds' : undefined,
        createdAt: new Date(Date.parse(createdAt) + 4 * 60_000).toISOString(),
      })
    }

    if (paid) {
      const r = rand()
      const method: PaymentMethod = r < 0.7 ? 'PAYSTACK' : r < 0.9 ? 'POS' : 'CASH'
      transactions.push({
        reference: method === 'PAYSTACK' ? `PAY_${hex(rand, 6)}` : `MAN_${hex(rand, 4)}`,
        userId: user.id,
        amount: option.priceNaira,
        method,
        status: 'SUCCESS',
        recordedBy: method === 'PAYSTACK' ? undefined : pick(STAFF),
        createdAt: new Date(Date.parse(createdAt) + (10 + rand() * 600) * 60_000).toISOString(),
      })
    }
  }

  transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  users.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return { users, passes, transactions }
}
