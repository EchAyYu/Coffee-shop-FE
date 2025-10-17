// ===============================
// 🚀 Admin Index Routes
// ===============================
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import AdminDashboard from "./AdminDashboard"; // ✅ SỬA TỪ "./Dashboard" → "./AdminDashboard"
import ProductsPage from "./ProductsPage";

export default function AdminIndex() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductsPage />} />
        {/* Có thể thêm các route khác tại đây */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}