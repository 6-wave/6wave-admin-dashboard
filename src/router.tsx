import { createBrowserRouter, redirect } from 'react-router'
import { AppLoading } from '@/components/app-loading'
import { FatalError, RouteError } from '@/components/route-error'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { QrCodesPage } from '@/pages/qr-codes'
import { SettingsPage } from '@/pages/settings'
import { TransactionDetailPage } from '@/pages/transaction-detail'
import { TransactionsPage } from '@/pages/transactions'
import { UserDetailPage } from '@/pages/user-detail'
import { UsersPage } from '@/pages/users'
import type { TransactionRow, UserDetail } from '@/lib/types'
import { requireAuth, redirectIfSignedIn } from '@/routes/guards'
import type { RouteHandle } from '@/routes/handle'
import {
  appLoader,
  dashboardLoader,
  loginAction,
  logoutAction,
  passesLoader,
  settingsAction,
  transactionLoader,
  transactionsLoader,
  userAction,
  userLoader,
  usersLoader,
} from '@/routes/loaders'

/*
 * Route map
 *
 *   /login                        sign in (the only public page; no register page exists)
 *   /logout                       POST only: signs out
 *   /                             dashboard
 *   /users                        people who registered (?q= &status= &kind= &page=)
 *   /users/:userId                one person: passes, payments, gate actions
 *   /transactions                 all payments (?q= &status= &method= &page=)
 *   /transactions/:reference      one payment
 *   /qr-codes                     every QR code and its check-in state (?q= &status= &page=)
 *   /settings                     account, theme, event and prices
 *   /payments[/:reference]        old URLs, redirected to /transactions
 *   anything else                 404 (this includes /register)
 *
 * Everything except /login sits behind the auth guard (routes/guards.ts).
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    middleware: [redirectIfSignedIn],
    action: loginAction,
    Component: LoginPage,
    ErrorBoundary: FatalError,
    HydrateFallback: AppLoading,
  },
  {
    path: '/logout',
    action: logoutAction,
    loader: () => redirect('/'),
  },
  {
    id: 'app',
    path: '/',
    middleware: [requireAuth],
    loader: appLoader,
    Component: DashboardLayout,
    // Only reached when the layout itself can't load (e.g. the session check fails).
    ErrorBoundary: FatalError,
    HydrateFallback: AppLoading,
    children: [
      {
        // Errors show inside the layout, so the sidebar stays put.
        ErrorBoundary: RouteError,
        children: [
          {
            index: true,
            loader: dashboardLoader,
            Component: DashboardPage,
            handle: { crumb: 'Dashboard' } satisfies RouteHandle,
          },
          {
            path: 'users',
            handle: { crumb: 'Users' } satisfies RouteHandle,
            children: [
              { index: true, loader: usersLoader, Component: UsersPage },
              {
                path: ':userId',
                loader: userLoader,
                action: userAction,
                Component: UserDetailPage,
                handle: { crumb: (data) => (data as UserDetail).user.fullName } satisfies RouteHandle,
              },
            ],
          },
          {
            path: 'transactions',
            handle: { crumb: 'Transactions' } satisfies RouteHandle,
            children: [
              { index: true, loader: transactionsLoader, Component: TransactionsPage },
              {
                path: ':reference',
                loader: transactionLoader,
                Component: TransactionDetailPage,
                handle: { crumb: (data) => (data as TransactionRow).reference } satisfies RouteHandle,
              },
            ],
          },
          {
            path: 'qr-codes',
            loader: passesLoader,
            Component: QrCodesPage,
            handle: { crumb: 'QR codes' } satisfies RouteHandle,
          },
          {
            path: 'settings',
            action: settingsAction,
            Component: SettingsPage,
            handle: { crumb: 'Settings' } satisfies RouteHandle,
          },
          { path: 'payments', loader: () => redirect('/transactions') },
          { path: 'payments/:reference', loader: ({ params }) => redirect(`/transactions/${params.reference ?? ''}`) },
          { path: '*', Component: NotFoundPage, handle: { crumb: 'Not found' } satisfies RouteHandle },
        ],
      },
    ],
  },
])
