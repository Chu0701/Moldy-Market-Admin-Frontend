
import apiServer from '@/services/api/api';

/**
 * @typedef {'ACTIVE' | 'LOCKED' | 'PENDING_VERIFICATION'} UserStatus
 * @typedef {'USER' | 'OWNER' | 'STAFF' | 'APPRAISER' | 'ADMIN'} RoleName
 *
 * @typedef {{
 *   id: string,
 *   email: string,
 *   fullName: string,
 *   phone?: string | null,
 *   status: UserStatus,
 *   trustPoints: number,
 *   roles: RoleName[],
 *   createdAt: string,
 *   lockedAt?: string | null,
 *   canLock: boolean,
 *   canUnlock: boolean
 * }} AdminUserSummary
 *
 * @typedef {{ id: string, fullName: string, email: string }} ActorRef
 *
 * @typedef {{
 *   id: string,
 *   email: string,
 *   fullName: string,
 *   phone?: string | null,
 *   address?: string | null,
 *   status: UserStatus,
 *   trustPoints: number,
 *   roles: RoleName[],
 *   createdAt: string,
 *   updatedAt: string,
 *   lock: { reason: string, lockedAt: string, lockedBy?: ActorRef | null } | null,
 *   ownedStore: { id: string, name: string, status: 'ACTIVE' | 'BLOCKED' } | null,
 *   openOrdersAsBuyer: number,
 *   openOrdersAsSeller: number,
 *   canLock: boolean,
 *   canUnlock: boolean
 * }} AdminUserDetail
 *
 * @typedef {{
 *   id: string,
 *   fromStatus: UserStatus,
 *   toStatus: UserStatus,
 *   reason?: string | null,
 *   actor?: ActorRef | null,
 *   createdAt: string
 * }} UserStatusHistoryItem
 *
 * @typedef {{
 *   content: T[],
 *   page: number,
 *   size: number,
 *   hasNext: boolean,
 *   totalElements: number | null
 * }} PagedResponse
 * @template T
 */

export const USER_STATUSES = /** @type {const} */ (['ACTIVE', 'LOCKED', 'PENDING_VERIFICATION'])
export const USER_ROLES = /** @type {const} */ (['USER', 'OWNER', 'STAFF', 'APPRAISER', 'ADMIN'])

/**
 * Danh sách user cho admin. `page` bắt đầu từ 1 (theo PaginationConfig của Backend).
 * Chỉ gửi những bộ lọc có giá trị.
 * @param {{ keyword?: string, status?: string, role?: string, page?: number, size?: number }} params
 * @returns {Promise<PagedResponse<AdminUserSummary>>}
 */

export async function getAdminUsers({ keyword, status, role, page = 1, size = 20 } = {}, { signal } = {}) {
  const params = { page, size, sort: 'createdAt,desc' }
  if (keyword?.trim()) params.keyword = keyword.trim()
  if (status) params.status = status
  if (role) params.role = role

  const data = await apiServer.get('/admin/users', { params, signal })
  return data ?? { content: [], page, size, hasNext: false, totalElements: 0 }
}

/**
 * @param {string} userId
 * @returns {Promise<AdminUserDetail>}
 */
export async function getAdminUserDetail(userId, { signal } = {}) {
  return apiServer.get(`/admin/users/${userId}`, { signal })
}

/**
 * @param {string} userId
 * @returns {Promise<UserStatusHistoryItem[]>}
 */
export async function getAdminUserStatusHistory(userId, { signal } = {}) {
  const data = await apiServer.get(`/admin/users/${userId}/status-history`, { signal })
  return data ?? []
}

/**
 * @param {string} userId
 * @param {{ reason: string }} payload
 * @returns {Promise<AdminUserDetail>}
 */
export async function lockAdminUser(userId, { reason }) {
  return apiServer.patch(`/admin/users/${userId}/lock`, { reason })
}

/**
 * @param {string} userId
 * @param {{ note?: string }} payload
 * @returns {Promise<AdminUserDetail>}
 */
export async function unlockAdminUser(userId, { note } = {}) {
  const body = note?.trim() ? { note: note.trim() } : {}
  return apiServer.patch(`/admin/users/${userId}/unlock`, body)
}