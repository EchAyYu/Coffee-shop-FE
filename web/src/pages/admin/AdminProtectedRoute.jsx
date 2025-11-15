import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, adminLogout } from "../../api/adminApi";
import React, { createContext, useContext } from "react";

// 💡 1. Định nghĩa key
const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_USER_KEY = "admin_user";

// Tạo một Context nhỏ CHỈ DÙNG CHO ADMIN
const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

// Component gác cổng chính
export default function AdminProtectedRoute() {
  // 💡 2. Đọc cả TOKEN và USER từ localStorage
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const userString = localStorage.getItem(ADMIN_USER_KEY);
  const user = userString ? JSON.parse(userString) : null;
  
  const navigate = useNavigate();

  // 💡 3. Kiểm tra cả hai
  if (!token || !user) {
    // Nếu thiếu 1 trong 2, xóa tất cả và đá về trang login
    clearAdminToken();
    localStorage.removeItem(ADMIN_USER_KEY);
    return <Navigate to="/admin" replace />;
  }

  // 💡 4. Kiểm tra vai trò
  if (user.role !== 'admin' && user.role !== 'employee') {
    // Nếu có token + user, nhưng role là 'customer'
    clearAdminToken();
    localStorage.removeItem(ADMIN_USER_KEY);
    return <Navigate to="/admin" replace />;
  }

  // Hàm đăng xuất riêng của Admin
  const logout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      // 💡 5. Xóa cả TOKEN và USER khi đăng xuất
      clearAdminToken();
      localStorage.removeItem(ADMIN_USER_KEY);
      navigate("/admin"); // Quay về trang login admin
    }
  };

  // 💡 6. Cung cấp cả `logout` và `user` cho các component con
  return (
    <AdminAuthContext.Provider value={{ logout, user }}>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}