import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminVouchersPage } from '@/features/vouchers/pages/AdminVouchersPage'
import { ApiError } from '@/services/api/ApiError'
import * as voucherService from '@/services/vouchers/adminVoucherService'
import { renderWithProviders } from '@/test/testUtils'

vi.mock('@/services/vouchers/adminVoucherService', async () => {
  const actual = await vi.importActual('@/services/vouchers/adminVoucherService')
  return {
    ...actual,
    getAdminVouchers: vi.fn(),
    createPlatformVoucher: vi.fn(),
  }
})

describe('AdminVouchersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists vouchers by issuer tab and creates a PLATFORM voucher', async () => {
    const futureIso = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    vi.mocked(voucherService.getAdminVouchers).mockResolvedValue([
      {
        code: 'MOLDY10',
        discountType: 'PERCENT',
        discountValue: 10,
        remainingQuantity: 50,
        expiredAt: futureIso,
        issuer: 'PLATFORM',
        minimumOrderValue: 100000,
        maximumDiscount: 50000,
        active: true,
      },
      {
        code: 'SHOP20K',
        discountType: 'FIXED',
        discountValue: 20000,
        remainingQuantity: 5,
        expiredAt: futureIso,
        issuer: 'STORE',
        storeId: 'store-12345678',
        active: true,
      },
    ])
    vi.mocked(voucherService.createPlatformVoucher).mockResolvedValue({
      code: 'NEW20',
      discountType: 'PERCENT',
      discountValue: 20,
      remainingQuantity: 100,
      expiredAt: futureIso,
      issuer: 'PLATFORM',
      active: true,
    })

    const user = userEvent.setup()
    renderWithProviders(<AdminVouchersPage />)

    expect(await screen.findByText('MOLDY10')).toBeInTheDocument()
    expect(screen.getByText('SHOP20K')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Toàn sàn/i }))
    expect(screen.getByText('MOLDY10')).toBeInTheDocument()
    expect(screen.queryByText('SHOP20K')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tạo voucher toàn sàn' }))
    await user.type(screen.getByLabelText('Mã voucher'), 'new20')
    await user.type(screen.getByLabelText('Phần trăm giảm (%)'), '20')
    await user.type(screen.getByLabelText('Thời điểm hết hạn'), futureIso.slice(0, 16))
    await user.click(screen.getByRole('button', { name: 'Tạo voucher' }))

    await waitFor(() => {
      expect(voucherService.createPlatformVoucher).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NEW20',
          discountType: 'PERCENT',
          discountValue: 20,
          remainingQuantity: 100,
        }),
      )
    })
  })

  it('maps duplicate VOUCHER_002 code error to Vietnamese i18n text', async () => {
    const futureIso = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    vi.mocked(voucherService.getAdminVouchers).mockResolvedValue([])
    vi.mocked(voucherService.createPlatformVoucher).mockRejectedValue(
      new ApiError({ status: 409, code: 'VOUCHER_002', message: 'Voucher code already exists' }),
    )

    const user = userEvent.setup()
    renderWithProviders(<AdminVouchersPage />)

    await screen.findByText('Chưa có voucher nào')
    await user.click(screen.getByRole('button', { name: 'Tạo voucher toàn sàn' }))
    await user.type(screen.getByLabelText('Mã voucher'), 'DUP10')
    await user.type(screen.getByLabelText('Phần trăm giảm (%)'), '10')
    await user.type(screen.getByLabelText('Thời điểm hết hạn'), futureIso.slice(0, 16))
    await user.click(screen.getByRole('button', { name: 'Tạo voucher' }))

    expect(await screen.findByText('Mã voucher này đã tồn tại trong hệ thống.')).toBeInTheDocument()
    expect(screen.queryByText('Voucher code already exists')).not.toBeInTheDocument()
  })
})
