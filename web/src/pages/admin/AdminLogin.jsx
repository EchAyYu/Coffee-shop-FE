import { useState } from "react";
// 💡 1. Import hàm và các hằng số
import { adminLogin, adminMe, clearAdminToken } from "../../api/adminApi"; 
import { useNavigate, Link } from "react-router-dom";

// 💡 2. Định nghĩa key để dùng chung với ProtectedRoute
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
      // 💡 3. Sửa lại lời gọi hàm (như đã làm ở bước trước)
      // Hàm này đã tự lưu Token
      await adminLogin(form.ten_dn, form.mat_khau);

      // Lấy thông tin user
      const profile = await adminMe();
      const user = profile?.data?.data || profile?.data?.user;
      
      if (!user || !user.role) {
        throw new Error("Không thể lấy thông tin người dùng.");
      }

      // 💡 4. PHÂN LUỒNG VÀ LƯU TRỮ
      if (user.role === "admin" || user.role === "employee") {
        // 💡 5. FIX LỖI: LƯU USER VÀO LOCALSTORAGE
        // (ProtectedRoute đang tìm key này)
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        
        // 6. Chuyển đến trang dashboard
        nav("/admin/dashboard");
      } else {
        // Nếu đăng nhập thành công nhưng là 'customer'
        setError("Bạn không có quyền truy cập trang quản trị.");
        clearAdminToken(); 
        localStorage.removeItem(ADMIN_USER_KEY); // Xóa user nếu có
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(msg);
      // 💡 7. Xóa thông tin cũ nếu đăng nhập lỗi
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 grid place-items-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
              👑
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LO COFFEE Admin
            </h1>
            <p className="text-gray-600">Đăng nhập vào hệ thống quản trị</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="ten_dn" className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="ten_dn"
                name="ten_dn"
                type="text"
                placeholder="Nhập tên đăng nhập admin/nhân viên"
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
                t Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Footer */}
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