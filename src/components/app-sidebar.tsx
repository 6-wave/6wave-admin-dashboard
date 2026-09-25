import { CreditCard, LayoutDashboard, QrCode, Settings, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { UserMenu } from '@/components/user-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'
import { useAdmin } from '@/lib/use-admin'
import type { AdminRole } from '@/lib/types'

const groups = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', to: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Manage',
    items: [
      { title: 'Users', to: '/users', icon: Users },
      { title: 'Transactions', to: '/transactions', icon: CreditCard },
      { title: 'QR codes', to: '/qr-codes', icon: QrCode },
    ],
  },
  {
    label: 'System',
    items: [{ title: 'Settings', to: '/settings', icon: Settings, role: 'admin' as AdminRole }],
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { role } = useAdmin()
  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/" aria-label="Sound Wave Admin, dashboard">
                {/* The sidebar is dark in both themes, so the white wordmark always fits. */}
                <span className="group-data-[collapsible=icon]:hidden">
                  <Logo onDark />
                </span>
                <img
                  src="/favicon.svg"
                  alt=""
                  className="hidden size-8 rounded-lg group-data-[collapsible=icon]:block"
                />
                <span className="ml-auto rounded bg-sidebar-primary px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wider text-sidebar-primary-foreground uppercase group-data-[collapsible=icon]:hidden">
                  Admin
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter((item) => !('role' in item) || item.role === role)
          if (items.length === 0) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map(({ title, to, icon: Icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton asChild isActive={isActive(to)} tooltip={title}>
                        <NavLink to={to}>
                          <Icon />
                          <span>{title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
