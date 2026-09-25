import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'

/** What to say for each kind of failure. Never shows a stack trace. */
function describe(error: unknown): { title: string; body: string } {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404)
      return { title: 'Not found', body: "We couldn't find that. It may have been removed, or the link is wrong." }
    if (error.status === 403)
      return { title: 'No access', body: "You don't have access to this page." }
    if (error.status === 501)
      return { title: 'API not connected', body: "The dashboard isn't connected to the API yet, so there's nothing to show." }
  }
  return { title: 'Something went wrong', body: 'Try again. If it keeps happening, tell the person who runs the system.' }
}

/** Full-page version, for when there is no layout to show it inside. */
export function FatalError() {
  return (
    <main className="mx-auto max-w-lg p-6 pt-20">
      <RouteError />
    </main>
  )
}

export function RouteError() {
  const error = useRouteError()
  const { title, body } = describe(error)
  return (
    <div role="alert" className="space-y-4">
      <PageHeader title={title} description={body} />
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </div>
  )
}
