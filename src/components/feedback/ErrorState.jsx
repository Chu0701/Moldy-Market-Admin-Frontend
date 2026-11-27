import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   onRetry: () => void,
 *   isRetrying?: boolean
 * }} props
 */
export function ErrorState({ title, description, onRetry, isRetrying = false }) {
  const { t } = useTranslation()

  return (
    <div role="alert" aria-busy={isRetrying} className="admin-feedback-box">
      <span aria-hidden="true" className="admin-feedback-icon admin-feedback-icon-error">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={isRetrying}
        onClick={onRetry}
      >
        {t('actions.retry')}
      </Button>
    </div>
  )
}
