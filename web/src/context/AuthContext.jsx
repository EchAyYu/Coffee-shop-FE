// ================================
// ☕ Coffee Shop FE - Auth Context (Updated for Loyalty Points & Socket)
// ================================
import { createContext, useContext, useEffect, useState } from "react";
import api, { login as loginApi, logout as logoutApi, register as registerApi, me } from "../api/api";
import { setToken, clearToken } from "../api/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  const [points, setPoints] = useState(0);

  // ------------------------------------
  // 🌟 HÀM LẤY ĐIỂM 🌟
  // ------------------------------------
  const fetchPoints = async () => {
    try {
      const res = await api.get("/loyalty/me/points"); 
      setPoints(res.data?.data?.points || 0);
    } catch (err) {
      console.error("Failed to fetch loyalty points:", err);
      setPoints(0); 
    }
  };

  // ===============================
  // 🔹 Lấy thông tin người dùng hiện tại
  // ===============================
  const fetchUser = async () => {
    try {
      const { data } = await me();
      const currentUser = data?.data || data?.user || null;
      setUser(currentUser);
      
      // 💡 Nếu fetch user thành công, gọi luôn fetchPoints
      if (currentUser) {
        await fetchPoints();
      }

    } catch {
      setUser(null);
      setPoints(0); // 💡 Reset điểm nếu fetch user lỗi
      clearToken();
    } finally {
      setBooted(true); 
    }
  };

  // ===============================
  // 🔹 Khi load trang (chỉ gọi fetchUser)
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Chỉ cần gọi fetchUser, fetchUser sẽ tự động gọi fetchPoints
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
      
      // Gọi fetchUser, nó sẽ tự động gọi fetchPoints
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
      setPoints(0); 
      window.location.href = "/";
    }
  };

  return (
    <AuthCtx.Provider 
      value={{ 
        user, 
        setUser, 
        login, 
        logout, 
      	register, 
      	points,   
      	setPoints,
      	// 💡 THÊM EXPORT HÀM NÀY ĐỂ NOTIFICATIONBELL CÓ THỂ GỌI
      	fetchPoints 
      }}
    >
      {booted ? children : null}
    </AuthCtx.Provider>
  );
}
