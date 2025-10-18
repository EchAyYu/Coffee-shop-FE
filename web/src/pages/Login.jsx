// ================================
// ☕ Coffee Shop FE - Login Page
// ================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ ten_dn: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.ten_dn, form.mat_khau);
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-red-700 grid place-items-center text-white font-bold text-2xl mx-auto mb-4">
              H
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Highlands Style
            </h1>
            <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                id="mat_khau"
                name="mat_khau"
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.mat_khau}
                onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-red-700 hover:text-red-800 font-medium">
                Đăng ký ngay
              </Link>
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link 
                to="/admin/login" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Đăng nhập Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}