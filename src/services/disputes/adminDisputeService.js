import { apiClient } from '@/services/api/client'
import { unwrap } from '@/services/api/unwrap'
/**
 * @typedef {'OPEN' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED'} DisputeStatus
 * @typedef {'ITEM_NOT_RECEIVED' | 'NOT_AS_DESCRIBED' | 'DAMAGED' | 'WRONG_ITEM' | 'OTHER'} DisputeReason
 * @typedef {'APPROVE' | 'REJECT'} DisputeDecision
 *
 * @typedef {{
 *   id: string,
 *   orderId: string,
 *   orderCode: string,
 *   firstItemTitle?: string | null,
 *   firstItemImageUrl?: string | null,
 *   totalAmount: number,
 *   reason: DisputeReason,
 *   status: DisputeStatus,
 *   decisionNote?: string | null,
 *   createdAt: string
 * }} DisputeSummaryResponse
 *
 * @typedef {{
 *   id: string,
 *   viewUrl: string,
 *   contentType?: string,
 *   fileName?: string
 * }} DisputeMediaView
 *
 * @typedef {{
 *   id: string,
 *   orderId: string,
 *   buyerId: string,
 *   sellerId: string,
 *   reason: DisputeReason,
 *   description: string,
 *   imageUrls?: string[],
 *   status: DisputeStatus,
 *   reviewedBy?: string | null,
 *   reviewedAt?: string | null,
 *   decisionNote?: string | null,
 *   createdAt: string,
 *   imageFileIds?: string[],
 *   media?: DisputeMediaView[]
 * }} DisputeResponse
 */
/** @returns {Promise<DisputeSummaryResponse[]>} */
export async function getAdminDisputes({ signal } = {}) {
  const response = await apiClient.get('/api/v1/disputes/admin', { signal })
  return unwrap(response) ?? []
}

/**
 * @param {string} disputeId
 * @returns {Promise<DisputeResponse>}
 */
export async function getAdminDisputeDetail(disputeId, { signal } = {}) {
  const response = await apiClient.get(`/api/v1/disputes/admin/${disputeId}`, { signal })
  return unwrap(response)
}

/**
 * @param {string} disputeId
 * @param {{ decision: DisputeDecision, note: string }} payload
 * @returns {Promise<DisputeResponse>}
 */
export async function reviewAdminDispute(disputeId, { decision, note }) {
  const response = await apiClient.patch(`/api/v1/disputes/admin/${disputeId}/review`, {
    decision,
    note,
  })
  return unwrap(response)
}

/**
 * Prefers signed S3 media viewUrls, falling back to legacy imageUrls.
 * @param {DisputeResponse | null | undefined} dispute
 * @returns {string[]}
 */
export function getDisputeEvidenceUrls(dispute) {
  if (!dispute) return []
  const mediaUrls = (dispute.media ?? []).map((item) => item?.viewUrl).filter(Boolean)
  if (mediaUrls.length > 0) return mediaUrls
  return (dispute.imageUrls ?? []).filter(Boolean)
}

/** @param {string | undefined} status */
export function isDisputeReviewable(status) {
  return status === 'OPEN' || status === 'PENDING_APPROVAL'
}
