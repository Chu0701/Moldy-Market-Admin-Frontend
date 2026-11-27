import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

/**
 * Reusable confirmation dialog for high-impact admin actions.
 * @param {{
 *   open: boolean,
 *   title: string,
 *   description?: string,
 *   confirmLabel: string,
 *   confirmVariant?: 'default' | 'destructive',
 *   isSubmitting?: boolean,
 *   errorMessage?: string | null,
 *   onConfirm: () => void,
 *   onClose: () => void,
 *   children?: import('react').ReactNode
 * }} props
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  isSubmitting = false,
  errorMessage,
  onConfirm,
  onClose,
  children,
}) {
  const { t } = useTranslation()
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="admin-dialog-backdrop"
      onClick={() => {
        if (!isSubmitting) onClose()
      }}
    >
      <div className="admin-dialog-panel" onClick={(event) => event.stopPropagation()}>
        <h2 id="confirm-dialog-title" className="admin-card-title">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

        {children && <div className="mt-4">{children}</div>}

        {errorMessage && (
          <div role="alert" className="admin-alert admin-alert-error mt-4">
            {errorMessage}
          </div>
        )}

        <div className="admin-dialog-footer">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? t('actions.submitting') : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
