import { Download } from 'lucide-react'
import { useState } from 'react'
import { Link, useLoaderData, useNavigation, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { ClearFilters, FilterSelect, SearchBox } from '@/components/list-toolbar'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { TransactionStatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { exportTransactionsCsv, type TransactionsPage as Data } from '@/lib/api'
import { METHOD_LABELS } from '@/lib/event'
import { formatDateTime, formatNaira } from '@/lib/format'
import { readTransactionsQuery } from '@/routes/query'

const STATUS_OPTIONS = [
  { value: 'SUCCESS', label: 'Successful' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'ABANDONED', label: 'Abandoned' },
]

export function TransactionsPage() {
  const data = useLoaderData() as Data
  const loading = useNavigation().state === 'loading'
  const [params] = useSearchParams()
  const [exporting, setExporting] = useState(false)

  async function exportCsv() {
    setExporting(true)
    try {
      // Every match, not just this page.
      const csv = await exportTransactionsCsv(readTransactionsQuery(params))
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.append(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not export.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every payment attempt: online, POS and cash."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={exporting || data.total === 0}>
            <Download /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox placeholder="Search reference, name or WAVE-…" />
        <FilterSelect param="status" label="Filter by status" allLabel="All statuses" options={STATUS_OPTIONS} />
        <FilterSelect
          param="method"
          label="Filter by method"
          allLabel="All methods"
          options={Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <ClearFilters />
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {data.total} {data.total === 1 ? 'transaction' : 'transactions'} ·{' '}
        <span className="font-medium text-foreground">{formatNaira(data.successAmount)}</span> collected across{' '}
        {data.successCount} successful
      </p>

      <Card aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Reference</TableHead>
                <TableHead>Person</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No transactions match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((t) => (
                  <TableRow key={t.reference}>
                    <TableCell className="hidden sm:table-cell">
                      <Link to={`/transactions/${t.reference}`} className="font-mono text-xs underline-offset-4 hover:underline">
                        {t.reference}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {/* Below sm the reference column is hidden, so the name opens the payment. */}
                      <Link to={`/transactions/${t.reference}`} className="font-medium underline-offset-4 hover:underline sm:no-underline sm:hover:no-underline">
                        {t.userName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{t.optionLabel}</p>
                    </TableCell>
                    <TableCell className="text-right">{formatNaira(t.amount)}</TableCell>
                    <TableCell className="hidden md:table-cell">{METHOD_LABELS[t.method]}</TableCell>
                    <TableCell><TransactionStatusBadge status={t.status} /></TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDateTime(t.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />
        </CardContent>
      </Card>
    </>
  )
}
