import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminWithdrawalsPage } from '@/features/withdrawals/pages/AdminWithdrawalsPage'
import { ApiError } from '@/services/api/ApiError'
import * as withdrawalService from '@/services/withdrawals/adminWithdrawalService'
import { renderWithProviders } from '@/test/testUtils'

vi.mock('@/services/withdrawals/adminWithdrawalService', () => ({
  getAdminWithdrawals: vi.fn(),
  approveWithdrawal: vi.fn(),
  completeWithdrawal: vi.fn(),
  rejectWithdrawal: vi.fn(),
  failWithdrawal: vi.fn(),
}))

describe('AdminWithdrawalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays state-specific actions and requires reason when rejecting', async () => {
    vi.mocked(withdrawalService.getAdminWithdrawals).mockResolvedValue([
      {
        id: 101,
        walletId: 7,
        amount: 500000,
        bankName: 'Vietcombank',
        maskedBankAccountNumber: '****1234',
        bankAccountHolder: 'NGUYEN VAN A',
        status: 'REQUESTED',
        requestedAt: '2026-11-24T09:00:00Z',
      },
      {
        id: 102,
        walletId: 8,
        amount: 900000,
        bankName: 'Techcombank',
        maskedBankAccountNumber: '****5678',
        bankAccountHolder: 'TRAN THI B',
        status: 'PROCESSING',
        requestedAt: '2026-11-24T08:00:00Z',
      },
    ])
    vi.mocked(withdrawalService.rejectWithdrawal).mockResolvedValue({
      id: 101,
      status: 'REJECTED',
    })

    const user = userEvent.setup()
    renderWithProviders(<AdminWithdrawalsPage />)

    expect(await screen.findByText('Vietcombank')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hoàn tất' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Từ chối' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    // Submitting without reason should show validation error
    await user.click(screen.getAllByRole('button', { name: 'Từ chối' }).at(-1))
    expect(await screen.findByText('Vui lòng nhập lý do.')).toBeInTheDocument()
    expect(withdrawalService.rejectWithdrawal).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Lý do'), 'Sai tên chủ tài khoản')
    await user.click(screen.getAllByRole('button', { name: 'Từ chối' }).at(-1))

    await waitFor(() => {
      expect(withdrawalService.rejectWithdrawal).toHaveBeenCalledWith(101, {
        reason: 'Sai tên chủ tài khoản',
      })
    })
  })

  it('shows ForbiddenState on 403 response', async () => {
    vi.mocked(withdrawalService.getAdminWithdrawals).mockRejectedValue(
      new ApiError({ status: 403, code: 'COMMON_004', message: 'Forbidden' }),
    )

    renderWithProviders(<AdminWithdrawalsPage />)
    expect(await screen.findByText('Không đủ quyền truy cập')).toBeInTheDocument()
  })
})
