// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { adminLogin, adminMe, clearAdminToken } from "../../api/adminApi";
import { useNavigate, Link } from "react-router-dom";

const ADMIN_USER_KEY = "admin_user";

export default function AdminLogin() {
  const [form, setForm] = useState({ ten_dn: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Xoá token/user cũ nếu có
      clearAdminToken();
      localStorage.removeItem(ADMIN_USER_KEY);

      // 1. Login để lấy accessToken
      await adminLogin(form.ten_dn, form.mat_khau);

      // 2. Gọi /auth/me để lấy thông tin account (id_tk, ten_dn, role)
      const meRes = await adminMe();
      const user = meRes?.data?.data;

      if (!user || !user.role) {
        throw new Error("Không lấy được thông tin tài khoản");
      }

      // Lưu thông tin user vào localStorage
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

      // Điều hướng theo role
      if (user.role === "employee") {
        nav("/employee/orders", { replace: true });
      } else {
        // admin
        nav("/admin/orders", { replace: true });
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập thất bại, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-100">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
              👑
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LO COFFEE Admin
            </h1>
            <p className="text-gray-600">
              Đăng nhập hệ thống quản trị & nhân viên
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="ten_dn"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên đăng nhập
              </label>
              <input
                id="ten_dn"
                name="ten_dn"
                type="text"
                autoComplete="username"
                required
                value={form.ten_dn}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2.5 text-gray-900"
                placeholder="Nhập tài khoản..."
              />
            </div>

            <div>
              <label
                htmlFor="mat_khau"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <input
                id="mat_khau"
                name="mat_khau"
                type="password"
                autoComplete="current-password"
                required
                value={form.mat_khau}
                onChange={handleChange}
                className="block w-full rounded-2xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2.5 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-2xl px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-2xl shadow-sm text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Quay lại{" "}
              <Link
                to="/"
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                trang khách hàng
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
