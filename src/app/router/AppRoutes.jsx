import { Routes, Route, Navigate } from 'react-router';
import AuthLayout from '@/app/layouts/AuthLayout';
import AdminLayout from '@/app/layouts/AdminLayout';
import ProtectedRoute from '@/app/router/ProtectedRoute';

import LoginPage from '@/features/auth/pages/LoginPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import UsersPage from '@/features/users/pages/UsersPage';
import StoresPage from '@/features/stores/pages/StoresPage';
import ProductsPage from '@/features/products/pages/ProductsPage';
import OrdersPage from '@/features/orders/pages/OrdersPage';
import DisputesPage from '@/features/disputes/pages/DisputesPage';
import FinancePage from '@/features/finance/pages/FinancePage';

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
        <Route path="/users" element={<UsersPage />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/finance" element={<FinancePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
