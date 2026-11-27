import { z } from 'zod'

function parseOptionalNumber(rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return undefined
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/** @param {import('i18next').TFunction} t */
export function createPlatformVoucherSchema(t) {
  return z
    .object({
      code: z
        .string()
        .trim()
        .min(1, t('vouchers.validation.codeRequired'))
        .max(50, t('vouchers.validation.codeMax')),
      discountType: z.enum(['PERCENT', 'FIXED']),
      discountValue: z.string().trim().min(1, t('vouchers.validation.discountValueRequired')),
      remainingQuantity: z.string().trim().min(1, t('vouchers.validation.quantityRequired')),
      expiredAt: z.string().trim().min(1, t('vouchers.validation.expiredAtRequired')),
      minimumOrderValue: z.string().optional(),
      maximumDiscount: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const discountValue = Number(values.discountValue)
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['discountValue'],
          message: t('vouchers.validation.discountValuePositive'),
        })
      } else if (values.discountType === 'PERCENT' && discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['discountValue'],
          message: t('vouchers.validation.percentMax'),
        })
      }

      const quantity = Number(values.remainingQuantity)
      if (!Number.isInteger(quantity) || quantity <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['remainingQuantity'],
          message: t('vouchers.validation.quantityPositive'),
        })
      }

      const expiryTime = new Date(values.expiredAt).getTime()
      if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['expiredAt'],
          message: t('vouchers.validation.expiredAtFuture'),
        })
      }

      const minOrder = parseOptionalNumber(values.minimumOrderValue)
      if (minOrder !== undefined && (Number.isNaN(minOrder) || minOrder < 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['minimumOrderValue'],
          message: t('vouchers.validation.minOrderNonNegative'),
        })
      }

      if (values.discountType === 'PERCENT') {
        const maxDiscount = parseOptionalNumber(values.maximumDiscount)
        if (maxDiscount !== undefined && (Number.isNaN(maxDiscount) || maxDiscount <= 0)) {
          ctx.addIssue({
            code: 'custom',
            path: ['maximumDiscount'],
            message: t('vouchers.validation.maxDiscountPositive'),
          })
        }
      }
    })
}

/**
 * Transforms validated form fields into a Backend CreateVoucherRequest payload.
 * @param {{
 *   code: string,
 *   discountType: 'PERCENT' | 'FIXED',
 *   discountValue: string,
 *   remainingQuantity: string,
 *   expiredAt: string,
 *   minimumOrderValue?: string,
 *   maximumDiscount?: string
 * }} values
 */
export function toCreateVoucherPayload(values) {
  const payload = {
    code: values.code.trim().toUpperCase(),
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    remainingQuantity: Number(values.remainingQuantity),
    expiredAt: new Date(values.expiredAt).toISOString(),
  }

  const minOrder = parseOptionalNumber(values.minimumOrderValue)
  if (minOrder !== undefined) {
    payload.minimumOrderValue = minOrder
  }

  if (values.discountType === 'PERCENT') {
    const maxDiscount = parseOptionalNumber(values.maximumDiscount)
    if (maxDiscount !== undefined) {
      payload.maximumDiscount = maxDiscount
    }
  }

  return payload
}
