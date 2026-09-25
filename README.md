# Sound Wave Admin

Staff dashboard for **Sound Wave: The Ember Prelude** (31st October, 8PM, Jinos Lounge/Club).
Sign-in only, by invitation: there is deliberately **no register page**.

Vite · React 19 · React Router (data mode) · Tailwind v4 · shadcn/ui.

## Run it

```bash
bun install
bun run dev        # http://localhost:5173, demo mode
bun run build      # typecheck + production build
bun run lint
```

## Routes

| Path | What | Who |
| --- | --- | --- |
| `/login` | Sign in. Redirects to `/` if you already are. | anyone |
| `/` | Dashboard: registrations, revenue, check-ins | signed in |
| `/users` | Registrations. `?q=&status=paid\|pending\|cancelled&kind=&page=` | signed in |
| `/users/:userId` | One person: QR codes, payments, take gate payment, cancel | signed in (cancel: admin) |
| `/transactions` | Payments. `?q=&status=&method=&page=`, CSV export | signed in |
| `/transactions/:reference` | One payment | signed in |
| `/qr-codes` | Every QR code and its check-in state. `?q=&status=&page=` | signed in |
| `/settings` | Account, theme, event and prices (read-only) | admin |
| `/payments…` | Old URLs, redirect to `/transactions…` | |
| anything else | 404 (including `/register`) | |

Every route except `/login` sits behind the auth guard in `src/routes/guards.ts`. Signed out, you are sent
to `/login?next=…` and brought back afterwards (only to paths on this site). Filters and pages live in the
URL, so any view can be bookmarked or shared.

## Demo mode

In `bun run dev` the app runs on made-up data stored in the browser (`localStorage`), with two demo accounts:

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@soundwave.test` | `admin-demo-123` |
| Gate staff | `staff@soundwave.test` | `staff-demo-123` |

These passwords are public. Demo mode is **off** in production builds unless `VITE_USE_MOCKS=true`, and it
must never be turned on where real data lives. With it off, the demo accounts and demo data are gone.

## Connecting the real API

The UI talks to one file, [`src/lib/api.ts`](src/lib/api.ts). Today every call there is a demo-mode stub; with
demo mode off they answer 501 ("API not connected") until each is replaced with a `fetch` to the backend
(`credentials: 'include'`). Sign-in already calls the real endpoints. Expected contract:

```
GET  /api/admin/auth/me            → { id, name, email, role: "admin" | "staff" }   (401 when signed out)
POST /api/admin/auth/login         { email, password }   → sets an httpOnly session cookie
POST /api/admin/auth/logout
GET  /api/admin/dashboard
GET  /api/admin/users?q=&status=&kind=&page=
GET  /api/admin/users/:id                       → user, passes, transactions
POST /api/admin/users/:id/payments { method: "POS" | "CASH" }
POST /api/admin/users/:id/cancel                (admin only, unpaid only)
GET  /api/admin/transactions?q=&status=&method=&page=
GET  /api/admin/transactions/export?q=&status=&method=      → CSV
GET  /api/admin/transactions/:reference
GET  /api/admin/passes?q=&status=&page=
```

The hiding of links and buttons by role is convenience only. The API must enforce roles and the
"unpaid only" rule itself: nothing here is a security boundary.

## Notes

- Colours and fonts follow the event flyer and the booking site: near-black, red, ember, cream. No purple.
- Environment variables are in [`.env.example`](.env.example). Only public config belongs there.
