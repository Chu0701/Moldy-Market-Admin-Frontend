import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, XCircle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { createReviewDisputeSchema } from '@/features/disputes/schemas/reviewDisputeSchema'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

/**
 * @param {{
 *   orderId: string,
 *   isSubmitting: boolean,
 *   submitError: unknown,
 *   onSubmitDecision: (values: { decision: 'APPROVE' | 'REJECT', note: string }) => Promise<void>
 * }} props
 */
export function DisputeReviewForm({ orderId, isSubmitting, submitError, onSubmitDecision }) {
  const { t } = useTranslation()
  const [pendingValues, setPendingValues] = useState(null)

  const schema = useMemo(() => createReviewDisputeSchema(t), [t])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { decision: 'APPROVE', note: '' },
  })

  const selectedDecision = useWatch({ control, name: 'decision' })
  const noteValue = useWatch({ control, name: 'note' }) ?? ''
  const errorText = submitError ? getApiErrorMessage(submitError, t) : null

  const handleRequestConfirm = handleSubmit((values) => {
    setPendingValues(values)
  })

  async function handleConfirm() {
    if (!pendingValues) return
    try {
      await onSubmitDecision(pendingValues)
      setPendingValues(null)
    } catch {
      // Keep dialog open so the mapped API error renders inside it.
    }
  }

  return (
    <section className="admin-card">
      <h2 className="admin-card-title">{t('disputes.detail.decisionFormTitle')}</h2>

      <form onSubmit={handleRequestConfirm} className="mt-4 space-y-4" noValidate>
        <div className="admin-field">
          <span className="text-sm font-medium text-foreground">
            {t('disputes.detail.chooseDecision')}
          </span>

          <div className="grid gap-2.5">
            <button
              type="button"
              data-selected={selectedDecision === 'APPROVE'}
              data-tone="success"
              onClick={() => setValue('decision', 'APPROVE', { shouldValidate: true })}
              className="admin-decision-option"
            >
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
              <div>
                <p className="text-sm font-medium">{t('disputes.decision.APPROVE')}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('disputes.decision.APPROVE_DESC')}
                </p>
              </div>
            </button>

            <button
              type="button"
              data-selected={selectedDecision === 'REJECT'}
              data-tone="destructive"
              onClick={() => setValue('decision', 'REJECT', { shouldValidate: true })}
              className="admin-decision-option"
            >
              <XCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium">{t('disputes.decision.REJECT')}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('disputes.decision.REJECT_DESC')}
                </p>
              </div>
            </button>
          </div>
        </div>

        <FormField
          id="dispute-note"
          label={t('disputes.detail.noteLabel')}
          meta={`${noteValue.length}/1000`}
          error={errors.note?.message}
        >
          <textarea
            id="dispute-note"
            rows={4}
            maxLength={1000}
            aria-invalid={Boolean(errors.note)}
            aria-describedby={errors.note ? 'dispute-note-error' : undefined}
            placeholder={t('disputes.detail.notePlaceholder')}
            className="kn-input resize-y"
            {...register('note')}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {t('disputes.detail.submitDecision')}
        </Button>
      </form>

      <ConfirmDialog
        open={Boolean(pendingValues)}
        title={
          pendingValues?.decision === 'APPROVE'
            ? t('disputes.detail.confirmApproveTitle', { orderId: orderId.slice(0, 8) })
            : t('disputes.detail.confirmRejectTitle', { orderId: orderId.slice(0, 8) })
        }
        description={
          pendingValues?.decision === 'APPROVE'
            ? t('disputes.detail.confirmApproveText')
            : t('disputes.detail.confirmRejectText')
        }
        confirmLabel={
          pendingValues?.decision === 'APPROVE'
            ? t('disputes.decision.APPROVE')
            : t('disputes.decision.REJECT')
        }
        confirmVariant={pendingValues?.decision === 'REJECT' ? 'destructive' : 'default'}
        isSubmitting={isSubmitting}
        errorMessage={errorText}
        onConfirm={handleConfirm}
        onClose={() => setPendingValues(null)}
      />
    </section>
  )
}
