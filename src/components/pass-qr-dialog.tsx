import { QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { CopyButton } from '@/components/copy-button'
import { PassStatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatDateTime } from '@/lib/format'
import type { Pass } from '@/lib/types'

/**
 * Shows one QR code exactly as a scanner would read it: the opaque token on
 * plain white. Void codes are shown crossed out so nobody waves one through.
 */
export function PassQrDialog({ pass, title }: { pass: Pass; title: string }) {
  const void_ = pass.status === 'VOID'
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`View QR code for ${title}`}>
          <QrCode /> View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span className="inline-flex items-center gap-2">
              <PassStatusBadge status={pass.status} />
              {pass.usedAt ? <span>{formatDateTime(pass.usedAt)}</span> : null}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="relative mx-auto rounded-xl bg-white p-4">
          <QRCodeSVG value={pass.token} size={220} level="Q" marginSize={2} className={void_ ? 'opacity-25' : undefined} />
          {void_ ? (
            <span className="absolute inset-0 grid place-items-center text-2xl font-bold tracking-widest text-red uppercase">
              Void
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
          <code className="truncate text-xs">{pass.token}</code>
          <CopyButton value={pass.token} label="Token" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
