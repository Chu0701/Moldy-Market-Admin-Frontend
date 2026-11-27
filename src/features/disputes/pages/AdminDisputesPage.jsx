import { useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { TableSkeleton } from '@/components/feedback/TableSkeleton'
import { Button } from '@/components/ui/button'
import { DisputeTable } from '@/features/disputes/components/DisputeTable'
import { useAdminDisputes } from '@/features/disputes/hooks/useAdminDisputes'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'
import { isDisputeReviewable } from '@/services/disputes/adminDisputeService'

const FILTER_TABS = [
  { key: 'ALL', match: () => true },
  { key: 'PENDING', match: (d) => isDisputeReviewable(d.status) },
  { key: 'APPROVED', match: (d) => d.status === 'APPROVED' },
  { key: 'REJECTED', match: (d) => d.status === 'REJECTED' },
  { key: 'CANCELLED', match: (d) => d.status === 'CANCELLED' },
]

export function AdminDisputesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: disputes = [], isPending, isFetching, isError, error, refetch } = useAdminDisputes()

  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of FILTER_TABS) {
      counts[tab.key] = disputes.filter(tab.match).length
    }
    return counts
  }, [disputes])

  const filteredDisputes = useMemo(() => {
    const currentTab = FILTER_TABS.find((tab) => tab.key === activeTab) ?? FILTER_TABS[0]
    const keyword = search.trim().toLowerCase()

    return disputes
      .filter(currentTab.match)
      .filter((dispute) => {
        if (!keyword) return true
        const orderCode = (dispute.orderCode ?? '').toLowerCase()
        const title = (dispute.firstItemTitle ?? '').toLowerCase()
        const reason = (dispute.reason ?? '').toLowerCase()
        return orderCode.includes(keyword) || title.includes(keyword) || reason.includes(keyword)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [disputes, activeTab, search])

  if (error?.status === 403) {
    return <ForbiddenState />
  }

  return (
    <section className="admin-page" aria-labelledby="admin-disputes-heading">
      <PageHeader
        headingId="admin-disputes-heading"
        title={t('disputes.title')}
        description={t('disputes.subtitle')}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              aria-hidden="true"
              className={cn('size-3.5', isFetching && 'animate-spin')}
            />
            {t('actions.refresh')}
          </Button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label={t('disputes.tabsLabel')}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="admin-tab"
            >
              <span>{t(`disputes.tabs.${tab.key}`)}</span>
              <span className="admin-tab-count">{tabCounts[tab.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="admin-search-wrap">
          <Search aria-hidden="true" className="admin-search-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label={t('disputes.searchPlaceholder')}
            placeholder={t('disputes.searchPlaceholder')}
            className="kn-input admin-search-input"
          />
        </div>
      </div>

      {isPending ? (
        <TableSkeleton rows={5} columns={6} />
      ) : isError ? (
        <ErrorState
          title={t('disputes.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : filteredDisputes.length === 0 ? (
        <EmptyState title={t('disputes.emptyTitle')} description={t('disputes.emptyDescription')} />
      ) : (
        <DisputeTable disputes={filteredDisputes} />
      )}
    </section>
  )
}
