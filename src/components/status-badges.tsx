import { Armchair, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getOption } from '@/lib/event'
import { cn } from '@/lib/utils'
import type {
  PassStatus,
  PaymentStatus,
  RegistrationStatus,
  TransactionStatus,
} from '@/lib/types'

const soft = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning-foreground',
  danger: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
} as const

function Pill({ tone, children }: { tone: keyof typeof soft; children: React.ReactNode }) {
  return <Badge variant="secondary" className={cn('border-transparent font-semibold', soft[tone])}>{children}</Badge>
}

/** Cancelled wins over payment status: nothing more to collect. */
export function UserStatusBadge({ payment, status }: { payment: PaymentStatus; status: RegistrationStatus }) {
  if (status === 'CANCELLED') return <Pill tone="danger">Cancelled</Pill>
  return payment === 'PAID' ? <Pill tone="success">Paid</Pill> : <Pill tone="warning">Pending</Pill>
}

const TRANSACTION: Record<TransactionStatus, { tone: keyof typeof soft; label: string }> = {
  SUCCESS: { tone: 'success', label: 'Success' },
  PENDING: { tone: 'warning', label: 'Pending' },
  FAILED: { tone: 'danger', label: 'Failed' },
  ABANDONED: { tone: 'neutral', label: 'Abandoned' },
}
export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const { tone, label } = TRANSACTION[status]
  return <Pill tone={tone}>{label}</Pill>
}

const PASS: Record<PassStatus, { tone: keyof typeof soft; label: string }> = {
  UNUSED: { tone: 'neutral', label: 'Unused' },
  USED: { tone: 'success', label: 'Checked in' },
  VOID: { tone: 'danger', label: 'Void' },
}
export function PassStatusBadge({ status }: { status: PassStatus }) {
  const { tone, label } = PASS[status]
  return <Pill tone={tone}>{label}</Pill>
}

export function OptionBadge({ optionId }: { optionId: string }) {
  const option = getOption(optionId)
  const Icon = option.kind === 'TABLE' ? Armchair : option.kind === 'GROUP' ? Users : option.id === 'vip' ? Star : null
  return (
    <Badge variant="outline" className="gap-1 font-medium">
      {Icon ? <Icon className="size-3" /> : null}
      {option.label}
    </Badge>
  )
}
