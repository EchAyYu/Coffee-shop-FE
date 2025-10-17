import { useState } from "react";
import { login, me, setToken } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const [form, setForm] = useState({ ten_dn: "", mat_khau: "" });
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Gửi yêu cầu đăng nhập
      const { data } = await login(form);
      const token = data?.data?.accessToken || data?.accessToken;

      if (!token) throw new Error("Không nhận được accessToken từ server");

      // 🔹 Lưu token
      setToken(token);

      // 🔹 Lấy thông tin tài khoản
      const profile = await me();
      const user = profile?.data?.data || profile?.data?.user;
      setUser(user);

      // 🔹 Phân quyền
      if (user?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        alert("Bạn không có quyền truy cập trang quản trị");
        nav("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(msg);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-[#1f1f1f] p-6 rounded-lg shadow-lg mt-12">
      <h2 className="text-2xl font-semibold text-center mb-4 text-white">
        Admin Login
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          name="ten_dn"
          placeholder="Tên đăng nhập"
          value={form.ten_dn}
          onChange={(e) => setForm({ ...form, ten_dn: e.target.value })}
          className="block w-full mb-3 p-2 rounded bg-[#333] text-white placeholder-gray-400"
          required
        />
        <input
          name="mat_khau"
          type="password"
          placeholder="Mật khẩu"
          value={form.mat_khau}
          onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
          className="block w-full mb-4 p-2 rounded bg-[#333] text-white placeholder-gray-400"
          required
        />
        {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-[#1E90FF] hover:bg-[#007BFF] text-black font-medium"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
