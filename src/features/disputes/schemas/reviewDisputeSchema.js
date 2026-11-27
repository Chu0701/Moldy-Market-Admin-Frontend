import { z } from 'zod'

/** @param {import('i18next').TFunction} t */
export function createReviewDisputeSchema(t) {
  return z.object({
    decision: z.enum(['APPROVE', 'REJECT'], {
      message: t('disputes.validation.decisionRequired'),
    }),
    note: z
      .string()
      .trim()
      .min(1, t('disputes.validation.noteRequired'))
      .max(1000, t('disputes.validation.noteMax')),
  })
}
