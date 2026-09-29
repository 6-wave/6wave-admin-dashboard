# Sound Wave Admin

Admin dashboard for **Sound Wave: The Ember Prelude** (31st October, 8PM, Jinos Lounge/Club).
One kind of account: admin. Sign-in only, by invitation: there is deliberately **no register page**.

Vite · React 19 · React Router (data mode) · Tailwind v4 · shadcn/ui.

## Run it

```bash
bun install
bun run dev        # http://localhost:5173 — needs the backend running too, see .env.example
bun run build      # typecheck + production build
bun run lint
```

## Routes

| Path | What |
| --- | --- |
| `/login` | Sign in. Redirects to `/` if you already are. |
| `/` | Dashboard: registrations, revenue, check-ins |
| `/users` | Registrations. `?q=&status=paid\|pending\|cancelled&kind=&page=` |
| `/users/:userId` | One person: QR codes, payments, take gate payment, cancel |
| `/transactions` | Payments. `?q=&status=&method=&page=`, CSV export |
| `/transactions/:reference` | One payment |
| `/qr-codes` | Every QR code and its check-in state. `?q=&status=&page=` |
| `/settings` | Commented out for now (see `router.tsx`), not built yet |
| `/payments…` | Old URLs, redirect to `/transactions…` |
| anything else | 404 (including `/register`) |

Every route except `/login` sits behind the auth guard in `src/routes/guards.ts`. Signed out, you are sent
to `/login?next=…` and brought back afterwards (only to paths on this site). Filters and pages live in the
URL, so any view can be bookmarked or shared.

## The real API

There is no mock/demo mode anymore — the app always talks to the real backend. All network access goes
through [`src/lib/api.ts`](src/lib/api.ts) and [`src/lib/auth.ts`](src/lib/auth.ts) (`credentials: 'include'`
on every call, so the admin session cookie is sent). Set `VITE_API_BASE_URL` (see
[`.env.example`](.env.example)) to point it at the backend. Contract:

```
GET  /api/admin/auth/me            → { id, name, email }   (401 when signed out)
POST /api/admin/auth/login         { email, password }   → sets an httpOnly session cookie
POST /api/admin/auth/logout
GET  /api/admin/dashboard
GET  /api/admin/users?q=&status=&kind=&page=
GET  /api/admin/users/:id                       → user, passes, transactions
POST /api/admin/users/:id/payments { method: "POS" | "CASH" | "BANK_TRANSFER" }
POST /api/admin/users/:id/cancel                (unpaid only)
GET  /api/admin/transactions?q=&status=&method=&page=
GET  /api/admin/transactions/export?q=&status=&method=      → CSV
GET  /api/admin/transactions/:reference
GET  /api/admin/passes?q=&status=&page=
```

The API checks the session on every request and enforces the "unpaid only" rule itself: nothing here
is a security boundary.

## Notes

- Colours and fonts follow the event flyer and the booking site: near-black, red, ember, cream. No purple.
- Environment variables are in [`.env.example`](.env.example). Only public config belongs there.
