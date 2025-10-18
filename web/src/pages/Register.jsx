// ================================
// ☕ Coffee Shop FE - Register Page
// ================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorDebug from "../components/ErrorDebug";

export default function Register() {
  const [form, setForm] = useState({ 
    ho_ten: "", 
    ten_dn: "", 
    mat_khau: "", 
    email: "",
    so_dt: "",
    dia_chi: ""
  });
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { register, login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrorDetails(null);

    // Validation
    if (form.mat_khau !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.mat_khau.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // Đăng ký tài khoản
      await register(form);
      
      // Sau khi đăng ký thành công, tự động đăng nhập
      await login(form.ten_dn, form.mat_khau);
      
      // Redirect to customer info page to show the registered information
      navigate("/customer");
    } catch (err) {
      console.error("Register Error:", err);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      
      if (err?.response?.status === 403) {
        errorMessage = "Không có quyền truy cập. Vui lòng liên hệ quản trị viên.";
      } else if (err?.response?.status === 409) {
        errorMessage = "Tên đăng nhập hoặc email đã tồn tại. Vui lòng chọn thông tin khác.";
      } else if (err?.response?.status === 400) {
        errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.";
      } else if (err?.response?.status >= 500) {
        errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
      } else if (!err?.response) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setErrorDetails(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 grid place-items-center text-white font-bold text-2xl mx-auto mb-4">
              L
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LO COFFEE
            </h1>
            <p className="text-gray-600">Tạo tài khoản mới</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="ho_ten" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                id="ho_ten"
                name="ho_ten"
                type="text"
                placeholder="Nhập họ và tên"
                value={form.ho_ten}
                onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="ten_dn" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                id="ten_dn"
                name="ten_dn"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={form.ten_dn}
                onChange={(e) => setForm({ ...form, ten_dn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="so_dt" className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                id="so_dt"
                name="so_dt"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={form.so_dt}
                onChange={(e) => setForm({ ...form, so_dt: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="dia_chi" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                id="dia_chi"
                name="dia_chi"
                type="text"
                placeholder="Nhập địa chỉ"
                value={form.dia_chi}
                onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="mat_khau"
                name="mat_khau"
                type="password"
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                value={form.mat_khau}
                onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <ErrorDebug 
                error={errorDetails} 
                onRetry={() => {
                  setError("");
                  setErrorDetails(null);
                }}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-red-700 hover:text-red-800 font-medium">
                Đăng nhập ngay
              </Link>
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
