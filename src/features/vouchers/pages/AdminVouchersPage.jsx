import { useMemo, useState } from 'react'
import { CheckCircle2, Plus, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { TableSkeleton } from '@/components/feedback/TableSkeleton'
import { Button } from '@/components/ui/button'
import { PlatformVoucherForm } from '@/features/vouchers/components/PlatformVoucherForm'
import { VoucherTable } from '@/features/vouchers/components/VoucherTable'
import {
  useAdminVouchers,
  useCreatePlatformVoucher,
} from '@/features/vouchers/hooks/useAdminVouchers'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

const FILTER_TABS = [
  { key: 'ALL', match: () => true },
  { key: 'PLATFORM', match: (v) => v.issuer === 'PLATFORM' },
  { key: 'STORE', match: (v) => v.issuer === 'STORE' },
]

export function AdminVouchersPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: vouchers = [], isPending, isFetching, isError, error, refetch } = useAdminVouchers()
  const createMutation = useCreatePlatformVoucher()

  const tabCounts = useMemo(() => {
    const counts = {}
    for (const tab of FILTER_TABS) {
      counts[tab.key] = vouchers.filter(tab.match).length
    }
    return counts
  }, [vouchers])

  const filteredVouchers = useMemo(() => {
    const currentTab = FILTER_TABS.find((tab) => tab.key === activeTab) ?? FILTER_TABS[0]
    const keyword = search.trim().toLowerCase()

    return vouchers
      .filter(currentTab.match)
      .filter((voucher) => {
        if (!keyword) return true
        return (voucher.code ?? '').toLowerCase().includes(keyword)
      })
      .sort((a, b) => new Date(b.expiredAt).getTime() - new Date(a.expiredAt).getTime())
  }, [vouchers, activeTab, search])

  async function handleCreateVoucher(payload) {
    setSuccessMessage('')
    const created = await createMutation.mutateAsync(payload)
    setShowCreateForm(false)
    setSuccessMessage(t('vouchers.createSuccess', { code: created?.code ?? payload.code }))
  }

  if (error?.status === 403) {
    return <ForbiddenState />
  }

  return (
    <section className="admin-page" aria-labelledby="admin-vouchers-heading">
      <PageHeader
        headingId="admin-vouchers-heading"
        title={t('vouchers.title')}
        description={t('vouchers.subtitle')}
        actions={
          <>
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
            <Button
              type="button"
              size="sm"
              onClick={() => {
                createMutation.reset()
                setSuccessMessage('')
                setShowCreateForm((prev) => !prev)
              }}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              {t('vouchers.actions.create')}
            </Button>
          </>
        }
      />

      {successMessage && (
        <div role="status" className="admin-alert admin-alert-success">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {showCreateForm && (
        <PlatformVoucherForm
          isSubmitting={createMutation.isPending}
          submitError={createMutation.error}
          onSubmitVoucher={handleCreateVoucher}
          onCancel={() => {
            createMutation.reset()
            setShowCreateForm(false)
          }}
        />
      )}

      <div className="admin-toolbar">
        <div className="admin-tabs" role="tablist" aria-label={t('vouchers.tabsLabel')}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="admin-tab"
            >
              <span>{t(`vouchers.tabs.${tab.key}`)}</span>
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
            aria-label={t('vouchers.searchPlaceholder')}
            placeholder={t('vouchers.searchPlaceholder')}
            className="kn-input admin-search-input"
          />
        </div>
      </div>

      {isPending ? (
        <TableSkeleton rows={5} columns={7} />
      ) : isError ? (
        <ErrorState
          title={t('vouchers.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : filteredVouchers.length === 0 ? (
        <EmptyState title={t('vouchers.emptyTitle')} description={t('vouchers.emptyDescription')} />
      ) : (
        <VoucherTable vouchers={filteredVouchers} />
      )}
    </section>
  )
}
