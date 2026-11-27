import { useTranslation } from 'react-i18next'

import { CopyableId } from '@/components/common/CopyableId'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime, formatVnd } from '@/lib/formatters'
import { getVoucherDerivedStatus } from '@/services/vouchers/adminVoucherService'

/**
 * @param {{
 *   vouchers: import('@/services/vouchers/adminVoucherService').VoucherResponse[]
 * }} props
 */
export function VoucherTable({ vouchers }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="kn-table-card">
      <div className="kn-table-scroll">
        <table className="kn-table">
          <thead>
            <tr>
              <th>{t('vouchers.columns.code')}</th>
              <th>{t('vouchers.columns.issuer')}</th>
              <th>{t('vouchers.columns.discount')}</th>
              <th className="kn-table-num">{t('vouchers.columns.minOrder')}</th>
              <th className="kn-table-num">{t('vouchers.columns.remaining')}</th>
              <th>{t('vouchers.columns.expiredAt')}</th>
              <th>{t('vouchers.columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => {
              const status = getVoucherDerivedStatus(voucher)
              return (
                <tr key={voucher.code}>
                  <td>
                    <CopyableId value={voucher.code} truncate={false} />
                  </td>

                  <td>
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge type="issuer" value={voucher.issuer} />
                      {voucher.storeId && <CopyableId value={voucher.storeId} truncate />}
                    </div>
                  </td>

                  <td className="whitespace-nowrap">
                    <p className="font-medium tabular-nums">
                      {voucher.discountType === 'PERCENT'
                        ? `${voucher.discountValue}%`
                        : formatVnd(voucher.discountValue, i18n.language)}
                    </p>
                    {voucher.discountType === 'PERCENT' && voucher.maximumDiscount != null && (
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {t('vouchers.maxDiscountCap', {
                          amount: formatVnd(voucher.maximumDiscount, i18n.language),
                        })}
                      </p>
                    )}
                  </td>

                  <td className="kn-table-num text-muted-foreground">
                    {voucher.minimumOrderValue != null
                      ? formatVnd(voucher.minimumOrderValue, i18n.language)
                      : '—'}
                  </td>

                  <td className="kn-table-num font-medium">{voucher.remainingQuantity}</td>

                  <td className="text-xs whitespace-nowrap text-muted-foreground">
                    {formatDateTime(voucher.expiredAt, i18n.language)}
                  </td>

                  <td>
                    <StatusBadge type="voucher" value={status} />
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
