import { Link, useLoaderData, useNavigation } from 'react-router'
import { CopyButton } from '@/components/copy-button'
import { ClearFilters, FilterSelect, SearchBox } from '@/components/list-toolbar'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { PassQrDialog } from '@/components/pass-qr-dialog'
import { PassStatusBadge } from '@/components/status-badges'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { PassesPage } from '@/lib/api'
import { formatDateTime, maskToken } from '@/lib/format'

export function QrCodesPage() {
  const data = useLoaderData() as PassesPage
  const loading = useNavigation().state === 'loading'
  const { counts } = data

  return (
    <>
      <PageHeader
        title="QR codes"
        description="Every code issued, and whether it has been scanned at the door."
      />

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{counts.used}</span> checked in ·{' '}
        <span className="font-medium text-foreground">{counts.unused}</span> waiting ·{' '}
        {counts.void} void · {counts.total} in all
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox placeholder="Search name, WAVE-… or a token" />
        <FilterSelect
          param="status"
          label="Filter by status"
          allLabel="All statuses"
          options={[
            { value: 'UNUSED', label: 'Not scanned' },
            { value: 'USED', label: 'Checked in' },
            { value: 'VOID', label: 'Void' },
          ]}
        />
        <ClearFilters />
      </div>

      <Card aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead className="hidden sm:table-cell">Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Checked in</TableHead>
                <TableHead className="text-right">QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No QR codes match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((pass) => {
                  const guest = pass.passesTotal > 1 ? ` · Guest ${pass.guestIndex + 1}/${pass.passesTotal}` : ''
                  return (
                    <TableRow key={pass.token}>
                      <TableCell className="whitespace-normal">
                        <Link to={`/users/${pass.userId}`} className="font-medium underline-offset-4 hover:underline">
                          {pass.userName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {pass.userReference} · {pass.optionLabel}
                          {guest}
                        </p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <code className="text-xs">{maskToken(pass.token)}</code>
                          <CopyButton value={pass.token} label="Token" />
                        </span>
                      </TableCell>
                      <TableCell><PassStatusBadge status={pass.status} /></TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {pass.usedAt ? `${formatDateTime(pass.usedAt)}${pass.scannedBy ? ` · ${pass.scannedBy}` : ''}` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <PassQrDialog pass={pass} title={`${pass.userName}${guest}`} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} />
        </CardContent>
      </Card>
    </>
  )
}
