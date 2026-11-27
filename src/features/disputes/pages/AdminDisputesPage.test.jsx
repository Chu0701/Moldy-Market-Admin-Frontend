import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDisputesPage } from '@/features/disputes/pages/AdminDisputesPage'
import { ApiError } from '@/services/api/ApiError'
import * as disputeService from '@/services/disputes/adminDisputeService'
import { renderWithProviders } from '@/test/testUtils'

vi.mock('@/services/disputes/adminDisputeService', async () => {
  const actual = await vi.importActual('@/services/disputes/adminDisputeService')
  return {
    ...actual,
    getAdminDisputes: vi.fn(),
  }
})

describe('AdminDisputesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders disputes and filters by status tab', async () => {
    vi.mocked(disputeService.getAdminDisputes).mockResolvedValue([
      {
        id: 'disp-1',
        orderId: 'ord-1',
        orderCode: 'ORD-1001',
        firstItemTitle: 'Fujifilm X-T30',
        totalAmount: 14500000,
        reason: 'DAMAGED',
        status: 'OPEN',
        createdAt: '2026-11-24T10:00:00Z',
      },
      {
        id: 'disp-2',
        orderId: 'ord-2',
        orderCode: 'ORD-1002',
        firstItemTitle: 'Mechanical Keyboard',
        totalAmount: 1200000,
        reason: 'WRONG_ITEM',
        status: 'APPROVED',
        createdAt: '2026-11-23T10:00:00Z',
      },
    ])

    const user = userEvent.setup()
    renderWithProviders(<AdminDisputesPage />)

    expect(await screen.findByText('ORD-1001')).toBeInTheDocument()
    expect(screen.getByText('ORD-1002')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Chờ xử lý/i }))

    expect(screen.getByText('ORD-1001')).toBeInTheDocument()
    expect(screen.queryByText('ORD-1002')).not.toBeInTheDocument()
  })

  it('renders ForbiddenState on 403 without leaking raw error', async () => {
    vi.mocked(disputeService.getAdminDisputes).mockRejectedValue(
      new ApiError({ status: 403, code: 'COMMON_004', message: 'Forbidden raw msg' }),
    )

    renderWithProviders(<AdminDisputesPage />)

    expect(await screen.findByText('Không đủ quyền truy cập')).toBeInTheDocument()
    expect(screen.queryByText('Forbidden raw msg')).not.toBeInTheDocument()
  })

  it('renders ErrorState with mapped message on failure', async () => {
    vi.mocked(disputeService.getAdminDisputes).mockRejectedValue(
      new ApiError({ status: 500, code: 'FE_NETWORK_ERROR', message: 'raw server error' }),
    )

    renderWithProviders(<AdminDisputesPage />)

    expect(await screen.findByText('Không thể tải danh sách khiếu nại')).toBeInTheDocument()
    expect(screen.queryByText('raw server error')).not.toBeInTheDocument()
  })
})
