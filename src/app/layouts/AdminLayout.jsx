import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { RouteLoading } from '@/components/feedback/RouteLoading'
import { AdminHeader } from '@/components/navigation/AdminHeader'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'

export function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-shell-main">
        <AdminHeader />
        <main className="admin-content">
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
