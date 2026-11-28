import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime } from '@/lib/formatters'

/**
 * Timeline lịch sử khóa / mở khóa (mới nhất trước).
 * @param {{ items: import('@/services/users/adminUserService').UserStatusHistoryItem[] }} props
 */
export function UserStatusHistory({ items }) {
  const { t, i18n } = useTranslation()

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('users.detail.historyEmpty')}</p>
  }

  return (
    <ol className="admin-timeline">
      {items.map((item) => (
        <li key={item.id} className="admin-timeline-item">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge type="user" value={item.fromStatus} />
            <span aria-hidden="true">→</span>
            <StatusBadge type="user" value={item.toStatus} />
          </div>
          {item.reason && <p className="mt-1 text-sm">{item.reason}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {t('users.detail.historyBy', {
              name: item.actor?.fullName || item.actor?.email || '—',
              time: formatDateTime(item.createdAt, i18n.language),
            })}
          </p>
        </li>
      ))}
    </ol>
  )
}