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
  resetDemoData,
} from '@/lib/api'
import { AuthError, safeNext, sessionContext, signIn, signOut } from '@/lib/auth'
import { assertRole } from './guards'
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

/** Settings are for admins; staff get the 403 screen inside the layout. */
export const settingsLoader = ({ context }: LoaderFunctionArgs) => {
  assertRole(context, 'admin')
  return null
}

// ---- actions ---------------------------------------------------------------

export type ActionResult = { ok: true; message: string } | { ok: false; error: string }

/** Record a gate payment, or cancel an unpaid registration. */
export async function userAction({
  request,
  params,
  context,
}: ActionFunctionArgs): Promise<ActionResult> {
  const admin = context.get(sessionContext)
  const form = await request.formData()
  const intent = form.get('intent')
  const id = params.userId ?? ''

  try {
    if (intent === 'record-payment') {
      const method = form.get('method')
      if (method !== 'POS' && method !== 'CASH') return { ok: false, error: 'Choose POS or cash.' }
      await recordPayment(id, method, admin.name)
      return { ok: true, message: `Payment recorded (${method === 'POS' ? 'POS' : 'cash'}).` }
    }
    if (intent === 'cancel') {
      // Cancelling voids the QR codes, so it stays with admins.
      if (admin.role !== 'admin') return { ok: false, error: 'Only admins can cancel a registration.' }
      await cancelRegistration(id)
      return { ok: true, message: 'Registration cancelled and its QR codes voided.' }
    }
    return { ok: false, error: 'Unknown action.' }
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message }
    throw error
  }
}

export async function settingsAction({ request, context }: ActionFunctionArgs): Promise<ActionResult> {
  if (context.get(sessionContext).role !== 'admin') return { ok: false, error: 'Admins only.' }
  const form = await request.formData()
  if (form.get('intent') === 'reset-demo') {
    try {
      await resetDemoData()
      return { ok: true, message: 'Demo data reset.' }
    } catch (error) {
      if (error instanceof ApiError) return { ok: false, error: error.message }
      throw error
    }
  }
  return { ok: false, error: 'Unknown action.' }
}

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
