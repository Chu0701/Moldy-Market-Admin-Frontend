import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  getAdminWithdrawals,
  rejectWithdrawal,
} from '@/services/withdrawals/adminWithdrawalService'

export const adminWithdrawalKeys = {
  all: ['admin', 'withdrawals'],
  list: () => ['admin', 'withdrawals', 'list'],
}

export function useAdminWithdrawals() {
  return useQuery({
    queryKey: adminWithdrawalKeys.list(),
    queryFn: ({ signal }) => getAdminWithdrawals({ signal }),
  })
}

export function useWithdrawalAction() {
  const queryClient = useQueryClient()

  return useMutation({
    /**
     * @param {{
     *   action: 'approve' | 'complete' | 'reject' | 'fail',
     *   withdrawalId: number,
     *   reason?: string
     * }} params
     */
    mutationFn: ({ action, withdrawalId, reason }) => {
      switch (action) {
        case 'approve':
          return approveWithdrawal(withdrawalId)
        case 'complete':
          return completeWithdrawal(withdrawalId)
        case 'reject':
          return rejectWithdrawal(withdrawalId, { reason: reason ?? '' })
        case 'fail':
          return failWithdrawal(withdrawalId, { reason: reason ?? '' })
        default:
          throw new Error(`Unsupported withdrawal action: ${action}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.list() })
    },
  })
}
