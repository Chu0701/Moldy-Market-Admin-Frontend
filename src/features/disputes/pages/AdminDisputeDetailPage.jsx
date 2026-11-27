import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { CopyableId } from '@/components/common/CopyableId'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ForbiddenState } from '@/components/feedback/ForbiddenState'
import { Button } from '@/components/ui/button'
import { DisputeDecisionCard } from '@/features/disputes/components/DisputeDecisionCard'
import { DisputeEvidenceGallery } from '@/features/disputes/components/DisputeEvidenceGallery'
import { DisputeReviewForm } from '@/features/disputes/components/DisputeReviewForm'
import {
  useAdminDisputeDetail,
  useReviewAdminDispute,
} from '@/features/disputes/hooks/useAdminDisputes'
import { formatDateTime } from '@/lib/formatters'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'
import {
  getDisputeEvidenceUrls,
  isDisputeReviewable,
} from '@/services/disputes/adminDisputeService'

export function AdminDisputeDetailPage() {
  const { disputeId } = useParams()
  const { t, i18n } = useTranslation()
  const [successMessage, setSuccessMessage] = useState('')

  const {
    data: dispute,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminDisputeDetail(disputeId)
  const reviewMutation = useReviewAdminDispute(disputeId)

  const evidenceUrls = useMemo(() => getDisputeEvidenceUrls(dispute), [dispute])

  async function handleSubmitDecision(values) {
    setSuccessMessage('')
    await reviewMutation.mutateAsync(values)
    setSuccessMessage(
      values.decision === 'APPROVE'
        ? t('disputes.detail.approvedSuccess')
        : t('disputes.detail.rejectedSuccess'),
    )
  }

  if (error?.status === 403) {
    return <ForbiddenState />
  }

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

  if (isError || !dispute) {
    return (
      <section className="admin-page">
        <Button asChild variant="ghost" size="sm" className="justify-self-start">
          <Link to="/disputes">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t('disputes.detail.backToList')}
          </Link>
        </Button>
        <ErrorState
          title={t('disputes.detail.loadError')}
          description={getApiErrorMessage(error, t)}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      </section>
    )
  }

  return (
    <section className="admin-page" aria-labelledby="dispute-detail-heading">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/disputes">
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t('disputes.detail.backToList')}
          </Link>
        </Button>

        <PageHeader
          headingId="dispute-detail-heading"
          title={t('disputes.detail.title')}
          description={`${t('disputes.detail.createdAt')}: ${formatDateTime(dispute.createdAt, i18n.language)}`}
          actions={<StatusBadge type="dispute" value={dispute.status} />}
        />
      </div>

      {successMessage && (
        <div role="status" className="admin-alert admin-alert-success">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-main">
          <section className="admin-card">
            <h2 className="admin-card-title">{t('disputes.detail.infoTitle')}</h2>

            <dl className="admin-dl mt-4">
              <div>
                <dt>{t('disputes.detail.disputeId')}</dt>
                <dd>
                  <CopyableId value={dispute.id} truncate={false} />
                </dd>
              </div>
              <div>
                <dt>{t('disputes.detail.orderId')}</dt>
                <dd>
                  <CopyableId value={dispute.orderId} truncate={false} />
                </dd>
              </div>
              <div>
                <dt>{t('disputes.detail.buyerId')}</dt>
                <dd>
                  <CopyableId value={dispute.buyerId} truncate={false} />
                </dd>
              </div>
              <div>
                <dt>{t('disputes.detail.sellerId')}</dt>
                <dd>
                  <CopyableId value={dispute.sellerId} truncate={false} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt>{t('disputes.detail.reason')}</dt>
                <dd className="font-medium">
                  {t(`disputes.reason.${dispute.reason}`, { defaultValue: dispute.reason })}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t('disputes.detail.description')}
              </p>
              <p className="admin-description-box">{dispute.description}</p>
            </div>
          </section>

          <DisputeEvidenceGallery urls={evidenceUrls} />
        </div>

        <div className="admin-detail-side">
          {isDisputeReviewable(dispute.status) ? (
            <DisputeReviewForm
              orderId={dispute.orderId}
              isSubmitting={reviewMutation.isPending}
              submitError={reviewMutation.error}
              onSubmitDecision={handleSubmitDecision}
            />
          ) : (
            <DisputeDecisionCard dispute={dispute} />
          )}
        </div>
      </div>
    </section>
  )
}
