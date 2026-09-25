import { Link, useLoaderData, useNavigation } from 'react-router'
import { ClearFilters, FilterSelect, SearchBox } from '@/components/list-toolbar'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { OptionBadge, UserStatusBadge } from '@/components/status-badges'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KIND_LABELS } from '@/lib/event'
import { formatDate, formatNaira } from '@/lib/format'
import type { Page, UserRow } from '@/lib/types'

export function UsersPage() {
  const data = useLoaderData() as Page<UserRow>
  const loading = useNavigation().state === 'loading'

  return (
    <>
      <PageHeader title="Users" description="Everyone who registered, what they bought, and whether they've paid." />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox placeholder="Search name, WAVE-…, phone or email" />
        <FilterSelect
          param="status"
          label="Filter by status"
          allLabel="All statuses"
          options={[
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
        <FilterSelect
          param="kind"
          label="Filter by type"
          allLabel="All types"
          options={Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <ClearFilters />
      </div>

      <Card aria-busy={loading} className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead className="hidden md:table-cell">Reference</TableHead>
                <TableHead className="hidden sm:table-cell">Purchase</TableHead>
                <TableHead className="hidden text-right md:table-cell">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">QR codes</TableHead>
                <TableHead className="hidden lg:table-cell">Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nobody matches these filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="whitespace-normal">
                      <Link to={`/users/${user.id}`} className="font-medium underline-offset-4 hover:underline">
                        {user.fullName}
                      </Link>
                      <p className="text-xs break-all text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs md:table-cell">{user.reference}</TableCell>
                    <TableCell className="hidden sm:table-cell"><OptionBadge optionId={user.optionId} /></TableCell>
                    <TableCell className="hidden text-right md:table-cell">{formatNaira(user.amount)}</TableCell>
                    <TableCell><UserStatusBadge payment={user.paymentStatus} status={user.status} /></TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {user.passesUsed}/{user.passesTotal} in
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(user.createdAt)}</TableCell>
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
