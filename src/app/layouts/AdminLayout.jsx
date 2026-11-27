import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  AlertTriangle,
  Wallet,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/state/authStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    badge: null,
  },
  {
    title: 'Stores',
    href: '/stores',
    icon: Store,
    badge: null,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    badge: null,
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
    badge: null,
  },
  {
    title: 'Disputes',
    href: '/disputes',
    icon: AlertTriangle,
    badge: 'Urgent',
  },
  {
    title: 'Finance & Payouts',
    href: '/finance',
    icon: Wallet,
    badge: null,
  },
]

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get current section title from URL
  const currentNav = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.href),
  ) || { title: 'Admin Portal' }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD'

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30 border-r border-border bg-card">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-border">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
            MM
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-foreground font-heading">
              Moldy Market
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Shield className="size-3 text-emerald-600" /> Admin Workspace
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Core Modules
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                      item.badge === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* User footer & logout */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-card">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="size-9 bg-primary/10 text-primary font-semibold text-xs shrink-0">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || 'admin@moldy.market'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            title="Log out"
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card border-r border-border p-4 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  MM
                </div>
                <span className="font-semibold text-foreground">Moldy Admin</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-4 flex-1 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </div>
                  </NavLink>
                )
              })}
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="size-4" /> Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-20 bg-background/90 backdrop-blur-xs border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="size-3.5" />
              <span className="font-medium text-foreground">
                {currentNav.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Live Gateway
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
