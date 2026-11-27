import { apiClient } from '@/services/api/client'
import { unwrap } from '@/services/api/unwrap'

/**
 * @typedef {'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | 'CANCELLED'} WithdrawalStatus
 *
 * @typedef {{
 *   id: number,
 *   walletId: number,
 *   amount: number,
 *   bankName: string,
 *   maskedBankAccountNumber: string,
 *   bankAccountHolder: string,
 *   status: WithdrawalStatus,
 *   rejectionReason?: string | null,
 *   requestedAt: string,
 *   processedAt?: string | null
 * }} WithdrawalResponse
 */

/** @returns {Promise<WithdrawalResponse[]>} */
export async function getAdminWithdrawals({ signal } = {}) {
  const response = await apiClient.get('/api/v1/withdrawals/admin', { signal })
  return unwrap(response) ?? []
}

/**
 * Transitions REQUESTED -> PROCESSING.
 * @param {number} withdrawalId
 * @returns {Promise<WithdrawalResponse>}
 */
export async function approveWithdrawal(withdrawalId) {
  const response = await apiClient.patch(`/api/v1/withdrawals/${withdrawalId}/approve`)
  return unwrap(response)
}

/**
 * Transitions PROCESSING -> COMPLETED.
 * @param {number} withdrawalId
 * @returns {Promise<WithdrawalResponse>}
 */
export async function completeWithdrawal(withdrawalId) {
  const response = await apiClient.patch(`/api/v1/withdrawals/${withdrawalId}/complete`)
  return unwrap(response)
}

/**
 * Transitions REQUESTED -> REJECTED and reverses pending hold.
 * @param {number} withdrawalId
 * @param {{ reason: string }} payload
 * @returns {Promise<WithdrawalResponse>}
 */
export async function rejectWithdrawal(withdrawalId, { reason }) {
  const response = await apiClient.patch(`/api/v1/withdrawals/${withdrawalId}/reject`, { reason })
  return unwrap(response)
}

/**
 * Transitions PROCESSING -> FAILED and reverses pending hold.
 * @param {number} withdrawalId
 * @param {{ reason: string }} payload
 * @returns {Promise<WithdrawalResponse>}
 */
export async function failWithdrawal(withdrawalId, { reason }) {
  const response = await apiClient.patch(`/api/v1/withdrawals/${withdrawalId}/fail`, { reason })
  return unwrap(response)
}
