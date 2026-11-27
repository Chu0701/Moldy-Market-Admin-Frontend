import { z } from 'zod'

/** @param {import('i18next').TFunction} t */
export function createWithdrawalReasonSchema(t) {
  return z.object({
    reason: z.string().trim().min(1, t('withdrawals.validation.reasonRequired')),
  })
}
