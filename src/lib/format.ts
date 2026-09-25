const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

export const formatNaira = (amount: number) => naira.format(amount)

const dateTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Lagos',
})
const date = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
})

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatDate = (iso: string) => date.format(new Date(iso))

/** +2348012345678 -> 0801 234 5678 */
export function formatPhone(e164: string): string {
  const local = e164.startsWith('+234') ? `0${e164.slice(4)}` : e164
  return local.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3')
}

/** WAVE-2026-8f72a91b… -> WAVE-2026-8f72…91b (safe to show in a table). */
export function maskToken(token: string): string {
  return token.length > 16 ? `${token.slice(0, 13)}…${token.slice(-4)}` : token
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
