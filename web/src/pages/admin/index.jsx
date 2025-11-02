import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import AdminDashboard from "./AdminDashboard";
import ProductsPage from "./ProductsPage";
import AdminOrders from "./AdminOrders";
import AdminReservations from "./AdminReservations";
import AdminTables from "./AdminTables";
import AdminCustomers from "./AdminCustomers";

// 🌟 1. IMPORT CÁC COMPONENT MỚI 🌟
import AdminLogin from "./AdminLogin";
import AdminProtectedRoute from "./AdminProtectedRoute";

export default function AdminIndex() {
  return (
    <Routes>
      {/* 🌟 2. ROUTE ĐĂNG NHẬP 🌟 */}
      {/* Ghi đè lên index, trỏ thẳng tới /admin */}
      {/* (Trong App.jsx, route là /admin/*, nên path="/" ở đây nghĩa là /admin) */}
      <Route path="/" element={<AdminLogin />} />

      {/* 🌟 3. ROUTE ĐƯỢC BẢO VỆ 🌟 */}
      {/* Tất cả các route bên trong <AdminProtectedRoute> sẽ yêu cầu đăng nhập admin */}
      <Route element={<AdminProtectedRoute />}>
        {/* Tất cả các route này đều dùng chung AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<AdminOrders />} />
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
