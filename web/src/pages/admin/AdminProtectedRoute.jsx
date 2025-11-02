import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, adminLogout } from "../../api/adminApi";
import React, { createContext, useContext } from "react";

const ADMIN_TOKEN_KEY = "admin_access_token";

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
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const navigate = useNavigate();

  if (!token) {
    // Nếu không có token admin, đá về trang login admin
    return <Navigate to="/admin" replace />;
  }

  // Hàm đăng xuất riêng của Admin
  const logout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      clearAdminToken();
      navigate("/admin"); // Quay về trang login admin
    }
  };

  // Cung cấp hàm logout cho các component con (như AdminLayout)
  return (
    <AdminAuthContext.Provider value={{ logout }}>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}
