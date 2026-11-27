import { ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ForbiddenState() {
  const { t } = useTranslation()

  return (
    <div role="alert" className="admin-feedback-box">
      <span aria-hidden="true" className="admin-feedback-icon">
        <ShieldAlert className="size-5" />
      </span>
      <p className="text-base font-semibold text-foreground">{t('feedback.forbiddenTitle')}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {t('feedback.forbiddenMessage')}
      </p>
    </div>
  )
}
