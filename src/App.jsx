import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import RoleGuard from "./components/routes/RoleGuard";
import PageLoader from "./components/ui/PageLoader";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));

// Admin pages (nested under AdminShell)
const AdminShell = lazy(() => import("./components/admin/AdminShell"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes with sidebar shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]}>
                  <AdminShell />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
