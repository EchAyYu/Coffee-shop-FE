import { useState } from "react";
import { login, me, setToken } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [ten_dn, setU] = useState("");
  const [mat_khau, setP] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      // 🔹 Gửi thông tin đăng nhập
      const { data } = await login({ ten_dn, mat_khau });
      const token = data?.data?.accessToken || data?.accessToken;

      if (!token) throw new Error("Không nhận được accessToken từ server");

      // 🔹 Lưu token
      setToken(token);

      // 🔹 Lấy thông tin user
      const profile = await me();
      const user = profile?.data?.data || profile?.data?.user;
      setUser(user);

      // 🔹 Điều hướng theo role
      if (user?.role === "admin") {
        nav("/admin/dashboard");
      } else {
        nav("/");
      }
    } catch (e) {
      console.error("Login Error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(msg);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white dark:bg-[#1f1f1f] rounded shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="border w-full px-3 py-2 rounded dark:bg-[#333] dark:text-white"
          placeholder="Tên đăng nhập"
          value={ten_dn}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          className="border w-full px-3 py-2 rounded dark:bg-[#333] dark:text-white"
          type="password"
          placeholder="Mật khẩu"
          value={mat_khau}
          onChange={(e) => setP(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="border px-4 py-2 rounded w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
