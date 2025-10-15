import { useState } from "react";
import { auth } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await auth.login(form);
      const token = res.data.token || res.data.accessToken;
      localStorage.setItem("token", token);
      nav("/admin");
    } catch (err) {
      alert("Đăng nhập thất bại");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-[#1f1f1f] p-6 rounded">
      <h2 className="text-2xl mb-4">Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Tên đăng nhập" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="block w-full mb-2 p-2 rounded bg-[#333]" required />
        <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="block w-full mb-4 p-2 rounded bg-[#333]" required />
        <button className="px-4 py-2 rounded bg-[#1E90FF] text-black">Đăng nhập</button>
      </form>
    </div>
  );
}
