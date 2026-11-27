import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDisputeDetailPage } from '@/features/disputes/pages/AdminDisputeDetailPage'
import * as disputeService from '@/services/disputes/adminDisputeService'
import { renderWithProviders } from '@/test/testUtils'

vi.mock('@/services/disputes/adminDisputeService', async () => {
  const actual = await vi.importActual('@/services/disputes/adminDisputeService')
  return {
    ...actual,
    getAdminDisputeDetail: vi.fn(),
    reviewAdminDispute: vi.fn(),
  }
})

describe('AdminDisputeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders S3 media evidence and submits approval through ConfirmDialog', async () => {
    const openDispute = {
      id: 'disp-1',
      orderId: 'ord-12345678',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      reason: 'DAMAGED',
      description: 'Lens has deep scratches',
      imageUrls: ['https://legacy.example/old.jpg'],
      media: [{ id: 'file-1', viewUrl: 'https://s3.example/evidence-1.jpg' }],
      status: 'OPEN',
      createdAt: '2026-11-24T10:00:00Z',
    }
    vi.mocked(disputeService.getAdminDisputeDetail).mockResolvedValue(openDispute)
    vi.mocked(disputeService.reviewAdminDispute).mockResolvedValue({
      ...openDispute,
      status: 'APPROVED',
      reviewedBy: 'admin-1',
      reviewedAt: '2026-11-25T10:00:00Z',
      decisionNote: 'Refund approved per evidence',
    })

    const user = userEvent.setup()
    renderWithProviders(<AdminDisputeDetailPage />, {
      route: '/disputes/disp-1',
      path: '/disputes/:disputeId',
    })

    const img = await screen.findByAltText('Ảnh bằng chứng số 1')
    expect(img).toHaveAttribute('src', 'https://s3.example/evidence-1.jpg')

    await user.type(screen.getByLabelText('Ghi chú quyết định'), 'Refund approved per evidence')
    await user.click(screen.getByRole('button', { name: 'Xác nhận quyết định' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Chấp thuận & hoàn tiền' }).at(-1))

    await waitFor(() => {
      expect(disputeService.reviewAdminDispute).toHaveBeenCalledWith('disp-1', {
        decision: 'APPROVE',
        note: 'Refund approved per evidence',
      })
    })
  })
})
