import { useState } from "react";
import { login, me } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [ten_dn, setU] = useState("");
  const [mat_khau, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { setUser } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await login({ ten_dn, mat_khau });
      const token = data?.accessToken;
      if (token) localStorage.setItem("access_token", token);
      const profile = await me();
      setUser(profile.data?.data || profile.data?.user || null);
      nav("/admin/products");
    } catch (e) {
      setErr(e?.response?.data?.message || "Đăng nhập thất bại");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đăng nhập</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border w-full px-3 py-2"
               placeholder="Tên đăng nhập"
               value={ten_dn} onChange={e=>setU(e.target.value)} />
        <input className="border w-full px-3 py-2"
               type="password" placeholder="Mật khẩu"
               value={mat_khau} onChange={e=>setP(e.target.value)} />
        {err && <div className="text-red-600">{err}</div>}
        <button className="border px-4 py-2 rounded">Đăng nhập</button>
      </form>
    </div>
  );
}
