import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAdminUserDetail,
  getAdminUsers,
  getAdminUserStatusHistory,
  lockAdminUser,
  unlockAdminUser,
} from '@/services/users/adminUserService'

export const adminUserKeys = {
  all: ['admin', 'users'],
  lists: () => ['admin', 'users', 'list'],
  list: (filters) => ['admin', 'users', 'list', filters],
  detail: (userId) => ['admin', 'users', 'detail', userId],
  history: (userId) => ['admin', 'users', 'history', userId],
}

/** @param {{ keyword?: string, status?: string, role?: string, page?: number }} filters */
export function useAdminUsers(filters) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: ({ signal }) => getAdminUsers(filters, { signal }),
    //store data at the old page when loading new page so the table doesn't blink
    placeholderData: keepPreviousData,
  })
}

/** @param {string | undefined} userId */
export function useAdminUserDetail(userId) {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: ({ signal }) => getAdminUserDetail(userId, { signal }),
    enabled: Boolean(userId),
  })
}

/** @param {string | undefined} userId */
export function useAdminUserStatusHistory(userId) {
  return useQuery({
    queryKey: adminUserKeys.history(userId),
    queryFn: ({ signal }) => getAdminUserStatusHistory(userId, { signal }),
    enabled: Boolean(userId),
  })
}

/**
 * Lock/ unlock. Only update cache after server confirmed successfully
 * mutate({ action: 'lock', userId, reason }) | mutate({ action: 'unlock', userId, note })
 */
export function useChangeUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ action, userId, reason, note }) =>
      action === 'lock' ? lockAdminUser(userId, { reason }) : unlockAdminUser(userId, { note }),
    onSuccess: (updatedUser, { userId }) => {
      if (updatedUser) queryClient.setQueryData(adminUserKeys.detail(userId), updatedUser)
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.history(userId) })
    },
  })
}