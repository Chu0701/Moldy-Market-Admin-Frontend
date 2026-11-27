import { describe, expect, it } from 'vitest'

import {
  createPlatformVoucherSchema,
  toCreateVoucherPayload,
} from '@/features/vouchers/schemas/createVoucherSchema'

const t = (key) => key

describe('createPlatformVoucherSchema', () => {
  const schema = createPlatformVoucherSchema(t)
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

  it('rejects PERCENT discount over 100 and past expiry dates', () => {
    const over100 = schema.safeParse({
      code: 'SALE150',
      discountType: 'PERCENT',
      discountValue: '150',
      remainingQuantity: '10',
      expiredAt: futureDate,
    })
    expect(over100.success).toBe(false)

    const pastExpiry = schema.safeParse({
      code: 'OLD10',
      discountType: 'PERCENT',
      discountValue: '10',
      remainingQuantity: '10',
      expiredAt: '2020-01-01T00:00',
    })
    expect(pastExpiry.success).toBe(false)
  })

  it('normalizes code and omits maximumDiscount for FIXED vouchers', () => {
    const valid = schema.safeParse({
      code: ' moldy50k ',
      discountType: 'FIXED',
      discountValue: '50000',
      remainingQuantity: '25',
      expiredAt: futureDate,
      minimumOrderValue: '200000',
      maximumDiscount: '99999',
    })
    expect(valid.success).toBe(true)

    const payload = toCreateVoucherPayload(valid.data)
    expect(payload.code).toBe('MOLDY50K')
    expect(payload.discountValue).toBe(50000)
    expect(payload.minimumOrderValue).toBe(200000)
    expect(payload.maximumDiscount).toBeUndefined()
  })
})
