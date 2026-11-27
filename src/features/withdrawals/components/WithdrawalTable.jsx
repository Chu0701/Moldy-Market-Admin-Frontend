import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDateTime, formatVnd } from '@/lib/formatters'

/**
 * @param {{
 *   withdrawals: import('@/services/withdrawals/adminWithdrawalService').WithdrawalResponse[],
 *   onSelectAction: (payload: {
 *     action: 'approve' | 'complete' | 'reject' | 'fail',
 *     withdrawal: import('@/services/withdrawals/adminWithdrawalService').WithdrawalResponse
 *   }) => void
 * }} props
 */
export function WithdrawalTable({ withdrawals, onSelectAction }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="kn-table-card">
      <div className="kn-table-scroll">
        <table className="kn-table">
          <thead>
            <tr>
              <th>{t('withdrawals.columns.id')}</th>
              <th>{t('withdrawals.columns.bank')}</th>
              <th className="kn-table-num">{t('withdrawals.columns.amount')}</th>
              <th>{t('withdrawals.columns.status')}</th>
              <th>{t('withdrawals.columns.requestedAt')}</th>
              <th className="text-right">{t('withdrawals.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap">
                  <p className="font-mono text-xs font-semibold">#{item.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('withdrawals.walletLabel', { walletId: item.walletId })}
                  </p>
                </td>

                <td>
                  <p className="font-medium text-foreground">{item.bankName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.bankAccountHolder} ·{' '}
                    <span className="font-mono">{item.maskedBankAccountNumber}</span>
                  </p>
                </td>

                <td className="kn-table-num font-semibold">
                  {formatVnd(item.amount, i18n.language)}
                </td>

                <td>
                  <StatusBadge type="withdrawal" value={item.status} />
                  {item.rejectionReason && (
                    <p
                      title={item.rejectionReason}
                      className="mt-1 max-w-52 truncate text-xs text-muted-foreground"
                    >
                      {item.rejectionReason}
                    </p>
                  )}
                </td>

                <td className="text-xs whitespace-nowrap text-muted-foreground">
                  <p>{formatDateTime(item.requestedAt, i18n.language)}</p>
                  {item.processedAt && (
                    <p className="mt-0.5 text-[11px]">
                      {t('withdrawals.processedPrefix')}{' '}
                      {formatDateTime(item.processedAt, i18n.language)}
                    </p>
                  )}
                </td>

                <td>
                  <div className="admin-row-actions">
                    {item.status === 'REQUESTED' && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onSelectAction({ action: 'approve', withdrawal: item })}
                        >
                          {t('withdrawals.actions.approve')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => onSelectAction({ action: 'reject', withdrawal: item })}
                        >
                          {t('withdrawals.actions.reject')}
                        </Button>
                      </>
                    )}

                    {item.status === 'PROCESSING' && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onSelectAction({ action: 'complete', withdrawal: item })}
                        >
                          {t('withdrawals.actions.complete')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => onSelectAction({ action: 'fail', withdrawal: item })}
                        >
                          {t('withdrawals.actions.fail')}
                        </Button>
                      </>
                    )}

                    {item.status !== 'REQUESTED' && item.status !== 'PROCESSING' && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
