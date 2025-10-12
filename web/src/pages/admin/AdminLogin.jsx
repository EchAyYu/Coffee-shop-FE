import { useState } from "react";
import { login } from "../../api/api";

export default function AdminLogin({ onSuccess }) {
  const [tenDn, setTenDn] = useState("");
  const [matKhau, setMatKhau] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await login({ ten_dn: tenDn, mat_khau: matKhau });
      if (res.data.account.role !== "admin") {
        alert("Bạn không có quyền admin!");
        return;
      }
      localStorage.setItem("token", res.data.token);
      onSuccess(res.data.account);
    } catch (err) {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-xl font-semibold text-center">Admin Login</h2>
        <input
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="Tên đăng nhập"
          value={tenDn}
          onChange={(e) => setTenDn(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-xl border"
          placeholder="Mật khẩu"
          type="password"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
        />
        <button className="w-full px-4 py-2 bg-red-700 text-white rounded-xl">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
