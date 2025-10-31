// ================================
// ☕ LO COFFEE - Customer Info (view/edit structured address)
// ================================
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AddressFields from "../components/AddressFields";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";

export default function CustomerInfoPage() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    sdt: "",
    address: { street: "", ward: "", district: "", province: "Cần Thơ" },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load hồ sơ chuẩn từ BE
  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCheckoutProfile(); // { success, data }
        const d = res.data?.data;
        setForm({
          ho_ten: d?.user?.fullName || user.customer?.ho_ten || "",
          email: d?.user?.email || user.customer?.email || "",
          sdt: d?.user?.phone || user.customer?.sdt || "",
          address: {
            street: d?.address?.street || "",
            ward: d?.address?.ward || "",
            district: d?.address?.district || "",
            province: d?.address?.province || "Cần Thơ",
          },
        });
      } catch {
        // fallback từ user context nếu GET lỗi
        setForm({
          ho_ten: user?.customer?.ho_ten || "",
          email: user?.customer?.email || "",
          sdt: user?.customer?.sdt || "",
          address: {
            street: "",
            ward: "",
            district: "",
            province: "Cần Thơ",
          },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateCheckoutProfile({
        fullName: form.ho_ten,
        phone: form.sdt,
        street: form.address.street,
        ward: form.address.ward,
        district: form.address.district,
        province: form.address.province,
      });

      // cập nhật context để UI phản ánh ngay
      setUser((cur) => ({
        ...cur,
        customer: {
          ...(cur.customer || {}),
          ho_ten: form.ho_ten,
          email: form.email, // BE không đổi email ở endpoint này; để đồng bộ UI, ta vẫn giữ email cũ.
          sdt: form.sdt,
          dia_chi: [form.address.street, form.address.ward, form.address.district, form.address.province]
            .filter(Boolean)
            .join(", "),
        },
      }));

      setSuccess("Cập nhật thông tin thành công!");
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!user) {
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

  const InfoItem = ({ icon, label, value, iconBgColor, iconColor }) => (
    <div className="flex items-center p-4 bg-gray-50/70 rounded-xl border border-gray-100">
      <div
        className={`h-10 w-10 ${iconBgColor} rounded-lg grid place-items-center mr-4 flex-shrink-0`}
      >
        <span className={`${iconColor} text-lg`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-gray-800 mt-1 truncate">
          {value || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ label, value, color }) => (
    <div className={`text-center p-4 bg-white/60 rounded-lg border border-${color}-100 shadow-sm`}>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );

  const fullAddress = [form.address.street, form.address.ward, form.address.district, form.address.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">👤 Thông tin khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div className="lg:col-span-1 lg:sticky top-28">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 grid place-items-center text-white font-bold text-4xl mx-auto mb-4 uppercase shadow-md">
              {(user.customer?.ho_ten || user.ten_dn || "U").charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 truncate">
              {user.customer?.ho_ten || user.ten_dn || "Khách hàng"}
            </h2>
            <p className="text-gray-500 text-sm mb-6 truncate">
              {user.customer?.email || user.email || <span className="italic">Chưa có email</span>}
            </p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">Chỉnh sửa thông tin</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="ho_ten"
                      type="text"
                      value={form.ho_ten}
                      onChange={(e) => change("ho_ten", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (không chỉnh tại đây)</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="sdt"
                      type="tel"
                      value={form.sdt}
                      onChange={(e) => change("sdt", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                    <AddressFields
                      value={form.address}
                      onChange={(addr) => change("address", addr)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSuccess("");
                      setError("");
                    }}
                    className="w-full sm:w-auto flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 order-2 sm:order-1"
                  >
                    ❌ Hủy
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 order-1 sm:order-2"
                  >
                    💾 Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Thông tin chi tiết</h3>
                <div className="space-y-4">
                  <InfoItem icon="👤" label="Họ và tên" value={form.ho_ten} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                  <InfoItem icon="📧" label="Email" value={form.email} iconBgColor="bg-green-100" iconColor="text-green-600" />
                  <InfoItem icon="📱" label="Số điện thoại" value={form.sdt} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
                  <InfoItem icon="📍" label="Địa chỉ" value={fullAddress} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                  <InfoItem icon="🔑" label="Tên đăng nhập" value={user.ten_dn} iconBgColor="bg-red-100" iconColor="text-red-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Thống kê tài khoản</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Loại tài khoản" value={user.role === "customer" ? "Khách hàng" : user.role} color="blue" />
          <StatCard
            label="Ngày tham gia"
            value={user.customer?.ngay_tao ? new Date(user.customer.ngay_tao).toLocaleDateString("vi-VN") : "—"}
            color="green"
          />
          <StatCard label="Trạng thái" value="Active" color="purple" />
        </div>
      </div>
    </div>
  );
}
