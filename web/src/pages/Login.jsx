import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
// Giả sử bạn dùng axios instance, nếu không hãy import axios thường
import axiosClient from "../api/api"; // Hoặc import axios from 'axios'

export default function Login() {
  const [form, setForm] = useState({ ten_dn: "", mat_khau: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- States cho Modal Quên Mật Khẩu ---
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Nhập SĐT, 2: Nhập OTP & Pass mới
  const [forgotData, setForgotData] = useState({ sdt: "", otp: "", newPass: "" });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: "", content: "" }); // type: 'success' | 'error'

  const navigate = useNavigate();
  const { login } = useAuth();

  // --- Xử lý Đăng nhập thường ---
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.ten_dn, form.mat_khau);
      navigate("/customer");
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  // --- Xử lý Quên Mật Khẩu ---
  
  // Bước 1: Gửi yêu cầu lấy OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: "", content: "" });

    try {
      // Gọi API Backend (đường dẫn tùy bạn cấu hình trong router)
      const res = await axiosClient.post("/auth/forgot-password", { sdt: forgotData.sdt });
      
      // Giả lập: In OTP ra console cho dễ thấy
      console.log("OTP TEST:", res.data.test_otp); 
      
      setForgotMsg({ type: "success", content: `Mã OTP test là: ${res.data.test_otp}` });
      setForgotStep(2); // Chuyển sang bước nhập OTP
    } catch (err) {
      setForgotMsg({ type: "error", content: err?.response?.data?.message || "Lỗi gửi OTP" });
    } finally {
      setForgotLoading(false);
    }
  }

  // Bước 2: Đổi mật khẩu với OTP
  async function handleResetPassword(e) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: "", content: "" });

    try {
      await axiosClient.post("/auth/reset-password-otp", {
        sdt: forgotData.sdt,
        otp: forgotData.otp,
        newPassword: forgotData.newPass
      });
      
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      closeModal();
    } catch (err) {
      setForgotMsg({ type: "error", content: err?.response?.data?.message || "Lỗi đổi mật khẩu" });
    } finally {
      setForgotLoading(false);
    }
  }

  const closeModal = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotData({ sdt: "", otp: "", newPass: "" });
    setForgotMsg({ type: "", content: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 relative">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 grid place-items-center text-white font-bold text-2xl mx-auto mb-4">
              L
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">LO COFFEE</h1>
            <p className="text-gray-600">Đăng nhập tài khoản</p>
          </div>

          {/* Form Đăng Nhập */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                value={form.ten_dn}
                onChange={(e) => setForm({ ...form, ten_dn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                value={form.mat_khau}
                onChange={(e) => setForm({ ...form, mat_khau: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                placeholder="Nhập mật khẩu"
              />
            </div>

            {/* Nút Quên mật khẩu */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-400"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
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
                <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700">
                    Đăng nhập Admin
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL QUÊN MẬT KHẨU ================= */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Khôi phục mật khẩu</h3>
              <p className="text-sm text-gray-500 mt-1">
                {forgotStep === 1 ? "Nhập số điện thoại để nhận OTP" : "Nhập mã OTP và mật khẩu mới"}
              </p>
            </div>

            {/* Hiển thị thông báo lỗi/thành công của Modal */}
            {forgotMsg.content && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${forgotMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {forgotMsg.content}
              </div>
            )}

            {forgotStep === 1 ? (
              // --- BƯỚC 1: NHẬP SĐT ---
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={forgotData.sdt}
                    onChange={(e) => setForgotData({...forgotData, sdt: e.target.value})}
                    required
                    placeholder="VD: 0912345678"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:bg-gray-400"
                  >
                    {forgotLoading ? "Đang gửi..." : "Gửi OTP"}
                  </button>
                </div>
              </form>
            ) : (
              // --- BƯỚC 2: NHẬP OTP & PASS MỚI ---
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 số)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-center tracking-widest font-bold"
                    value={forgotData.otp}
                    onChange={(e) => setForgotData({...forgotData, otp: e.target.value})}
                    required
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    value={forgotData.newPass}
                    onChange={(e) => setForgotData({...forgotData, newPass: e.target.value})}
                    required
                    placeholder="Nhập mật khẩu mới"
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-medium disabled:bg-gray-400"
                  >
                    {forgotLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}