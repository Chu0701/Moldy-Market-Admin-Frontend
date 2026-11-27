import { useTranslation } from 'react-i18next'

export function RouteLoading() {
  const { t } = useTranslation()

  return (
    <div role="status" aria-busy="true" className="admin-page py-8">
      <div className="skeleton-shimmer h-7 w-48 rounded" />
      <div className="skeleton-shimmer h-56 w-full rounded-lg" />
      <span className="sr-only">{t('feedback.loading')}</span>
    </div>
  )
}
