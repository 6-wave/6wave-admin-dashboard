import { cn } from '@/lib/utils'

const BEAMS = [
  { left: '14%', from: '-22deg', to: '10deg', color: 'from-red/60', dur: '7s', delay: '0s' },
  { left: '38%', from: '16deg', to: '-14deg', color: 'from-ember/45', dur: '9s', delay: '-3s' },
  { left: '62%', from: '-12deg', to: '20deg', color: 'from-red/55', dur: '8s', delay: '-5s' },
  { left: '86%', from: '18deg', to: '-18deg', color: 'from-ember/40', dur: '10s', delay: '-2s' },
]

/** Laser beams that sweep, in CSS only. Red and ember only: red and blue light would mix into purple. */
export function Beams({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {BEAMS.map((beam) => (
        <span
          key={beam.left}
          className={cn(
            'absolute -top-6 h-[170%] w-44 origin-top animate-beam bg-linear-to-b to-transparent [animation-fill-mode:both] [clip-path:polygon(47%_0,53%_0,100%_100%,0_100%)]',
            beam.color,
          )}
          style={
            {
              left: beam.left,
              '--from': beam.from,
              '--to': beam.to,
              animationDuration: beam.dur,
              animationDelay: beam.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
