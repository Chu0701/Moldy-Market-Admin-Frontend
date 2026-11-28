import { useState } from 'react'
import { AlertTriangle, ArrowLeft, CheckCircle2, Lock, LockOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { CopyableId } from '@/components/common/CopyableId'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { Button } from '@/components/ui/button'
import { UserStatusDialog } from '@/features/users/components/UserStatusDialog'
import { UserStatusHistory } from '@/features/users/components/UserStatusHistory'
import {
  useAdminUserDetail,
  useAdminUserStatusHistory,
  useChangeUserStatus,
} from '@/features/users/hooks/useAdminUsers'
import { formatDateTime } from '@/lib/formatters'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

export function AdminUserDetailPage() {
  const { userId } = useParams()
  const { t, i18n } = useTranslation()
  const [pendingAction, setPendingAction] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: user, isPending, isFetching, isError, error, refetch } = useAdminUserDetail(userId)
  const history = useAdminUserStatusHistory(userId)
  const changeStatus = useChangeUserStatus()

  function openDialog(action) {
    changeStatus.reset()
    setSuccessMessage('')
    setPendingAction({ action, user })
  }

  async function handleConfirm(payload) {
    const { action } = pendingAction
    await changeStatus.mutateAsync({ action, userId, ...payload })
    setPendingAction(null)
    setSuccessMessage(t(`users.${action}Success`, { name: user.fullName }))
  }

  if (error?.status === 403) {
    return <ForbiddenState />
  }

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 justify-self-start">
      <Link to="/users">
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('users.detail.backToList')}
      </Link>
    </Button>
  )

  if (isPending) {
    return (
      <section className="admin-page" aria-busy="true">
        <div className="skeleton-shimmer h-8 w-56 rounded" />
        <div className="admin-detail-grid">
          <div className="skeleton-shimmer h-72 rounded-lg lg:col-span-2" />
          <div className="skeleton-shimmer h-72 rounded-lg" />
        </div>
      </section>
    )
  }

  if (isError || !user) {
    return (
      <section className="admin-page">
        {backLink}
        <ErrorState
          title={t('users.detail.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </section>
    )
  }

  const openOrders = (user.openOrdersAsBuyer ?? 0) + (user.openOrdersAsSeller ?? 0)

  return (
    <section className="admin-page" aria-labelledby="user-detail-heading">
      <div className="space-y-2">
        {backLink}
        <PageHeader
          headingId="user-detail-heading"
          title={user.fullName}
          description={user.email}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge type="user" value={user.status} />
              {user.canLock && (
                <Button type="button" variant="destructive" size="sm" onClick={() => openDialog('lock')}>
                  <Lock aria-hidden="true" className="size-3.5" />
                  {t('users.actions.lock')}
                </Button>
              )}
              {user.canUnlock && (
                <Button type="button" variant="outline" size="sm" onClick={() => openDialog('unlock')}>
                  <LockOpen aria-hidden="true" className="size-3.5" />
                  {t('users.actions.unlock')}
                </Button>
              )}
            </div>
          }
        />
      </div>

      {successMessage && (
        <div role="status" className="admin-alert admin-alert-success">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {user.lock && (
        <div role="note" className="admin-alert admin-alert-error">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{t('users.detail.lockedBanner')}</p>
            <p>{user.lock.reason}</p>
            <p className="text-xs">
              {t('users.detail.historyBy', {
                name: user.lock.lockedBy?.fullName || user.lock.lockedBy?.email || '—',
                time: formatDateTime(user.lock.lockedAt, i18n.language),
              })}
            </p>
          </div>
        </div>
      )}

      {openOrders > 0 && (
        <div role="note" className="admin-alert admin-alert-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {t('users.detail.openOrdersWarning', {
              buyer: user.openOrdersAsBuyer,
              seller: user.openOrdersAsSeller,
            })}
          </span>
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <section className="admin-card">
            <h2 className="admin-card-title">{t('users.detail.infoTitle')}</h2>
            <dl className="admin-dl mt-4">
              <div>
                <dt>{t('users.detail.userId')}</dt>
                <dd>
                  <CopyableId value={user.id} truncate={false} />
                </dd>
              </div>
              <div>
                <dt>{t('users.columns.phone')}</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
              <div>
                <dt>{t('users.columns.roles')}</dt>
                <dd>
                  {(user.roles ?? []).map((role) => t(`users.roles.${role}`, { defaultValue: role })).join(', ') ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt>{t('users.columns.trustPoints')}</dt>
                <dd>{user.trustPoints ?? 0}</dd>
              </div>
              <div>
                <dt>{t('users.columns.createdAt')}</dt>
                <dd>{formatDateTime(user.createdAt, i18n.language)}</dd>
              </div>
              <div>
                <dt>{t('users.detail.ownedStore')}</dt>
                <dd>
                  {user.ownedStore ? (
                    <span className="inline-flex items-center gap-2">
                      {user.ownedStore.name}
                      <StatusBadge type="store" value={user.ownedStore.status} />
                    </span>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt>{t('users.detail.address')}</dt>
                <dd>{user.address || '—'}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="admin-detail-side">
          <section className="admin-card">
            <h2 className="admin-card-title">{t('users.detail.historyTitle')}</h2>
            <div className="mt-4">
              {history.isPending ? (
                <div className="skeleton-shimmer h-24 rounded" />
              ) : history.isError ? (
                <p role="alert" className="text-sm text-destructive">
                  {getApiErrorMessage(history.error, t)}
                </p>
              ) : (
                <UserStatusHistory items={history.data ?? []} />
              )}
            </div>
          </section>
        </aside>
      </div>

      <UserStatusDialog
        pendingAction={pendingAction}
        ownedStoreName={user.ownedStore?.name}
        openOrders={openOrders}
        isSubmitting={changeStatus.isPending}
        submitError={changeStatus.error}
        onConfirm={handleConfirm}
        onClose={() => setPendingAction(null)}
      />
    </section>
  )
}