import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPlatformVoucher,
  getAdminVoucherByCode,
  getAdminVouchers,
} from '@/services/vouchers/adminVoucherService'

export const adminVoucherKeys = {
  all: ['admin', 'vouchers'],
  list: () => ['admin', 'vouchers', 'list'],
  detail: (code) => ['admin', 'vouchers', 'detail', code],
}

export function useAdminVouchers() {
  return useQuery({
    queryKey: adminVoucherKeys.list(),
    queryFn: ({ signal }) => getAdminVouchers({ signal }),
  })
}

/** @param {string | undefined} code */
export function useAdminVoucherDetail(code) {
  return useQuery({
    queryKey: adminVoucherKeys.detail(code),
    queryFn: ({ signal }) => getAdminVoucherByCode(code, { signal }),
    enabled: Boolean(code),
  })
}

export function useCreatePlatformVoucher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => createPlatformVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminVoucherKeys.list() })
    },
  })
}
