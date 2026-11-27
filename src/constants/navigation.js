import { BanknoteArrowUp, LayoutDashboard, ShieldAlert, TicketPercent } from 'lucide-react'

export const ADMIN_NAV_ITEMS = [
  {
    to: '/',
    end: true,
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/disputes',
    labelKey: 'nav.disputes',
    icon: ShieldAlert,
  },
  {
    to: '/withdrawals',
    labelKey: 'nav.withdrawals',
    icon: BanknoteArrowUp,
  },
  {
    to: '/vouchers',
    labelKey: 'nav.vouchers',
    icon: TicketPercent,
  },
]
