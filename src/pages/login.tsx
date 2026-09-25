import { Eye, EyeOff, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Form, useActionData, useNavigation, useSearchParams } from 'react-router'
import { Beams } from '@/components/beams'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_ACCOUNTS } from '@/lib/auth'
import { EVENT } from '@/lib/event'
import { USE_MOCKS } from '@/lib/config'
import type { LoginResult } from '@/routes/loaders'

/**
 * Sign in only. There is no register page and no self-service sign-up: admin
 * accounts are created by an administrator on the server.
 */
export function LoginPage() {
  const result = useActionData() as LoginResult
  const navigation = useNavigation()
  const [params] = useSearchParams()
  const submitting = navigation.state === 'submitting'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_115%,oklch(0.42_0.19_27/0.85),transparent_60%),radial-gradient(ellipse_at_80%_-10%,oklch(0.35_0.16_27/0.6),transparent_55%)]"
        />
        <Beams />
        <Logo onDark className="relative h-7" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.42em] text-white/80 uppercase">AMG presents</p>
          <h2 className="mt-3 bg-linear-to-b from-red to-[oklch(0.5_0.22_27)] bg-clip-text font-poster text-[8rem] leading-[0.84] tracking-tight text-transparent uppercase drop-shadow-[0_0_30px_oklch(0.58_0.235_27/0.55)]">
            Sound
            <br />
            Wave
          </h2>
          <p className="mt-2 -rotate-3 font-script text-5xl text-cream">{EVENT.subtitle}</p>
        </div>
        <p className="relative text-sm text-white/70">
          Admin console · {EVENT.date}, {EVENT.time} · {EVENT.venue}
        </p>
      </aside>

      {/* Form */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-4 lg:hidden">
            <Logo />
            <p className="font-poster text-4xl tracking-wide uppercase">
              Sound Wave <span className="text-primary">Admin</span>
            </p>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">Use the account an administrator set up for you.</p>
          </div>

          <Form method="post" className="space-y-5" noValidate>
            <input type="hidden" name="next" value={params.get('next') ?? ''} />

            {result?.error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {result.error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={result?.error ? true : undefined}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={reveal ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="h-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={result?.error ? true : undefined}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
                  aria-label={reveal ? 'Hide password' : 'Show password'}
                  aria-pressed={reveal}
                  onClick={() => setReveal((v) => !v)}
                >
                  {reveal ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <Button type="submit" size="lg" className="h-10 w-full text-sm" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Access is by invitation. Need an account? Ask an administrator.
          </p>

          {USE_MOCKS ? (
            <div className="space-y-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Demo mode</p>
              <p>These accounts only work here, on demo data. Tap one to fill the form.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                    }}
                  >
                    {account.role === 'admin' ? 'Admin' : 'Gate staff'}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
