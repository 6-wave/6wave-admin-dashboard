export type PurchaseKind = 'TICKET' | 'GROUP' | 'TABLE'

/** Something that can be bought. Mirrors the booking app's options. */
export interface PurchaseOption {
  id: string
  kind: PurchaseKind
  label: string
  priceNaira: number
  /** QR codes (people) it covers. */
  admits: number
}

export type PaymentStatus = 'PENDING' | 'PAID'
export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED'
export type PaymentMethod = 'PAYSTACK' | 'POS' | 'CASH'
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'ABANDONED'
export type PassStatus = 'UNUSED' | 'USED' | 'VOID'

/** A person who registered on the booking site (the "users" of the event). */
export interface User {
  id: string
  /** Human-friendly number, e.g. WAVE-83921. */
  reference: string
  fullName: string
  phone: string
  email: string
  optionId: string
  paymentStatus: PaymentStatus
  status: RegistrationStatus
  createdAt: string
}

/** One QR code. A group of 5 has five of these. */
export interface Pass {
  token: string
  userId: string
  /** 0-based position within the registration. */
  guestIndex: number
  status: PassStatus
  usedAt?: string
  scannedBy?: string
}

export interface Transaction {
  reference: string
  userId: string
  /** Naira. */
  amount: number
  method: PaymentMethod
  status: TransactionStatus
  createdAt: string
  /** Admin who took the payment, for payments taken at the gate. */
  recordedBy?: string
  failureReason?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
}

/** A user as shown in lists: plus what they bought and how far they've got. */
export interface UserRow extends User {
  option: PurchaseOption
  amount: number
  passesUsed: number
  passesTotal: number
}

export interface UserDetail {
  user: UserRow
  passes: Pass[]
  transactions: Transaction[]
}

export interface TransactionRow extends Transaction {
  userName: string
  userReference: string
  optionLabel: string
}

export interface PassRow extends Pass {
  userName: string
  userReference: string
  optionLabel: string
  passesTotal: number
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
