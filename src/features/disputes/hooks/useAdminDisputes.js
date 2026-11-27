import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminDisputeDetail,
  getAdminDisputes,
  reviewAdminDispute,
} from '@/services/disputes/adminDisputeService'

export const adminDisputeKeys = {
  all: ['admin', 'disputes'],
  list: () => ['admin', 'disputes', 'list'],
  detail: (disputeId) => ['admin', 'disputes', 'detail', disputeId],
}

export function useAdminDisputes() {
  return useQuery({
    queryKey: adminDisputeKeys.list(),
    queryFn: ({ signal }) => getAdminDisputes({ signal }),
  })
}

/** @param {string | undefined} disputeId */
export function useAdminDisputeDetail(disputeId) {
  return useQuery({
    queryKey: adminDisputeKeys.detail(disputeId),
    queryFn: ({ signal }) => getAdminDisputeDetail(disputeId, { signal }),
    enabled: Boolean(disputeId),
  })
}

/** @param {string | undefined} disputeId */
export function useReviewAdminDispute(disputeId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => reviewAdminDispute(disputeId, payload),
    onSuccess: (updatedDispute) => {
      if (disputeId && updatedDispute) {
        queryClient.setQueryData(adminDisputeKeys.detail(disputeId), updatedDispute)
      }
      queryClient.invalidateQueries({ queryKey: adminDisputeKeys.list() })
    },
  })
}
