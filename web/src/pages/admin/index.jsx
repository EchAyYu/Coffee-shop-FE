// src/pages/admin/index.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import AdminDashboard from "./AdminDashboard";
import ProductsPage from "./ProductsPage";
import AdminOrders from "./AdminOrders";

export default function AdminIndex() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<AdminOrders />} />
        {/* wildcard để cuối cùng */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
