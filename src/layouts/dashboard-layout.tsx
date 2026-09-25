import { Fragment } from 'react'
import { Link, Outlet, useMatches } from 'react-router'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ThemeToggle } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import type { RouteHandle } from '@/routes/handle'

export function DashboardLayout() {
  const matches = useMatches()

  // Each route can name itself in the breadcrumb: a string, or a function of its loader data.
  const crumbs = matches.flatMap((match) => {
    const crumb = (match.handle as RouteHandle | undefined)?.crumb
    if (!crumb) return []
    return [{ to: match.pathname, label: typeof crumb === 'function' ? crumb(match.loaderData) : crumb }]
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 data-vertical:self-center" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <Fragment key={crumb.to}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {index === crumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.to}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        {/* SidebarInset is already the page's <main>. */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
