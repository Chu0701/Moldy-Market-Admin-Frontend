import { Routes, Route, Navigate } from 'react-router';
import AuthLayout from '@/app/layouts/AuthLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
import ProtectedRoute from '@/app/router/ProtectedRoute';

import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import { AdminUsersPage } from '@/features/users/pages/AdminUsersPage';
import { AdminUserDetailPage } from '@/features/users/pages/AdminUserDetailPage';
import StoresPage from '@/features/stores/pages/StoresPage';
import ProductsPage from '@/features/products/pages/ProductsPage';
import OrdersPage from '@/features/orders/pages/OrdersPage';
import { AdminDisputesPage } from '@/features/disputes/pages/AdminDisputesPage';
import { AdminDisputeDetailPage } from '@/features/disputes/pages/AdminDisputeDetailPage';
import { AdminWithdrawalsPage } from '@/features/withdrawals/pages/AdminWithdrawalsPage';
import { AdminVouchersPage } from '@/features/vouchers/pages/AdminVouchersPage';
 

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Public Route */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/users/:userId" element={<AdminUserDetailPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/disputes" element={<AdminDisputesPage />} />
        <Route path="/disputes/:disputeId" element={<AdminDisputeDetailPage />} />
        <Route path="/withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="/vouchers" element={<AdminVouchersPage />} />
        <Route path="/finance" element={<Navigate to="/withdrawals" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
