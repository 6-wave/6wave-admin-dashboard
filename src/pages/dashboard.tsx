import { CalendarClock, CreditCard, ScanLine, Users } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { TransactionStatusBadge } from '@/components/status-badges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { daysUntil, EVENT, getCurrentWave, KIND_LABELS, METHOD_LABELS } from '@/lib/event'
import { formatDateTime, formatNaira } from '@/lib/format'
import type { DashboardData } from '@/lib/api'

/** A horizontal bar whose length is `value` as a share of `max`. */
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted" role="presentation">
      <div className="h-full rounded-full bg-primary" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  )
}

export function DashboardPage() {
  const data = useLoaderData() as DashboardData
  const wave = getCurrentWave()
  const daysToEvent = daysUntil(EVENT.eventDate)
  const maxDay = Math.max(1, ...data.perDay.map((d) => d.count))
  const maxKind = Math.max(1, ...data.byKind.map((k) => k.revenue))
  const maxMethod = Math.max(1, ...data.byMethod.map((m) => m.amount))

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${EVENT.name}: ${EVENT.subtitle} · ${EVENT.date}, ${EVENT.time} · ${EVENT.venue}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registrations"
          value={String(data.registrations.total)}
          hint={`${data.registrations.paid} paid · ${data.registrations.pending} pending`}
          icon={Users}
        />
        <StatCard
          label="Revenue"
          value={formatNaira(data.revenue)}
          hint={`${formatNaira(data.outstanding)} still to collect`}
          icon={CreditCard}
        />
        <StatCard
          label="Checked in"
          value={`${data.checkedIn.used} / ${data.checkedIn.total}`}
          hint="QR codes scanned at the door"
          icon={ScanLine}
        />
        <StatCard
          label="Days to the event"
          value={daysToEvent >= 0 ? String(daysToEvent) : 'Done'}
          hint={wave ? `${wave.label} ends in ${daysUntil(wave.endsOn)} days` : 'No wave running'}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations, last 14 days</CardTitle>
            <CardDescription>New sign-ups per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1.5" role="img" aria-label="Bar chart of daily registrations">
              {data.perDay.map((day) => (
                <div key={day.day} className="flex h-full flex-1 flex-col justify-end" title={`${day.day}: ${day.count}`}>
                  <div
                    className="rounded-t bg-primary/80 transition-[height]"
                    style={{ height: `${(day.count / maxDay) * 100}%`, minHeight: day.count ? 4 : 2 }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{data.perDay[0]?.day.slice(5)}</span>
              <span>{data.perDay.at(-1)?.day.slice(5)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by type</CardTitle>
            <CardDescription>Paid revenue and how many people bought each.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byKind.map((row) => (
              <div key={row.kind} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">
                    {KIND_LABELS[row.kind]} <span className="text-muted-foreground">· {row.count}</span>
                  </span>
                  <span>{formatNaira(row.revenue)}</span>
                </div>
                <Bar value={row.revenue} max={maxKind} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where the money came in</CardTitle>
            <CardDescription>Successful payments by method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byMethod.map((row) => (
              <div key={row.method} className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{METHOD_LABELS[row.method]}</span>
                  <span>{formatNaira(row.amount)}</span>
                </div>
                <Bar value={row.amount} max={maxMethod} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              <Link to="/transactions" className="underline-offset-4 hover:underline">See all</Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent.map((t) => (
                  <TableRow key={t.reference}>
                    <TableCell>
                      <Link to={`/transactions/${t.reference}`} className="font-medium underline-offset-4 hover:underline">
                        {t.userName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{formatNaira(t.amount)}</TableCell>
                    <TableCell><TransactionStatusBadge status={t.status} /></TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
