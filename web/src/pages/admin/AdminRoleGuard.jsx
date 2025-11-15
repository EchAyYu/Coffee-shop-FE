import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminProtectedRoute';

/**
 * Component này kiểm tra xem user (đã đăng nhập) có đúng vai trò hay không.
 * Nó phải được dùng BÊN TRONG <AdminProtectedRoute />
 */
export default function AdminRoleGuard({ allowedRoles }) {
  const { user } = useAdminAuth(); // Lấy user từ context cha

  if (!user || !allowedRoles.includes(user.role)) {
    // Nếu vai trò không được phép (VD: employee vào trang /admin/products)
    // Chuyển hướng họ về trang mặc định (Đơn hàng)
    return <Navigate to="/admin/orders" replace />;
  }

  // Nếu vai trò được phép
  return <Outlet />;
}