import { apiClient } from '@/services/api/client'
import { unwrap } from '@/services/api/unwrap'

/**
 * @typedef {'PERCENT' | 'FIXED'} DiscountType
 * @typedef {'PLATFORM' | 'STORE'} VoucherIssuer
 * @typedef {'ACTIVE' | 'EXPIRED' | 'OUT_OF_STOCK' | 'INACTIVE'} DerivedVoucherStatus
 *
 * @typedef {{
 *   code: string,
 *   discountType: DiscountType,
 *   discountValue: number,
 *   remainingQuantity: number,
 *   expiredAt: string,
 *   issuer: VoucherIssuer,
 *   storeId?: string | null,
 *   minimumOrderValue?: number | null,
 *   maximumDiscount?: number | null,
 *   active: boolean
 * }} VoucherResponse
 *
 * @typedef {{
 *   code: string,
 *   discountType: DiscountType,
 *   discountValue: number,
 *   remainingQuantity: number,
 *   expiredAt: string,
 *   minimumOrderValue?: number,
 *   maximumDiscount?: number
 * }} CreateVoucherPayload
 */

/** @returns {Promise<VoucherResponse[]>} */
export async function getAdminVouchers({ signal } = {}) {
  const response = await apiClient.get('/api/admin/vouchers', { signal })
  return unwrap(response) ?? []
}

/**
 * @param {string} code
 * @returns {Promise<VoucherResponse>}
 */
export async function getAdminVoucherByCode(code, { signal } = {}) {
  const response = await apiClient.get(`/api/admin/vouchers/${encodeURIComponent(code)}`, {
    signal,
  })
  return unwrap(response)
}

/**
 * Creates a PLATFORM voucher (issuer is assigned by the Backend).
 * @param {CreateVoucherPayload} payload
 * @returns {Promise<VoucherResponse>}
 */
export async function createPlatformVoucher(payload) {
  const response = await apiClient.post('/api/admin/vouchers', payload)
  return unwrap(response)
}

/**
 * Derives a clear display status from active, expiry, and remainingQuantity.
 * @param {VoucherResponse} voucher
 * @param {number} [nowMs]
 * @returns {DerivedVoucherStatus}
 */
export function getVoucherDerivedStatus(voucher, nowMs = Date.now()) {
  if (!voucher.active) return 'INACTIVE'
  if (voucher.expiredAt && new Date(voucher.expiredAt).getTime() <= nowMs) return 'EXPIRED'
  if (voucher.remainingQuantity <= 0) return 'OUT_OF_STOCK'
  return 'ACTIVE'
}
