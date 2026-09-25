import { Link, useLoaderData } from 'react-router'
import { CopyButton } from '@/components/copy-button'
import { PageHeader } from '@/components/page-header'
import { TransactionStatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { METHOD_LABELS } from '@/lib/event'
import { formatDateTime, formatNaira } from '@/lib/format'
import type { TransactionRow } from '@/lib/types'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:gap-4">
      <dt className="w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium">{children}</dd>
    </div>
  )
}

export function TransactionDetailPage() {
  const t = useLoaderData() as TransactionRow

  return (
    <>
      <PageHeader
        title={formatNaira(t.amount)}
        description={formatDateTime(t.createdAt)}
        actions={<TransactionStatusBadge status={t.status} />}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Row label="Reference">
              <span className="inline-flex items-center gap-1 font-mono text-xs">
                {t.reference}
                <CopyButton value={t.reference} label="Reference" />
              </span>
            </Row>
            <Row label="Method">{METHOD_LABELS[t.method]}</Row>
            {t.recordedBy ? <Row label="Taken by">{t.recordedBy}</Row> : null}
            {t.failureReason ? <Row label="Why it failed">{t.failureReason}</Row> : null}
            <Row label="Person">
              {t.userName} · <span className="font-mono text-xs">{t.userReference}</span>
            </Row>
            <Row label="Bought">{t.optionLabel}</Row>
          </dl>
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link to={`/users/${t.userId}`}>Open {t.userName}</Link>
        </Button>
      </div>
    </>
  )
}
