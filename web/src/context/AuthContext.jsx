// ================================
// ☕ Coffee Shop FE - Auth Context (Updated for Loyalty Points)
// ================================
import { createContext, useContext, useEffect, useState } from "react";
// 'me' đã được import, chúng ta sẽ import thêm api chính
import api, { login as loginApi, logout as logoutApi, register as registerApi, me } from "../api/api";
import { setToken, clearToken } from "../api/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  
  // ------------------------------------
  // 🌟 BỔ SUNG STATE ĐỂ LƯU ĐIỂM 🌟
  // ------------------------------------
  const [points, setPoints] = useState(0);

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
      setBooted(true); // Đã boot xong dù thành công hay thất bại
    }
  };

  // ------------------------------------
  // 🌟 BỔ SUNG HÀM LẤY ĐIỂM 🌟
  // ------------------------------------
  const fetchPoints = async () => {
    // Chỉ fetch điểm nếu đã đăng nhập (có user/token)
    try {
      // Chúng ta đã tạo API này ở Bước 2
      const res = await api.get("/loyalty/me/points"); 
      setPoints(res.data?.data?.points || 0);
    } catch (err) {
      console.error("Failed to fetch loyalty points:", err);
      setPoints(0); // Reset về 0 nếu có lỗi
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
      fetchPoints(); // 🌟 GỌI HÀM LẤY ĐIỂM KHI LOAD TRANG
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
      
      // Chờ fetch user và fetch điểm xong
      await fetchUser();
      await fetchPoints(); // 🌟 GỌI HÀM LẤY ĐIỂM KHI ĐĂNG NHẬP
      
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
    // Đăng ký xong chưa có điểm, không cần fetch
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
      setPoints(0); // 🌟 RESET ĐIỂM KHI ĐĂNG XUẤT
      
      // Redirect to home page after logout
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
        points,     // 🌟 Export điểm
        setPoints   // 🌟 Export hàm setPoints (để dùng khi đổi voucher)
      }}
    >
      {booted ? children : null}
    </AuthCtx.Provider>
  );
}
