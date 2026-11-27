import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  createPlatformVoucherSchema,
  toCreateVoucherPayload,
} from '@/features/vouchers/schemas/createVoucherSchema'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

/**
 * Form to create a new PLATFORM voucher via POST /api/admin/vouchers.
 * @param {{
 *   isSubmitting: boolean,
 *   submitError: unknown,
 *   onSubmitVoucher: (payload: import('@/services/vouchers/adminVoucherService').CreateVoucherPayload) => Promise<void>,
 *   onCancel: () => void
 * }} props
 */
export function PlatformVoucherForm({ isSubmitting, submitError, onSubmitVoucher, onCancel }) {
  const { t } = useTranslation()
  const schema = useMemo(() => createPlatformVoucherSchema(t), [t])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      discountType: 'PERCENT',
      discountValue: '',
      remainingQuantity: '100',
      expiredAt: '',
      minimumOrderValue: '',
      maximumDiscount: '',
    },
  })

  const discountType = useWatch({ control, name: 'discountType' })
  const errorText = submitError ? getApiErrorMessage(submitError, t) : null

  const handleValidSubmit = handleSubmit(async (values) => {
    try {
      await onSubmitVoucher(toCreateVoucherPayload(values))
      reset()
    } catch {
      // Error state is rendered via submitError from TanStack Query mutation.
    }
  })

  return (
    <section className="admin-card max-w-2xl" aria-labelledby="create-voucher-heading">
      <h2 id="create-voucher-heading" className="admin-card-title">
        {t('vouchers.form.title')}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t('vouchers.form.subtitle')}</p>

      <form onSubmit={handleValidSubmit} className="mt-4 space-y-4" noValidate>
        <div className="admin-form-grid">
          <FormField
            id="voucher-code"
            label={t('vouchers.form.codeLabel')}
            hint={t('vouchers.form.codeHint')}
            error={errors.code?.message}
          >
            <input
              id="voucher-code"
              type="text"
              maxLength={50}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? 'voucher-code-error' : 'voucher-code-hint'}
              placeholder={t('vouchers.form.codePlaceholder')}
              className="kn-input font-mono uppercase"
              {...register('code')}
            />
          </FormField>

          <FormField
            id="voucher-discount-type"
            label={t('vouchers.form.discountTypeLabel')}
            error={errors.discountType?.message}
          >
            <select
              id="voucher-discount-type"
              aria-invalid={Boolean(errors.discountType)}
              className="kn-input"
              {...register('discountType')}
            >
              <option value="PERCENT">{t('vouchers.discountType.PERCENT')}</option>
              <option value="FIXED">{t('vouchers.discountType.FIXED')}</option>
            </select>
          </FormField>

          <FormField
            id="voucher-discount-value"
            label={
              discountType === 'PERCENT'
                ? t('vouchers.form.discountValuePercentLabel')
                : t('vouchers.form.discountValueFixedLabel')
            }
            error={errors.discountValue?.message}
          >
            <input
              id="voucher-discount-value"
              type="number"
              min="1"
              max={discountType === 'PERCENT' ? '100' : undefined}
              step="any"
              aria-invalid={Boolean(errors.discountValue)}
              aria-describedby={errors.discountValue ? 'voucher-discount-value-error' : undefined}
              className="kn-input tabular-nums"
              {...register('discountValue')}
            />
          </FormField>

          <FormField
            id="voucher-quantity"
            label={t('vouchers.form.quantityLabel')}
            error={errors.remainingQuantity?.message}
          >
            <input
              id="voucher-quantity"
              type="number"
              min="1"
              step="1"
              aria-invalid={Boolean(errors.remainingQuantity)}
              aria-describedby={errors.remainingQuantity ? 'voucher-quantity-error' : undefined}
              className="kn-input tabular-nums"
              {...register('remainingQuantity')}
            />
          </FormField>

          <FormField
            id="voucher-expired-at"
            label={t('vouchers.form.expiredAtLabel')}
            error={errors.expiredAt?.message}
          >
            <input
              id="voucher-expired-at"
              type="datetime-local"
              aria-invalid={Boolean(errors.expiredAt)}
              aria-describedby={errors.expiredAt ? 'voucher-expired-at-error' : undefined}
              className="kn-input"
              {...register('expiredAt')}
            />
          </FormField>

          <FormField
            id="voucher-min-order"
            label={t('vouchers.form.minOrderLabel')}
            hint={t('vouchers.form.optionalHint')}
            error={errors.minimumOrderValue?.message}
          >
            <input
              id="voucher-min-order"
              type="number"
              min="0"
              step="any"
              aria-invalid={Boolean(errors.minimumOrderValue)}
              aria-describedby={
                errors.minimumOrderValue ? 'voucher-min-order-error' : 'voucher-min-order-hint'
              }
              className="kn-input tabular-nums"
              {...register('minimumOrderValue')}
            />
          </FormField>

          {discountType === 'PERCENT' && (
            <FormField
              id="voucher-max-discount"
              label={t('vouchers.form.maxDiscountLabel')}
              hint={t('vouchers.form.maxDiscountHint')}
              error={errors.maximumDiscount?.message}
            >
              <input
                id="voucher-max-discount"
                type="number"
                min="1"
                step="any"
                aria-invalid={Boolean(errors.maximumDiscount)}
                aria-describedby={
                  errors.maximumDiscount
                    ? 'voucher-max-discount-error'
                    : 'voucher-max-discount-hint'
                }
                className="kn-input tabular-nums"
                {...register('maximumDiscount')}
              />
            </FormField>
          )}
        </div>

        {errorText && (
          <div role="alert" className="admin-alert admin-alert-error">
            {errorText}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('actions.submitting') : t('vouchers.form.submit')}
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
        </div>
      </form>
    </section>
  )
}
