// ================================
// ☕ LO COFFEE - Checkout Page (prefill + lock/unlock + save to profile)
// ================================
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/api";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";
import AddressFields from "../components/AddressFields";
import Swal from "sweetalert2";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(true);
  const [saveToProfile, setSaveToProfile] = useState(false);

  const [form, setForm] = useState({
    receiver_name: "",
    phone: "",
    emailInvoice: "",
    note: "",
    pttt: "COD",
    address: { street: "", ward: "", district: "", province: "Cần Thơ" },
  });

  // VietQR config
  const VIETQR_BANK_ID = "970436"; // Vietcombank
  const VIETQR_ACCOUNT_NO = "9878303713";
  const VIETQR_ACCOUNT_NAME = "HUYNH NGOC HAU";
  const VIETQR_TEMPLATE = "compact2";

  // Prefill từ API hồ sơ; fallback user context
  useEffect(() => {
    (async () => {
      try {
        const res = await getCheckoutProfile();
        const d = res.data?.data;
        setForm((s) => ({
          ...s,
          receiver_name: d?.user?.fullName || user?.customer?.ho_ten || "",
          phone: d?.user?.phone || user?.customer?.sdt || "",
          emailInvoice: d?.user?.email || user?.customer?.email || "",
          address: {
            street: d?.address?.street || "",
            ward: d?.address?.ward || "",
            district: d?.address?.district || "",
            province: d?.address?.province || "Cần Thơ",
          },
        }));
      } catch {
        setForm((s) => ({
          ...s,
          receiver_name: user?.customer?.ho_ten || "",
          phone: user?.customer?.sdt || "",
          emailInvoice: user?.customer?.email || "",
          address: { ...s.address },
        }));
      }
    })();
  }, [user]);

  // Rời trang nếu giỏ hàng trống
  useEffect(() => {
    if (cart.length === 0 && !loading) navigate("/");
  }, [cart, loading, navigate]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // VietQR URL
  const shortAddress = useMemo(() => (form.address.street + " " + form.address.ward + " " + form.address.district).trim().slice(0, 30), [form.address]);
  const orderDescription = useMemo(
    () => encodeURIComponent(`${form.phone || "SDT"} - ${shortAddress || "DiaChi"} - ${form.receiver_name || "KhachHang"}`),
    [form.phone, shortAddress, form.receiver_name]
  );
  const vietQRUrl = useMemo(
    () =>
      `https://img.vietqr.io/image/${VIETQR_BANK_ID}-${VIETQR_ACCOUNT_NO}-${VIETQR_TEMPLATE}.png?amount=${totalPrice}&addInfo=${orderDescription}&accountName=${encodeURIComponent(
        VIETQR_ACCOUNT_NAME
      )}`,
    [totalPrice, orderDescription]
  );

  async function submitOrder(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.receiver_name || !form.phone || !form.address.street || !form.address.ward || !form.address.district) {
        Swal.fire("Lỗi!", "Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ nhận hàng.", "error");
        setLoading(false);
        return;
      }
      if (form.pttt === "BANK_TRANSFER" && !form.emailInvoice) {
        Swal.fire("Lỗi!", "Vui lòng nhập Email để nhận thông tin thanh toán khi chọn Chuyển khoản.", "error");
        setLoading(false);
        return;
      }

      // Nếu user mở khoá và tick lưu hồ sơ → cập nhật hồ sơ trước
      if (!locked && saveToProfile) {
        await updateCheckoutProfile({
          fullName: form.receiver_name,
          phone: form.phone,
          street: form.address.street,
          ward: form.address.ward,
          district: form.address.district,
          province: form.address.province,
        });
      }

      const payload = {
        ho_ten_nhan: form.receiver_name,
        sdt_nhan: form.phone,
        dia_chi_nhan: [form.address.street, form.address.ward, form.address.district, form.address.province]
          .filter(Boolean)
          .join(", "),
        email_nhan: form.emailInvoice,
        ghi_chu: form.note,
        pttt: form.pttt, // "COD" | "BANK_TRANSFER"
        items: cart.map((i) => ({
          id_mon: i.id_mon || i._id,
          so_luong: i.so_luong,
        })),
      };

      const res = await createOrder(payload);

      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công!",
        text: `Cảm ơn bạn! Mã đơn: #${res.data?.data?.id_don || ""}.`,
        confirmButtonText: "Về trang chủ",
        confirmButtonColor: "#b91c1c",
      }).then(() => {
        clearCart();
        navigate("/");
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại!",
        text: err?.response?.data?.message || err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        confirmButtonColor: "#b91c1c",
      });
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0 && !loading) {
    return <div className="text-center py-10">Giỏ hàng trống. Đang chuyển hướng...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-red-700 mb-8">Xác nhận đơn hàng</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Cột trái: Form */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Thông tin nhận hàng</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!locked} onChange={(e) => setLocked(!e.target.checked)} />
              <span>Thay đổi thông tin</span>
            </label>
          </div>

          <form onSubmit={submitOrder} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.receiver_name}
                onChange={(e) => change("receiver_name", e.target.value)}
                disabled={locked || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => change("phone", e.target.value)}
                disabled={locked || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng <span className="text-red-500">*</span></div>
              <AddressFields value={form.address} onChange={(addr) => change("address", addr)} disabled={locked || loading} />
            </div>

            {/* Email (hóa đơn / bắt buộc nếu chuyển khoản) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {form.pttt === "BANK_TRANSFER" ? <span className="text-red-500">*</span> : "(Để nhận hóa đơn)"}
              </label>
              <input
                type="email"
                value={form.emailInvoice}
                onChange={(e) => change("emailInvoice", e.target.value)}
                required={form.pttt === "BANK_TRANSFER"}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => change("note", e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>

            {/* PTTT */}
            <div className="pt-2">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-2">
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    form.pttt === "COD" ? "bg-red-50 border-red-300 ring-1 ring-red-300" : "hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="pttt"
                    value="COD"
                    checked={form.pttt === "COD"}
                    onChange={(e) => change("pttt", e.target.value)}
                    disabled={loading}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    form.pttt === "BANK_TRANSFER" ? "bg-red-50 border-red-300 ring-1 ring-red-300" : "hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="pttt"
                    value="BANK_TRANSFER"
                    checked={form.pttt === "BANK_TRANSFER"}
                    onChange={(e) => change("pttt", e.target.value)}
                    disabled={loading}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-800">Chuyển khoản ngân hàng (VietQR)</span>
                </label>
              </div>
            </div>

            {/* Tick cập nhật hồ sơ */}
            {!locked && (
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} />
                <span>Cập nhật vào hồ sơ</span>
              </label>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full px-6 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </div>
          </form>
        </div>

        {/* Cột phải: Tóm tắt + VietQR */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 h-fit lg:sticky top-28">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-4 text-gray-800">
            Tóm tắt đơn hàng ({cart.length} món)
          </h2>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 border-b border-gray-200 pb-4">
            {cart.map((item) => (
              <div key={item.id_mon || item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.anh || item.imageUrl || "https://placehold.co/64x64/F9F5EC/A1887F?text=O"}
                    alt={item.ten_mon}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm leading-tight">{item.ten_mon || item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">SL: {item.so_luong}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800 text-sm">
                  {(item.so_luong * (Number(item.gia) || 0)).toLocaleString("vi-VN")} ₫
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-lg text-gray-800 pt-2">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{totalPrice.toLocaleString("vi-VN")} ₫</span>
            </div>
          </div>

          {form.pttt === "BANK_TRANSFER" && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold mb-3 text-gray-800">Thông tin chuyển khoản:</h3>
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-800 space-y-1">
                <p>
                  Ngân hàng: <span className="font-medium">Vietcombank</span>
                </p>
                <p>
                  Số tài khoản: <span className="font-medium">{VIETQR_ACCOUNT_NO}</span>
                </p>
                <p>
                  Chủ tài khoản: <span className="font-medium">{VIETQR_ACCOUNT_NAME}</span>
                </p>
                <p>
                  Số tiền: <span className="font-medium text-red-600">{totalPrice.toLocaleString("vi-VN")} ₫</span>
                </p>
                <p>
                  Nội dung:{" "}
                  <span className="font-medium">
                    {form.phone} - {shortAddress} - {form.receiver_name}
                  </span>
                </p>
                <img src={vietQRUrl} alt="VietQR Code" className="mt-3 max-w-[160px] mx-auto border rounded shadow-sm" />
                <p className="text-xs mt-2 text-center text-blue-700">(Quét mã QR bằng ứng dụng ngân hàng)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
