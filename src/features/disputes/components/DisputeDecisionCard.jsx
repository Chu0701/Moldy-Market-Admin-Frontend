import { useTranslation } from 'react-i18next'

import { CopyableId } from '@/components/common/CopyableId'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime } from '@/lib/formatters'

/**
 * Displays the recorded decision for a closed dispute.
 * @param {{ dispute: import('@/services/disputes/adminDisputeService').DisputeResponse }} props
 */
export function DisputeDecisionCard({ dispute }) {
  const { t, i18n } = useTranslation()

  return (
    <section className="admin-card">
      <h2 className="admin-card-title">{t('disputes.detail.decisionResultTitle')}</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">{t('disputes.columns.status')}</dt>
          <dd className="mt-1">
            <StatusBadge type="dispute" value={dispute.status} />
          </dd>
        </div>

        {dispute.reviewedBy && (
          <div>
            <dt className="text-xs text-muted-foreground">{t('disputes.detail.reviewedBy')}</dt>
            <dd className="mt-1">
              <CopyableId value={dispute.reviewedBy} truncate={false} />
            </dd>
          </div>
        )}

        {dispute.reviewedAt && (
          <div>
            <dt className="text-xs text-muted-foreground">{t('disputes.detail.reviewedAt')}</dt>
            <dd className="mt-1 text-xs">{formatDateTime(dispute.reviewedAt, i18n.language)}</dd>
          </div>
        )}

        <div>
          <dt className="text-xs text-muted-foreground">{t('disputes.detail.decisionNote')}</dt>
          <dd className="admin-description-box">{dispute.decisionNote || '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
