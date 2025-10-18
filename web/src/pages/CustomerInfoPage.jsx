// ================================
// ☕ Coffee Shop FE - Customer Info Page
// ================================
import { useState, useEffect } from "react";
import { customers } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function CustomerInfoPage({ user }) {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    so_dt: "",
    dia_chi: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setUser } = useAuth();

  useEffect(() => {
    loadCustomerInfo();
  }, []);

  // Theo dõi thay đổi của user context
  useEffect(() => {
    if (user && !customerInfo) {
      loadCustomerInfo();
    }
  }, [user]);

  const loadCustomerInfo = async () => {
    setLoading(true);
    try {
      // Ưu tiên sử dụng thông tin từ user context
      if (user) {
        setCustomerInfo(user);
        setForm({
          ho_ten: user.ho_ten || "",
          email: user.email || "",
          so_dt: user.so_dt || "",
          dia_chi: user.dia_chi || ""
        });
        setLoading(false);
        return;
      }

      // Nếu không có user context, thử gọi API để lấy thông tin
      const response = await customers.getMyInfo();
      const info = response.data?.data || response.data;
      setCustomerInfo(info);
      setForm({
        ho_ten: info.ho_ten || "",
        email: info.email || "",
        so_dt: info.so_dt || "",
        dia_chi: info.dia_chi || ""
      });
    } catch (err) {
      console.error("Error loading customer info:", err);
      setError("Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await customers.update(form);
      setSuccess("Cập nhật thông tin thành công!");
      setEditing(false);
      
      // Cập nhật user context
      const updatedInfo = { ...customerInfo, ...form };
      setCustomerInfo(updatedInfo);
      setUser(updatedInfo);
    } catch (err) {
      console.error("Error updating customer info:", err);
      setError(err?.response?.data?.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      ho_ten: customerInfo?.ho_ten || "",
      email: customerInfo?.email || "",
      so_dt: customerInfo?.so_dt || "",
      dia_chi: customerInfo?.dia_chi || ""
    });
    setError("");
    setSuccess("");
  };

  if (loading && !customerInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa đăng nhập</h2>
        <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin cá nhân</p>
        <a 
          href="/login" 
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Đăng nhập ngay
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 Thông tin khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
          ✅ {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 grid place-items-center text-white font-bold text-3xl mx-auto mb-4">
                {(customerInfo.ho_ten || "U").charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {customerInfo.ho_ten || "Khách hàng"}
              </h2>
              <p className="text-gray-600 mb-4">{customerInfo.email}</p>
              
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                >
                  ✏️ Chỉnh sửa thông tin
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            {editing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={form.ho_ten}
                      onChange={(e) => setForm({ ...form, ho_ten: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.so_dt}
                      onChange={(e) => setForm({ ...form, so_dt: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={form.dia_chi}
                      onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    {loading ? "Đang cập nhật..." : "💾 Lưu thay đổi"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    ❌ Hủy
                  </button>
                </div>
              </form>
            ) : (
              /* Display Information */
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-blue-100 grid place-items-center mr-4">
                      <span className="text-blue-600 text-xl">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{customerInfo.ho_ten || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-green-100 grid place-items-center mr-4">
                      <span className="text-green-600 text-xl">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{customerInfo.email || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-orange-100 grid place-items-center mr-4">
                      <span className="text-orange-600 text-xl">📱</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{customerInfo.so_dt || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-purple-100 grid place-items-center mr-4">
                      <span className="text-purple-600 text-xl">📍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-semibold text-gray-900">{customerInfo.dia_chi || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="h-12 w-12 rounded-full bg-red-100 grid place-items-center mr-4">
                      <span className="text-red-600 text-xl">🔑</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tên đăng nhập</p>
                      <p className="font-semibold text-gray-900">{customerInfo.ten_dn || "Chưa cập nhật"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Thống kê tài khoản</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Khách hàng</div>
            <div className="text-sm text-gray-600">Thành viên</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customerInfo.ngay_tao ? new Date(customerInfo.ngay_tao).toLocaleDateString('vi-VN') : "—"}
            </div>
            <div className="text-sm text-gray-600">Ngày tham gia</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <div className="text-sm text-gray-600">Trạng thái</div>
          </div>
        </div>
      </div>
    </div>
  );
}