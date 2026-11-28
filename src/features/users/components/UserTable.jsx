import { ArrowUpRight, Lock, LockOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/formatters'

/**
 * @param {{
 *   users: import('@/services/users/adminUserService').AdminUserSummary[],
 *   onLock: (user: import('@/services/users/adminUserService').AdminUserSummary) => void,
 *   onUnlock: (user: import('@/services/users/adminUserService').AdminUserSummary) => void
 * }} props
 */
export function UserTable({ users, onLock, onUnlock }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="kn-table-card">
      <div className="kn-table-scroll">
        <table className="kn-table">
          <thead>
            <tr>
              <th>{t('users.columns.user')}</th>
              <th>{t('users.columns.phone')}</th>
              <th>{t('users.columns.roles')}</th>
              <th>{t('users.columns.status')}</th>
              <th className="kn-table-num">{t('users.columns.trustPoints')}</th>
              <th>{t('users.columns.createdAt')}</th>
              <th className="text-right">{t('users.columns.action')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="min-w-0">
                    <p className="max-w-56 truncate font-medium">{user.fullName}</p>
                    <p className="max-w-56 truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap">{user.phone || '—'}</td>
                <td className="text-xs">
                  {(user.roles ?? []).map((role) => t(`users.roles.${role}`, { defaultValue: role })).join(', ') ||
                    '—'}
                </td>
                <td>
                  <StatusBadge type="user" value={user.status} />
                </td>
                <td className="kn-table-num">{user.trustPoints ?? 0}</td>
                <td className="text-xs whitespace-nowrap text-muted-foreground">
                  {formatDateTime(user.createdAt, i18n.language)}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {/* Backend tính sẵn canLock / canUnlock: admin, chính mình, user chờ OTP sẽ không có nút */}
                    {user.canLock && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => onLock(user)}>
                        <Lock aria-hidden="true" className="size-3.5" />
                        {t('users.actions.lock')}
                      </Button>
                    )}
                    {user.canUnlock && (
                      <Button type="button" variant="outline" size="sm" onClick={() => onUnlock(user)}>
                        <LockOpen aria-hidden="true" className="size-3.5" />
                        {t('users.actions.unlock')}
                      </Button>
                    )}
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/users/${user.id}`} aria-label={t('users.actions.viewNamed', { name: user.fullName })}>
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </Button>
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