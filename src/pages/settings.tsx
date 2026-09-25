import { useTheme } from 'next-themes'
import { useFetcher } from 'react-router'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { USE_MOCKS } from '@/lib/config'
import { EVENT, KIND_LABELS, OPTIONS, getCurrentWave } from '@/lib/event'
import { formatDate, formatNaira } from '@/lib/format'
import { useActionToast } from '@/lib/use-action-toast'
import { useAdmin } from '@/lib/use-admin'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/routes/loaders'

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const admin = useAdmin()
  const { theme, setTheme } = useTheme()
  const fetcher = useFetcher<ActionResult>()
  useActionToast(fetcher.data)
  const currentWave = getCurrentWave()

  return (
    <>
      <PageHeader title="Settings" description="Your account, and how the event is set up." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{admin.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd className="truncate font-medium">{admin.email}</dd></div>
            </dl>
            <div>
              <p className="mb-2 text-muted-foreground" id="theme-label">Theme</p>
              <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors',
                      theme === t.value ? 'border-primary bg-primary/10' : 'border-input hover:border-muted-foreground/50',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{EVENT.name}: {EVENT.subtitle}</CardTitle>
            <CardDescription>{EVENT.date}, {EVENT.time} · {EVENT.venue}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Waves are shown on the booking site for information. Prices and waves are set in the booking app, so
              this list is read-only.
            </p>
            <ul className="space-y-2">
              {EVENT.waves.map((wave) => (
                <li key={wave.id} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{wave.label}</span>
                  <span className="text-muted-foreground">{formatDate(wave.startsOn)} – {formatDate(wave.endsOn)}</span>
                  {currentWave?.id === wave.id ? <Badge>Live now</Badge> : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets and tables</CardTitle>
          <CardDescription>Group purchases give each of the five people their own QR code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">QR codes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OPTIONS.map((option) => (
                <TableRow key={option.id}>
                  <TableCell className="font-medium">{option.label}</TableCell>
                  <TableCell className="text-muted-foreground">{KIND_LABELS[option.kind]}</TableCell>
                  <TableCell className="text-right">{formatNaira(option.priceNaira)}</TableCell>
                  <TableCell className="text-right">{option.admits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {USE_MOCKS ? (
        <Card>
          <CardHeader>
            <CardTitle>Demo data</CardTitle>
            <CardDescription>
              This build is running on made-up data stored in this browser. Nothing here is real or shared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              disabled={fetcher.state !== 'idle'}
              onClick={() => fetcher.submit({ intent: 'reset-demo' }, { method: 'post' })}
            >
              {fetcher.state === 'idle' ? 'Reset demo data' : 'Resetting…'}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
