import { ArrowUpRight, BanknoteArrowUp, ShieldAlert, TicketPercent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'

const MODULES = [
  {
    to: '/disputes',
    icon: ShieldAlert,
    titleKey: 'disputes.title',
    descKey: 'disputes.subtitle',
    pathLabel: '/disputes',
  },
  {
    to: '/withdrawals',
    icon: BanknoteArrowUp,
    titleKey: 'withdrawals.title',
    descKey: 'withdrawals.subtitle',
    pathLabel: '/withdrawals',
  },
  {
    to: '/vouchers',
    icon: TicketPercent,
    titleKey: 'vouchers.title',
    descKey: 'vouchers.subtitle',
    pathLabel: '/vouchers',
  },
]

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <section className="admin-page" aria-labelledby="dashboard-heading">
      <PageHeader
        headingId="dashboard-heading"
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
      />

      <div className="admin-hub-grid">
        {MODULES.map(({ to, icon: Icon, titleKey, descKey, pathLabel }) => (
          <article key={to} className="admin-hub-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="admin-feedback-icon mb-0">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">{pathLabel}</span>
              </div>
              <h2 className="admin-card-title pt-1">{t(titleKey)}</h2>
              <p className="text-sm text-muted-foreground">{t(descKey)}</p>
            </div>

            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to={to}>
                <span>{t('dashboard.openModule')}</span>
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}
