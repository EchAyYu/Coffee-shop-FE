import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import AdminDashboard from "./AdminDashboard";
import ProductsPage from "./ProductsPage";
import AdminOrders from "./AdminOrders";
import AdminReservations from "./AdminReservations";
import AdminTables from "./AdminTables";
import AdminCustomers from "./AdminCustomers";
import AdminLogin from "./AdminLogin";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminVouchersPage from "./AdminVouchersPage";
import AdminReviewsPage from "./AdminReviewsPage";
import AdminPromotions from "./AdminPromotions";

// 💡 1. IMPORT CÁC FILE MỚI
import AdminEmployees from "./AdminEmployees";
import AdminRoleGuard from "./AdminRoleGuard";


export default function AdminIndex() {
  return (
    <Routes>
      {/* 1. ROUTE ĐĂNG NHẬP (Giữ nguyên) */}
      <Route path="/" element={<AdminLogin />} />

      {/* 2. ROUTE ĐƯỢC BẢO VỆ (Kiểm tra Token + Tải User) */}
      <Route element={<AdminProtectedRoute />}>
        {/* Tất cả các route này đều dùng chung AdminLayout (Sidebar) */}
        <Route element={<AdminLayout />}>
          
          {/* 💡 3. ROUTE CHUNG (Admin & Employee) */}
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reservations" element={<AdminReservations />} />
          
          {/* 💡 4. ROUTE CHỈ ADMIN (Được bảo vệ bằng RoleGuard) */}
          <Route element={<AdminRoleGuard allowedRoles={['admin']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="vouchers" element={<AdminVouchersPage />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="employees" element={<AdminEmployees />} />
          </Route>

          {/* Mọi route không khớp sẽ quay về trang mặc định */}
          <Route path="*" element={<Navigate to="orders" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}