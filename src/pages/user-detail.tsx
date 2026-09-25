import { Banknote, CreditCard, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useFetcher, useLoaderData } from 'react-router'
import { CopyButton } from '@/components/copy-button'
import { PageHeader } from '@/components/page-header'
import { PassQrDialog } from '@/components/pass-qr-dialog'
import {
  OptionBadge,
  PassStatusBadge,
  TransactionStatusBadge,
  UserStatusBadge,
} from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { METHOD_LABELS } from '@/lib/event'
import { formatDate, formatDateTime, formatNaira, formatPhone, maskToken } from '@/lib/format'
import type { UserDetail } from '@/lib/types'
import { useActionToast } from '@/lib/use-action-toast'
import { useAdmin } from '@/lib/use-admin'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/routes/loaders'

type Method = 'POS' | 'CASH'

export function UserDetailPage() {
  const { user, passes, transactions } = useLoaderData() as UserDetail
  const admin = useAdmin()
  const fetcher = useFetcher<ActionResult>()
  useActionToast(fetcher.data)
  const busy = fetcher.state !== 'idle'

  const [method, setMethod] = useState<Method>('POS')
  const [payOpen, setPayOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const open = user.status === 'CONFIRMED'
  const canCollect = open && user.paymentStatus === 'PENDING'
  const canCancel = canCollect && admin.role === 'admin'
  const paidTx = transactions.find((t) => t.status === 'SUCCESS')

  return (
    <>
      <PageHeader
        title={user.fullName}
        description={`Registered ${formatDate(user.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-sm">
              {user.reference}
              <CopyButton value={user.reference} label="Reference" />
            </span>
            <OptionBadge optionId={user.optionId} />
            <UserStatusBadge payment={user.paymentStatus} status={user.status} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" aria-hidden="true" />
              <a href={`tel:${user.phone}`} className="underline-offset-4 hover:underline">{formatPhone(user.phone)}</a>
              <CopyButton value={user.phone} label="Phone number" />
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
              <a href={`mailto:${user.email}`} className="truncate underline-offset-4 hover:underline">{user.email}</a>
              <CopyButton value={user.email} label="Email" />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-poster text-3xl tracking-wide">{formatNaira(user.amount)}</p>
            <p className="text-muted-foreground">
              {user.option.label} · {user.passesTotal} QR {user.passesTotal === 1 ? 'code' : 'codes'}
            </p>
            {user.paymentStatus === 'PAID' && paidTx ? (
              <p className="text-muted-foreground">
                Paid by {METHOD_LABELS[paidTx.method]} on {formatDate(paidTx.createdAt)}
                {paidTx.recordedBy ? ` · taken by ${paidTx.recordedBy}` : ''}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gate actions</CardTitle>
            <CardDescription>
              {canCollect
                ? 'Take payment on the spot. Their QR codes stay the same.'
                : open
                  ? 'Already paid. Nothing to collect.'
                  : 'This registration is cancelled.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canCollect ? (
              <fieldset className="grid grid-cols-2 gap-2" disabled={busy}>
                <legend className="sr-only">How they paid</legend>
                {(['POS', 'CASH'] as const).map((value) => (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors focus-within:ring-3 focus-within:ring-ring/40',
                      method === value ? 'border-primary bg-primary/10' : 'border-input hover:border-muted-foreground/50',
                    )}
                  >
                    <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />
                    {value === 'POS' ? <CreditCard className="size-4" /> : <Banknote className="size-4" />}
                    {value === 'POS' ? 'POS' : 'Cash'}
                  </label>
                ))}
              </fieldset>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {canCollect ? (
                <Button onClick={() => setPayOpen(true)} disabled={busy}>Record payment</Button>
              ) : null}
              {canCancel ? (
                <Button variant="destructive" onClick={() => setCancelOpen(true)} disabled={busy}>
                  Cancel registration
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR codes</CardTitle>
          <CardDescription>One per person. Each is scanned once at the door.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead className="hidden sm:table-cell">Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Checked in</TableHead>
                <TableHead className="text-right">QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passes.map((pass) => (
                <TableRow key={pass.token}>
                  <TableCell>{passes.length > 1 ? `Guest ${pass.guestIndex + 1}` : user.fullName}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <code className="text-xs">{maskToken(pass.token)}</code>
                      <CopyButton value={pass.token} label="Token" />
                    </span>
                  </TableCell>
                  <TableCell><PassStatusBadge status={pass.status} /></TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {pass.usedAt ? `${formatDateTime(pass.usedAt)}${pass.scannedBy ? ` · ${pass.scannedBy}` : ''}` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <PassQrDialog pass={pass} title={`${user.fullName}${passes.length > 1 ? ` · Guest ${pass.guestIndex + 1}` : ''}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Every attempt, successful or not.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No payment attempts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.reference}>
                    <TableCell>
                      <Link to={`/transactions/${t.reference}`} className="font-mono text-xs underline-offset-4 hover:underline">
                        {t.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{formatNaira(t.amount)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{METHOD_LABELS[t.method]}</TableCell>
                    <TableCell><TransactionStatusBadge status={t.status} /></TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record {formatNaira(user.amount)} as paid?</DialogTitle>
            <DialogDescription>
              {user.fullName} paid by {method === 'POS' ? 'POS' : 'cash'} at the gate. This is logged under your name
              ({admin.name}) and can't be undone here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Not yet</Button>
            <Button
              onClick={() => {
                fetcher.submit({ intent: 'record-payment', method }, { method: 'post' })
                setPayOpen(false)
              }}
            >
              Yes, record it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this registration?</DialogTitle>
            <DialogDescription>
              {user.fullName}'s {user.passesTotal === 1 ? 'QR code stops' : `${user.passesTotal} QR codes stop`} working
              straight away. Only unpaid registrations can be cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep it</Button>
            <Button
              variant="destructive"
              onClick={() => {
                fetcher.submit({ intent: 'cancel' }, { method: 'post' })
                setCancelOpen(false)
              }}
            >
              Cancel registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
