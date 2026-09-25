/** Base URL of the ASP.NET Core API. Public config only: never put secrets here. */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Demo mode: fake data and demo sign-in accounts, all in the browser. On by
 * default in development, off in production builds unless VITE_USE_MOCKS=true.
 * Never turn it on for a deployment that holds real data: the demo passwords
 * are public.
 */
export const USE_MOCKS: boolean =
  import.meta.env.VITE_USE_MOCKS === undefined
    ? import.meta.env.DEV
    : import.meta.env.VITE_USE_MOCKS === 'true'
