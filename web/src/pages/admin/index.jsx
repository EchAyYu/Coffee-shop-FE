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

//  ===== 💡 1. IMPORT TRANG ĐÁNH GIÁ MỚI 💡 =====
import AdminReviewsPage from "./AdminReviewsPage";


export default function AdminIndex() {
  return (
    <Routes>
      {/* 🌟 2. ROUTE ĐĂNG NHẬP 🌟 */}
      {/* (Trong App.jsx, route là /admin/*, nên path="/" ở đây nghĩa là /admin) */}
      <Route path="/" element={<AdminLogin />} />

      {/* 🌟 3. ROUTE ĐƯỢC BẢO VỆ 🌟 */}
      <Route element={<AdminProtectedRoute />}>
        {/* Tất cả các route này đều dùng chung AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<AdminOrders />} />

          {/* ===== 💡 2. THÊM ROUTE ĐÁNH GIÁ MỚI VÀO ĐÂY 💡 ===== */}
          <Route path="reviews" element={<AdminReviewsPage />} />
          
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="customers" element={<AdminCustomers />} />
          
          {/* Mọi route admin không khớp khác sẽ quay về dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}