import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/state/sidebarStore'

export function AdminHeader() {
  const { t } = useTranslation()
  const toggleMobile = useSidebarStore((state) => state.toggleMobile)

  return (
    <header className="admin-header">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={toggleMobile}
          aria-label={t('nav.openMenu')}
        >
          <Menu aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">{t('app.name')}</span>
      </div>

      <LanguageSwitcher />
    </header>
  )
}
