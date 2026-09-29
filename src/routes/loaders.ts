import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import {
  ApiError,
  cancelRegistration,
  getDashboard,
  getTransaction,
  getUser,
  listPasses,
  listTransactions,
  listUsers,
  recordPayment,
} from '@/lib/api'
import { AuthError, safeNext, sessionContext, signIn, signOut } from '@/lib/auth'
import { METHOD_LABELS } from '@/lib/event'
import { readPassesQuery, readTransactionsQuery, readUsersQuery } from './query'

/** Turn the API's errors into responses the route's error screen understands. */
async function call<T>(work: Promise<T>): Promise<T> {
  try {
    return await work
  } catch (error) {
    if (error instanceof ApiError) throw new Response(error.message, { status: error.status })
    throw error
  }
}

const search = (request: Request) => new URL(request.url).searchParams

// ---- pages -----------------------------------------------------------------

export const appLoader = ({ context }: LoaderFunctionArgs) => ({
  user: context.get(sessionContext),
})

export const dashboardLoader = () => call(getDashboard())

export const usersLoader = ({ request }: LoaderFunctionArgs) =>
  call(listUsers(readUsersQuery(search(request))))

export const userLoader = ({ params }: LoaderFunctionArgs) => call(getUser(params.userId ?? ''))

export const transactionsLoader = ({ request }: LoaderFunctionArgs) =>
  call(listTransactions(readTransactionsQuery(search(request))))

export const transactionLoader = ({ params }: LoaderFunctionArgs) =>
  call(getTransaction(params.reference ?? ''))

export const passesLoader = ({ request }: LoaderFunctionArgs) =>
  call(listPasses(readPassesQuery(search(request))))

// ---- actions ---------------------------------------------------------------

export type ActionResult = { ok: true; message: string } | { ok: false; error: string }

/** Record a gate payment, or cancel an unpaid registration. */
export async function userAction({ request, params }: ActionFunctionArgs): Promise<ActionResult> {
  const form = await request.formData()
  const intent = form.get('intent')
  const id = params.userId ?? ''

  try {
    if (intent === 'record-payment') {
      const method = form.get('method')
      if (method !== 'POS' && method !== 'CASH' && method !== 'BANK_TRANSFER') {
        return { ok: false, error: 'Choose a payment method.' }
      }
      await recordPayment(id, method)
      return { ok: true, message: `Payment recorded (${METHOD_LABELS[method]}).` }
    }
    if (intent === 'cancel') {
      await cancelRegistration(id)
      return { ok: true, message: 'Registration cancelled and its QR codes voided.' }
    }
    return { ok: false, error: 'Unknown action.' }
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message }
    throw error
  }
}

// Settings is commented out for now (see router.tsx), so settingsAction isn't needed either.

// ---- sign in / out ---------------------------------------------------------

export type LoginResult = { error: string; email: string } | undefined

export async function loginAction({ request }: ActionFunctionArgs): Promise<LoginResult> {
  const form = await request.formData()
  const email = String(form.get('email') ?? '').trim()
  const password = String(form.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.', email }

  try {
    await signIn(email, password)
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message, email }
    throw error
  }
  throw redirect(safeNext(String(form.get('next') ?? '')))
}

export async function logoutAction() {
  await signOut()
  return redirect('/login')
}
