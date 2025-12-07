// src/pages/admin/AdminProtectedRoute.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, adminLogout } from "../../api/adminApi";

// Key lưu trong localStorage
const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_USER_KEY = "admin_user";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminProtectedRoute");
  }
  return context;
};

export default function AdminProtectedRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const rawUser = localStorage.getItem(ADMIN_USER_KEY);

      if (!token || !rawUser) {
        navigate("/admin", { replace: true });
        return;
      }

      const parsed = JSON.parse(rawUser);
      // parsed: { id_tk, ten_dn, role } từ /auth/me
      if (!parsed || !parsed.role) {
        navigate("/admin", { replace: true });
        return;
      }

      setUser(parsed);
    } catch (err) {
      console.error("Lỗi parse admin_user từ localStorage:", err);
      localStorage.removeItem(ADMIN_USER_KEY);
      clearAdminToken();
      navigate("/admin", { replace: true });
      return;
    } finally {
      setReady(true);
    }
  }, [navigate]);

  const logout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      clearAdminToken();
      localStorage.removeItem(ADMIN_USER_KEY);
      navigate("/admin", { replace: true });
    }
  };

  if (!ready) {
    // Có thể trả về spinner nếu muốn
    return null;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminAuthContext.Provider value={{ user, logout }}>
      <Outlet />
    </AdminAuthContext.Provider>
  );
}
