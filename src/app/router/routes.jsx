import { createBrowserRouter, Navigate } from 'react-router'

import { AdminLayout } from '@/app/layouts/AdminLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        lazy: () =>
          import('@/features/dashboard/pages/DashboardPage').then((m) => ({
            Component: m.DashboardPage,
          })),
      },
      {
        path: 'disputes',
        lazy: () =>
          import('@/features/disputes/pages/AdminDisputesPage').then((m) => ({
            Component: m.AdminDisputesPage,
          })),
      },
      {
        path: 'disputes/:disputeId',
        lazy: () =>
          import('@/features/disputes/pages/AdminDisputeDetailPage').then((m) => ({
            Component: m.AdminDisputeDetailPage,
          })),
      },
      {
        path: 'withdrawals',
        lazy: () =>
          import('@/features/withdrawals/pages/AdminWithdrawalsPage').then((m) => ({
            Component: m.AdminWithdrawalsPage,
          })),
      },
      {
        path: 'vouchers',
        lazy: () =>
          import('@/features/vouchers/pages/AdminVouchersPage').then((m) => ({
            Component: m.AdminVouchersPage,
          })),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
