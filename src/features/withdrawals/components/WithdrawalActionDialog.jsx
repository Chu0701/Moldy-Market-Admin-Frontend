import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { createWithdrawalReasonSchema } from '@/features/withdrawals/schemas/withdrawalReasonSchema'
import { formatVnd } from '@/lib/formatters'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

/**
 * Confirmation dialog for approve/complete/reject/fail withdrawal actions.
 * @param {{
 *   pendingAction: {
 *     action: 'approve' | 'complete' | 'reject' | 'fail',
 *     withdrawal: import('@/services/withdrawals/adminWithdrawalService').WithdrawalResponse
 *   } | null,
 *   isSubmitting: boolean,
 *   submitError: unknown,
 *   onConfirm: (reason?: string) => Promise<void>,
 *   onClose: () => void
 * }} props
 */
export function WithdrawalActionDialog({
  pendingAction,
  isSubmitting,
  submitError,
  onConfirm,
  onClose,
}) {
  const { t, i18n } = useTranslation()
  const needsReason = pendingAction?.action === 'reject' || pendingAction?.action === 'fail'
  const schema = useMemo(() => createWithdrawalReasonSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    reset({ reason: '' })
  }, [pendingAction, reset])

  if (!pendingAction) return null

  const { action, withdrawal } = pendingAction
  const isDestructive = needsReason
  const amountText = formatVnd(withdrawal.amount, i18n.language)
  const errorText = submitError ? getApiErrorMessage(submitError, t) : null

  const runConfirm = async (reason) => {
    try {
      await onConfirm(reason)
    } catch {
      // Error state is rendered inside ConfirmDialog via submitError.
    }
  }

  const handleConfirmClick = () => {
    if (needsReason) {
      void handleSubmit((values) => runConfirm(values.reason))()
      return
    }
    void runConfirm()
  }

  return (
    <ConfirmDialog
      open={Boolean(pendingAction)}
      title={t(`withdrawals.dialog.${action}.title`, { id: withdrawal.id })}
      description={t(`withdrawals.dialog.${action}.description`, {
        amount: amountText,
        holder: withdrawal.bankAccountHolder,
        bank: withdrawal.bankName,
      })}
      confirmLabel={t(`withdrawals.actions.${action}`)}
      confirmVariant={isDestructive ? 'destructive' : 'default'}
      isSubmitting={isSubmitting}
      errorMessage={errorText}
      onConfirm={handleConfirmClick}
      onClose={onClose}
    >
      {needsReason && (
        <FormField
          id="withdrawal-reason"
          label={t('withdrawals.dialog.reasonLabel')}
          error={errors.reason?.message}
        >
          <textarea
            id="withdrawal-reason"
            rows={3}
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={errors.reason ? 'withdrawal-reason-error' : undefined}
            placeholder={t('withdrawals.dialog.reasonPlaceholder')}
            className="kn-input resize-y"
            {...register('reason')}
          />
        </FormField>
      )}
    </ConfirmDialog>
  )
}
