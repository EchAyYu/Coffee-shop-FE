// ================================
// ☕ LO COFFEE - Register Page (Fix UI Width)
// ================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorDebug from "../components/ErrorDebug";
import AddressFields from "../components/AddressFields";
import data from "../constants/cantho.json";

export default function Register() {
  const [form, setForm] = useState({
    ho_ten: "",
    ten_dn: "",
    mat_khau: "",
    email: "",
    so_dt: "",
    address: { street: "", ward: "", district: "", province: data.province },
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register, login } = useAuth();

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setErrorDetails(null);

    if (form.mat_khau !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (form.mat_khau.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    // Kiểm tra kỹ hơn structure address
    if (!form.address.district || !form.address.ward || !form.address.street) {
      setError("Vui lòng chọn Quận/Huyện, Phường/Xã và nhập Số nhà, Tên đường");
      return;
    }

    setLoading(true);
    try {
      await register({
        ten_dn: form.ten_dn,
        mat_khau: form.mat_khau,
        ho_ten: form.ho_ten,
        email: form.email,
        sdt: form.so_dt,
        street: form.address.street,
        ward: form.address.ward,
        district: form.address.district,
        province: form.address.province,
      });

      await login(form.ten_dn, form.mat_khau);
      navigate("/customer");
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
      setErrorDetails(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      {/* FIX: Đổi max-w-md thành max-w-xl để form rộng hơn, 
          giúp phần địa chỉ không bị vỡ layout 
      */}
      <div className="max-w-xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 grid place-items-center text-white font-bold text-2xl mx-auto mb-4">
              L
            </div>
            <h1 className="text-3xl font-bold">LO COFFEE</h1>
            <p className="text-gray-600">Tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                value={form.ho_ten}
                onChange={(e) => change("ho_ten", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={loading}
                placeholder="Nhập họ và tên"
              />
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                value={form.ten_dn}
                onChange={(e) => change("ten_dn", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={loading}
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            {/* Grid 2 cột cho Email và SĐT để tiết kiệm diện tích dọc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => change("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={loading}
                    placeholder="Nhập email"
                />
                </div>

                {/* Số điện thoại */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                    type="tel"
                    value={form.so_dt}
                    onChange={(e) => change("so_dt", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={loading}
                    placeholder="Nhập số điện thoại"
                />
                </div>
            </div>

            {/* Địa chỉ Cần Thơ */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-800 border-b pb-1">Địa chỉ liên hệ</h4>
              <div className="mt-3">
                 <AddressFields
                    value={form.address}
                    onChange={(addr) => change("address", addr)}
                    disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mật khẩu */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <input
                    type="password"
                    value={form.mat_khau}
                    onChange={(e) => change("mat_khau", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={loading}
                    minLength={6}
                    placeholder="Ít nhất 6 ký tự"
                />
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                    disabled={loading}
                    placeholder="Nhập lại mật khẩu"
                />
                </div>
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
              className="w-full py-3 mt-4 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký tài khoản"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-red-700 hover:text-red-800 font-medium">
                Đăng nhập ngay
              </Link>
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}