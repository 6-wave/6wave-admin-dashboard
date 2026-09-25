import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          toast.success(`${label} copied`)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.error("Couldn't copy. Select and copy it by hand.")
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}
