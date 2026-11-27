import { useMemo, useState } from 'react'
import { CheckCircle2, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { TableSkeleton } from '@/components/feedback/TableSkeleton'
import { Button } from '@/components/ui/button'
import { WithdrawalActionDialog } from '@/features/withdrawals/components/WithdrawalActionDialog'
import { WithdrawalTable } from '@/features/withdrawals/components/WithdrawalTable'
import {
  useAdminWithdrawals,
  useWithdrawalAction,
} from '@/features/withdrawals/hooks/useAdminWithdrawals'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

const FILTER_TABS = [
  { key: 'ALL', match: () => true },
  { key: 'REQUESTED', match: (w) => w.status === 'REQUESTED' },
  { key: 'PROCESSING', match: (w) => w.status === 'PROCESSING' },
  { key: 'COMPLETED', match: (w) => w.status === 'COMPLETED' },
  {
    key: 'CLOSED',
    match: (w) => w.status === 'REJECTED' || w.status === 'FAILED' || w.status === 'CANCELLED',
  },
]

export function AdminWithdrawalsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    data: withdrawals = [],
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminWithdrawals()
  const actionMutation = useWithdrawalAction()

  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of FILTER_TABS) {
      counts[tab.key] = withdrawals.filter(tab.match).length
    }
    return counts
  }, [withdrawals])

  const filteredWithdrawals = useMemo(() => {
    const currentTab = FILTER_TABS.find((tab) => tab.key === activeTab) ?? FILTER_TABS[0]
    const keyword = search.trim().toLowerCase()

    return withdrawals.filter(currentTab.match).filter((item) => {
      if (!keyword) return true
      return (
        String(item.id).includes(keyword) ||
        (item.bankName ?? '').toLowerCase().includes(keyword) ||
        (item.bankAccountHolder ?? '').toLowerCase().includes(keyword) ||
        (item.maskedBankAccountNumber ?? '').toLowerCase().includes(keyword)
      )
    })
  }, [withdrawals, activeTab, search])

  function handleSelectAction(payload) {
    actionMutation.reset()
    setSuccessMessage('')
    setPendingAction(payload)
  }

  async function handleConfirmAction(reason) {
    if (!pendingAction) return
    await actionMutation.mutateAsync({
      action: pendingAction.action,
      withdrawalId: pendingAction.withdrawal.id,
      reason,
    })
    setSuccessMessage(
      t(`withdrawals.success.${pendingAction.action}`, { id: pendingAction.withdrawal.id }),
    )
    setPendingAction(null)
  }

  if (error?.status === 403) {
    return <ForbiddenState />
  }

  return (
    <section className="admin-page" aria-labelledby="admin-withdrawals-heading">
      <PageHeader
        headingId="admin-withdrawals-heading"
        title={t('withdrawals.title')}
        description={t('withdrawals.subtitle')}
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

      {successMessage && (
        <div role="status" className="admin-alert admin-alert-success">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label={t('withdrawals.tabsLabel')}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="admin-tab"
            >
              <span>{t(`withdrawals.tabs.${tab.key}`)}</span>
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
            aria-label={t('withdrawals.searchPlaceholder')}
            placeholder={t('withdrawals.searchPlaceholder')}
            className="kn-input admin-search-input"
          />
        </div>
      </div>

      {isPending ? (
        <TableSkeleton rows={5} columns={6} />
      ) : isError ? (
        <ErrorState
          title={t('withdrawals.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : filteredWithdrawals.length === 0 ? (
        <EmptyState
          title={t('withdrawals.emptyTitle')}
          description={t('withdrawals.emptyDescription')}
        />
      ) : (
        <WithdrawalTable withdrawals={filteredWithdrawals} onSelectAction={handleSelectAction} />
      )}

      <WithdrawalActionDialog
        pendingAction={pendingAction}
        isSubmitting={actionMutation.isPending}
        submitError={actionMutation.error}
        onConfirm={handleConfirmAction}
        onClose={() => {
          actionMutation.reset()
          setPendingAction(null)
        }}
      />
    </section>
  )
}
