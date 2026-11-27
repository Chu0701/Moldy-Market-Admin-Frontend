import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { CopyableId } from '@/components/common/CopyableId'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDateTime, formatVnd } from '@/lib/formatters'
import { isDisputeReviewable } from '@/services/disputes/adminDisputeService'

/**
 * @param {{
 *   disputes: import('@/services/disputes/adminDisputeService').DisputeSummaryResponse[]
 * }} props
 */
export function DisputeTable({ disputes }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="kn-table-card">
      <div className="kn-table-scroll">
        <table className="kn-table">
          <thead>
            <tr>
              <th>{t('disputes.columns.order')}</th>
              <th>{t('disputes.columns.reason')}</th>
              <th className="kn-table-num">{t('disputes.columns.amount')}</th>
              <th>{t('disputes.columns.status')}</th>
              <th>{t('disputes.columns.createdAt')}</th>
              <th className="text-right">{t('disputes.columns.action')}</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => {
              const reviewable = isDisputeReviewable(dispute.status)
              return (
                <tr key={dispute.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={dispute.firstItemImageUrl}
                        alt={dispute.firstItemTitle || dispute.orderCode || dispute.orderId}
                      />
                      <div className="min-w-0">
                        <CopyableId
                          value={dispute.orderCode || dispute.orderId}
                          truncate={!dispute.orderCode}
                        />
                        <p className="max-w-56 truncate text-xs text-muted-foreground">
                          {dispute.firstItemTitle || t('disputes.untitledItem')}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap">
                    {t(`disputes.reason.${dispute.reason}`, { defaultValue: dispute.reason })}
                  </td>

                  <td className="kn-table-num font-medium">
                    {formatVnd(dispute.totalAmount, i18n.language)}
                  </td>

                  <td>
                    <StatusBadge type="dispute" value={dispute.status} />
                  </td>

                  <td className="text-xs whitespace-nowrap text-muted-foreground">
                    {formatDateTime(dispute.createdAt, i18n.language)}
                  </td>

                  <td className="text-right">
                    <Button asChild variant={reviewable ? 'default' : 'outline'} size="sm">
                      <Link to={`/disputes/${dispute.id}`}>
                        <span>
                          {reviewable ? t('disputes.actions.review') : t('disputes.actions.view')}
                        </span>
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
