import { useState } from "react";
import { adminLogin, adminMe, clearAdminToken } from "../../api/adminApi"; 
import { useNavigate, Link } from "react-router-dom";

const ADMIN_USER_KEY = "admin_user";

export default function AdminLogin() {
  const [form, setForm] = useState({ ten_dn: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminLogin(form.ten_dn, form.mat_khau);

      const profile = await adminMe();
      const user = profile?.data?.data || profile?.data?.user;
      
      if (!user || !user.role) {
        throw new Error("Không thể lấy thông tin người dùng.");
      }

      if (user.role === "admin" || user.role === "employee") {
        // Lưu thông tin user
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        
        // 💡 SỬA LOGIC CHUYỂN HƯỚNG TẠI ĐÂY
        if (user.role === "employee") {
          nav("/employee/orders"); // Nhân viên -> Trang làm việc riêng
        } else {
          nav("/admin/dashboard"); // Admin -> Dashboard quản trị
        }

      } else {
        setError("Bạn không có quyền truy cập trang quản trị.");
        clearAdminToken(); 
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(msg);
      clearAdminToken();
      localStorage.removeItem(ADMIN_USER_KEY);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 grid place-items-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
              👑
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LO COFFEE Admin
            </h1>
            <p className="text-gray-600">Đăng nhập hệ thống quản trị & nhân viên</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="ten_dn" className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="ten_dn"
                name="ten_dn"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={form.ten_dn}
                onChange={(e) => setForm({ ...form, ten_dn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="mat_khau" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="mat_khau"
                name="mat_khau"
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.mat_khau}
                onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-4">
              Quay lại trang chủ?
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <span>←</span>
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}