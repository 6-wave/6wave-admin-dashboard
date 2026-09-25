import { ChevronsUpDown, LogOut } from 'lucide-react'
import { Form } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { initials } from '@/lib/format'
import { useAdmin } from '@/lib/use-admin'

/** Who's signed in, and the way out. Sign-out is a POST so a stray link can't trigger it. */
export function UserMenu() {
  const user = useAdmin()
  const { isMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Form id="sign-out" method="post" action="/logout" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs capitalize text-sidebar-foreground/60">{user.role}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" className="min-w-56">
            <DropdownMenuLabel className="space-y-1">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button type="submit" form="sign-out" className="w-full">
                <LogOut /> Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
