import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { TableSkeleton } from '@/components/feedback/TableSkeleton'
import { Button } from '@/components/ui/button'
import { UserStatusDialog } from '@/features/users/components/UserStatusDialog'
import { UserTable } from '@/features/users/components/UserTable'
import { useAdminUsers, useChangeUserStatus } from '@/features/users/hooks/useAdminUsers'
import { cn } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'
import { USER_ROLES, USER_STATUSES } from '@/services/users/adminUserService'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 400

/** Đọc bộ lọc từ URL một cách chặt chẽ: giá trị lạ thì bỏ qua, page sai thì về 1. */
function parseFilters(searchParams) {
  const status = searchParams.get('status')
  const role = searchParams.get('role')
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10)
  return {
    keyword: searchParams.get('keyword') ?? '',
    status: USER_STATUSES.includes(status) ? status : '',
    role: USER_ROLES.includes(role) ? role : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const [keywordInput, setKeywordInput] = useState(filters.keyword)
  const [pendingAction, setPendingAction] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { data, isPending, isFetching, isError, error, refetch } = useAdminUsers({
    ...filters,
    size: PAGE_SIZE,
  })
  const changeStatus = useChangeUserStatus()

  /** Đổi bộ lọc → luôn quay về trang 1; xóa param rỗng để URL gọn. */
  function updateFilters(patch) {
    const next = { ...filters, page: 1, ...patch }
    const params = new URLSearchParams()
    if (next.keyword) params.set('keyword', next.keyword)
    if (next.status) params.set('status', next.status)
    if (next.role) params.set('role', next.role)
    if (next.page > 1) params.set('page', String(next.page))
    setSearchParams(params, { replace: true })
  }

  // Debounce ô tìm kiếm để không gọi API mỗi lần gõ phím
  useEffect(() => {
    if (keywordInput.trim() === filters.keyword) return undefined
    const timer = setTimeout(() => updateFilters({ keyword: keywordInput.trim() }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInput])

  function openDialog(action, user) {
    changeStatus.reset()
    setSuccessMessage('')
    setPendingAction({ action, user })
  }

  async function handleConfirm(payload) {
    const { action, user } = pendingAction
    await changeStatus.mutateAsync({ action, userId: user.id, ...payload })
    setPendingAction(null)
    setSuccessMessage(t(`users.${action}Success`, { name: user.fullName }))
  }

  if (error?.status === 403) {
    return <ForbiddenState />
  }

  const users = data?.content ?? []
  const total = data?.totalElements
  const totalPages = total != null ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null

  return (
    <section className="admin-page" aria-labelledby="admin-users-heading">
      <PageHeader
        headingId="admin-users-heading"
        title={t('users.title')}
        description={t('users.subtitle')}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw aria-hidden="true" className={cn('size-3.5', isFetching && 'animate-spin')} />
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
        <div className="admin-filter-group">
          <select
            aria-label={t('users.filters.status')}
            value={filters.status}
            onChange={(event) => updateFilters({ status: event.target.value })}
            className="kn-input admin-select"
          >
            <option value="">{t('users.filters.allStatuses')}</option>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`users.status.${status}`)}
              </option>
            ))}
          </select>
          <select
            aria-label={t('users.filters.role')}
            value={filters.role}
            onChange={(event) => updateFilters({ role: event.target.value })}
            className="kn-input admin-select"
          >
            <option value="">{t('users.filters.allRoles')}</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`users.roles.${role}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-search-wrap">
          <Search aria-hidden="true" className="admin-search-icon" />
          <input
            type="search"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            aria-label={t('users.searchPlaceholder')}
            placeholder={t('users.searchPlaceholder')}
            className="kn-input admin-search-input"
          />
        </div>
      </div>

      {isPending ? (
        <TableSkeleton rows={8} columns={7} />
      ) : isError ? (
        <ErrorState
          title={t('users.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : users.length === 0 ? (
        <EmptyState title={t('users.emptyTitle')} description={t('users.emptyDescription')} />
      ) : (
        <>
          <UserTable
            users={users}
            onLock={(user) => openDialog('lock', user)}
            onUnlock={(user) => openDialog('unlock', user)}
          />

          <nav className="admin-pagination" aria-label={t('users.pagination.label')}>
            <span>
              {totalPages != null
                ? t('users.pagination.summary', { page: filters.page, totalPages, total })
                : t('users.pagination.pageOnly', { page: filters.page })}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={filters.page <= 1 || isFetching}
                onClick={() => updateFilters({ ...filters, page: filters.page - 1 })}
              >
                <ChevronLeft aria-hidden="true" className="size-3.5" />
                {t('users.pagination.prev')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data?.hasNext || isFetching}
                onClick={() => updateFilters({ ...filters, page: filters.page + 1 })}
              >
                {t('users.pagination.next')}
                <ChevronRight aria-hidden="true" className="size-3.5" />
              </Button>
            </div>
          </nav>
        </>
      )}

      <UserStatusDialog
        pendingAction={pendingAction}
        isSubmitting={changeStatus.isPending}
        submitError={changeStatus.error}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />
    </section>
  )
}