import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { Button } from '@/components/ui/button'
import { ADMIN_NAV_ITEMS } from '@/constants/navigation'
import { useSidebarStore } from '@/state/sidebarStore'

function SidebarNav({ onNavigate }) {
  const { t } = useTranslation()

  return (
    <nav className="admin-nav-list" aria-label={t('nav.ariaLabel')}>
      {ADMIN_NAV_ITEMS.map(({ to, end, labelKey, icon: Icon }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className="admin-nav-link">
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const { t } = useTranslation()
  const mobileOpen = useSidebarStore((state) => state.mobileOpen)
  const closeMobile = useSidebarStore((state) => state.closeMobile)

  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-title">Moldy Market</span>
          <span className="admin-brand-badge">Admin</span>
        </div>
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <>
          <div className="admin-sidebar-mobile-backdrop" onClick={closeMobile} />
          <aside className="admin-sidebar-mobile" aria-label={t('nav.ariaLabel')}>
            <div className="admin-sidebar-brand">
              <div className="flex items-center gap-2">
                <span className="admin-brand-title">Moldy Market</span>
                <span className="admin-brand-badge">Admin</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closeMobile}
                aria-label={t('actions.close')}
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <SidebarNav onNavigate={closeMobile} />
          </aside>
        </>
      )}
    </>
  )
}
