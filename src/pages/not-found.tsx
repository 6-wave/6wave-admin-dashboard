import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'

export function NotFoundPage() {
  return (
    <PageHeader
      title="Page not found"
      description="That page doesn't exist."
      actions={
        <Button asChild>
          <Link to="/">Back to dashboard</Link>
        </Button>
      }
    />
  )
}
