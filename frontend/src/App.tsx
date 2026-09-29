import { Routes, Route, Navigate } from 'react-router'
import { MenuPage } from './pages/MenuPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { RequireAdmin } from './admin/RequireAdmin'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/producto/:id" element={<ProductPage />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/pedido/:id" element={<OrderConfirmationPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminProductEditPage />} />
          <Route path="/admin/products/:id" element={<AdminProductEditPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
