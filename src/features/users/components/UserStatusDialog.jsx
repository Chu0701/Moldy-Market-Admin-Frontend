import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import {
  buildLockReason,
  createLockUserSchema,
  createUnlockUserSchema,
  LOCK_REASON_PRESETS,
} from '@/features/users/schemas/lockUserSchema'
import { getApiErrorMessage } from '@/services/api/apiErrorMessage'

/**
 * Hộp thoại khóa / mở khóa tài khoản.
 * @param {{
 *   pendingAction: {
 *     action: 'lock' | 'unlock',
 *     user: { id: string, fullName: string, email: string }
 *   } | null,
 *   ownedStoreName?: string | null,
 *   openOrders?: number,
 *   isSubmitting: boolean,
 *   submitError: unknown,
 *   onConfirm: (payload: { reason?: string, note?: string }) => Promise<void>,
 *   onClose: () => void
 * }} props
 */
export function UserStatusDialog({
  pendingAction,
  ownedStoreName,
  openOrders = 0,
  isSubmitting,
  submitError,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation()
  const isLock = pendingAction?.action === 'lock'
  const schema = useMemo(
    () => (isLock ? createLockUserSchema(t) : createUnlockUserSchema(t)),
    [isLock, t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { preset: '', detail: '', note: '' },
  })

  // Mỗi lần mở hộp thoại cho user khác thì xóa dữ liệu cũ
  useEffect(() => {
    reset({ preset: '', detail: '', note: '' })
  }, [pendingAction, reset])

  if (!pendingAction) return null

  const { user } = pendingAction
  const errorText = submitError ? getApiErrorMessage(submitError, t) : null

  const submit = handleSubmit(async (values) => {
    const payload = isLock
      ? { reason: buildLockReason(t(`users.lockReasons.${values.preset}`), values.detail) }
      : { note: values.note }
    try {
      await onConfirm(payload)
    } catch {
      // Lỗi được hiển thị trong ConfirmDialog qua submitError
    }
  })

  return (
    <ConfirmDialog
      open
      title={t(`users.dialog.${pendingAction.action}.title`)}
      description={t(`users.dialog.${pendingAction.action}.description`, {
        name: user.fullName,
        email: user.email,
      })}
      confirmLabel={t(`users.actions.${pendingAction.action}`)}
      confirmVariant={isLock ? 'destructive' : 'default'}
      isSubmitting={isSubmitting}
      errorMessage={errorText}
      onConfirm={() => void submit()}
      onClose={onClose}
    >
      {isLock ? (
        <div className="space-y-4">
          {(ownedStoreName || openOrders > 0) && (
            <div role="note" className="admin-alert admin-alert-warning">
              <div className="space-y-1">
                {ownedStoreName && (
                  <p>{t('users.dialog.lock.ownsStore', { store: ownedStoreName })}</p>
                )}
                {openOrders > 0 && (
                  <p>{t('users.dialog.lock.openOrders', { count: openOrders })}</p>
                )}
              </div>
            </div>
          )}

          <FormField id="lock-preset" label={t('users.dialog.lock.presetLabel')} error={errors.preset?.message}>
            <select
              id="lock-preset"
              aria-invalid={Boolean(errors.preset)}
              className="kn-input"
              {...register('preset')}
            >
              <option value="">{t('users.dialog.lock.presetPlaceholder')}</option>
              {LOCK_REASON_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {t(`users.lockReasons.${preset}`)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="lock-detail" label={t('users.dialog.lock.detailLabel')} error={errors.detail?.message}>
            <textarea
              id="lock-detail"
              rows={3}
              aria-invalid={Boolean(errors.detail)}
              placeholder={t('users.dialog.lock.detailPlaceholder')}
              className="kn-input resize-y"
              {...register('detail')}
            />
          </FormField>
        </div>
      ) : (
        <FormField id="unlock-note" label={t('users.dialog.unlock.noteLabel')} error={errors.note?.message}>
          <textarea
            id="unlock-note"
            rows={3}
            placeholder={t('users.dialog.unlock.notePlaceholder')}
            className="kn-input resize-y"
            {...register('note')}
          />
        </FormField>
      )}
    </ConfirmDialog>
  )
}