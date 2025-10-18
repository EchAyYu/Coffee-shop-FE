// ================================
// ☕ Coffee Shop FE - Auth Context (Fixed & Stable)
// ================================
import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi, register as registerApi, me } from "../api/api";
import api, { setToken, clearToken } from "../api/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);

  // ===============================
  // 🔹 Lấy thông tin người dùng hiện tại
  // ===============================
  const fetchUser = async () => {
    try {
      const { data } = await me();
      setUser(data?.data || data?.user || null);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setBooted(true);
    }
  };

  // ===============================
  // 🔹 Khi load trang (tự động lấy user)
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUser();
    } else {
      setBooted(true);
    }
  }, []);

  // ===============================
  // 🔹 Đăng nhập
  // ===============================
  const login = async (ten_dn, mat_khau) => {
    try {
      const res = await loginApi({ ten_dn, mat_khau });
      const token = res?.data?.data?.accessToken || res?.data?.accessToken;
      if (!token) throw new Error("Không nhận được accessToken từ server");
      setToken(token);
      await fetchUser();
      return res.data.data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // ===============================
  // 🔹 Đăng ký
  // ===============================
  const register = async (payload) => {
    const res = await registerApi(payload);
    return res.data;
  };

  // ===============================
  // 🔹 Đăng xuất
  // ===============================
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearToken();
      setUser(null);
      // Redirect to home page after logout
      window.location.href = "/";
    }
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, login, logout, register }}>
      {booted ? children : null}
    </AuthCtx.Provider>
  );
}
