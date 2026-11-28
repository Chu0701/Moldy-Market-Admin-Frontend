import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const TONE_MAP = {
  dispute: {
    OPEN: 'warning',
    PENDING_APPROVAL: 'info',
    APPROVED: 'success',
    REJECTED: 'destructive',
    CANCELLED: 'muted',
  },
  withdrawal: {
    REQUESTED: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    REJECTED: 'destructive',
    FAILED: 'destructive',
    CANCELLED: 'muted',
  },
  voucher: {
    ACTIVE: 'success',
    EXPIRED: 'warning',
    OUT_OF_STOCK: 'info',
    INACTIVE: 'muted',
  },
  issuer: {
    PLATFORM: 'info',
    STORE: 'muted',
  },
  user: {
    ACTIVE: 'success',
    LOCKED: 'destructive',
    PENDING_VERIFICATION: 'warning',
  },
  store: {
    ACTIVE: 'success',
    BLOCKED: 'destructive',
  },
}

const I18N_PREFIX = {
  dispute: 'disputes.status',
  withdrawal: 'withdrawals.status',
  voucher: 'vouchers.status',
  issuer: 'vouchers.issuer',
  user: 'users.status',
  store: 'users.storeStatus',
}

/**
 * @param {{
 *   type: 'dispute' | 'withdrawal' | 'voucher' | 'issuer' | 'user' | 'store',
 *   value?: string | null,
 *   className?: string
 * }} props
 */
export function StatusBadge({ type, value, className }) {
  const { t } = useTranslation()
  const tone = TONE_MAP[type]?.[value] ?? 'muted'
  const prefix = I18N_PREFIX[type]
  const label = value && prefix ? t(`${prefix}.${value}`, { defaultValue: value }) : (value ?? '—')

  return (
    <span className={cn('admin-status-badge', className)} data-tone={tone}>
      <span aria-hidden="true" className="admin-status-dot" />
      <span>{label}</span>
    </span>
  )
}
