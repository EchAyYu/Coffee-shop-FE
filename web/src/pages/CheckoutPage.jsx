import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/api";
import Swal from "sweetalert2";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- THÔNG TIN CẤU HÌNH VIETQR (Đã cập nhật theo yêu cầu) ---
  const VIETQR_BANK_ID = "970436"; // Vietcombank (Giữ nguyên hoặc đổi mã BIN nếu ngân hàng khác)
  const VIETQR_ACCOUNT_NO = "9878303713"; // Số tài khoản mới
  const VIETQR_ACCOUNT_NAME = "HUYNH NGOC HAU"; // Tên chủ tài khoản mới
  const VIETQR_TEMPLATE = "compact2";
  // --- KẾT THÚC CẤU HÌNH VIETQR ---


  // State cho form thông tin khách hàng
  const [formData, setFormData] = useState({
    ho_ten_nhan: "",
    sdt_nhan: "",
    dia_chi_nhan: "",
    email_nhan: "",
    ghi_chu: "",
    pttt: "COD",
  });

  // Tự động điền thông tin nếu user đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ho_ten_nhan: user.ho_ten || prev.ho_ten_nhan || "",
        sdt_nhan: user.sdt || prev.sdt_nhan || "",
        dia_chi_nhan: user.dia_chi || prev.dia_chi_nhan || "",
        email_nhan: user.email || prev.email_nhan || "",
      }));
    }
  }, [user]);

  // Nếu giỏ hàng trống, chuyển về trang chủ
  useEffect(() => {
    if (cart.length === 0 && !loading) {
      console.log("Giỏ hàng trống, chuyển về trang chủ.");
      navigate("/");
    }
  }, [cart, navigate, loading]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.ho_ten_nhan || !formData.sdt_nhan || !formData.dia_chi_nhan) {
        Swal.fire("Lỗi!", "Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ nhận hàng.", "error");
        setLoading(false);
        return;
    }
    if (formData.pttt === 'BANK_TRANSFER' && !formData.email_nhan) {
        Swal.fire("Lỗi!", "Vui lòng nhập Email để nhận thông tin thanh toán khi chọn Chuyển khoản.", "error");
        setLoading(false);
        return;
    }

    const orderPayload = {
      ...formData,
      items: cart.map((item) => ({
        id_mon: item.id_mon || item._id,
        so_luong: item.so_luong,
      })),
    };

    try {
      const response = await createOrder(orderPayload);
      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công!",
        text: `Cảm ơn bạn! Mã đơn hàng: #${response.data?.data?.id_don || ''}. Chi tiết đã được gửi về email (nếu có).`,
        confirmButtonText: "Về trang chủ",
        confirmButtonColor: "#b91c1c",
      }).then(() => {
        clearCart();
        navigate("/");
      });
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại!",
        text: error.response?.data?.message || error.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        confirmButtonColor: "#b91c1c",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- TẠO URL VIETQR ĐỘNG (Đã cập nhật nội dung) ---
  // Nội dung chuyển khoản: SDT - Địa chỉ - Tên KH (Cần mã hóa URL)
  // Giới hạn độ dài địa chỉ để tránh URL quá dài
  const shortAddress = formData.dia_chi_nhan.substring(0, 30); // Lấy tối đa 30 ký tự đầu
  const orderDescription = encodeURIComponent(`${formData.sdt_nhan || 'SDT'} - ${shortAddress || 'DiaChi'} - ${formData.ho_ten_nhan || 'KhachHang'}`);

  // Tạo URL VietQR
  const vietQRUrl = `https://img.vietqr.io/image/${VIETQR_BANK_ID}-${VIETQR_ACCOUNT_NO}-${VIETQR_TEMPLATE}.png?amount=${totalPrice}&addInfo=${orderDescription}&accountName=${encodeURIComponent(VIETQR_ACCOUNT_NAME)}`;
  // --- KẾT THÚC TẠO URL VIETQR ---

  if (cart.length === 0 && !loading) {
      return <div className="text-center py-10">Giỏ hàng trống. Đang chuyển hướng...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-red-700 mb-8">
        Xác nhận đơn hàng
      </h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* === Cột Form thông tin === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Thông tin nhận hàng</h2>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            {/* Input Họ tên */}
            <div>
              <label htmlFor="ho_ten_nhan" className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận <span className="text-red-500">*</span></label>
              <input type="text" id="ho_ten_nhan" name="ho_ten_nhan" required
                     value={formData.ho_ten_nhan} onChange={handleInputChange} disabled={loading}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"/>
            </div>
             {/* Input SĐT */}
            <div>
              <label htmlFor="sdt_nhan" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input type="tel" id="sdt_nhan" name="sdt_nhan" required
                     value={formData.sdt_nhan} onChange={handleInputChange} disabled={loading}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"/>
            </div>
             {/* Input Địa chỉ */}
            <div>
              <label htmlFor="dia_chi_nhan" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng <span className="text-red-500">*</span></label>
              <textarea id="dia_chi_nhan" name="dia_chi_nhan" rows="3" required
                        value={formData.dia_chi_nhan} onChange={handleInputChange} disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"></textarea>
            </div>
             {/* Input Email */}
             <div>
              <label htmlFor="email_nhan" className="block text-sm font-medium text-gray-700 mb-1">
                Email {formData.pttt === 'BANK_TRANSFER' ? <span className="text-red-500">*</span> : '(Để nhận hóa đơn)'}
              </label>
              <input type="email" id="email_nhan" name="email_nhan"
                     value={formData.email_nhan} onChange={handleInputChange} disabled={loading}
                     required={formData.pttt === 'BANK_TRANSFER'}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"/>
            </div>
            {/* Input Ghi chú */}
             <div>
              <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
              <textarea id="ghi_chu" name="ghi_chu" rows="2"
                        value={formData.ghi_chu} onChange={handleInputChange} disabled={loading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"></textarea>
            </div>


            {/* Phương thức thanh toán */}
            <div className="pt-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Phương thức thanh toán <span className="text-red-500">*</span></h3>
              <div className="space-y-2">
                 <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.pttt === 'COD' ? 'bg-red-50 border-red-300 ring-1 ring-red-300' : 'hover:bg-gray-50 border-gray-300'}`}>
                    <input type="radio" name="pttt" value="COD" checked={formData.pttt === 'COD'}
                           onChange={handleInputChange} disabled={loading} className="mr-3 text-red-600 focus:ring-red-500"/>
                    <span className="text-sm font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                 </label>
                 <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.pttt === 'BANK_TRANSFER' ? 'bg-red-50 border-red-300 ring-1 ring-red-300' : 'hover:bg-gray-50 border-gray-300'}`}>
                    <input type="radio" name="pttt" value="BANK_TRANSFER" checked={formData.pttt === 'BANK_TRANSFER'}
                           onChange={handleInputChange} disabled={loading} className="mr-3 text-red-600 focus:ring-red-500"/>
                    <span className="text-sm font-medium text-gray-800">Chuyển khoản ngân hàng (VietQR)</span>
                 </label>
              </div>
            </div>

             {/* ❌ ĐÃ XÓA PHẦN HIỂN THỊ THÔNG TIN CHUYỂN KHOẢN KHỎI ĐÂY */}

            {/* Nút đặt hàng */}
            <div className="pt-6">
               <button type="submit" disabled={loading || cart.length === 0}
                    className="w-full px-6 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                 {/* ... (Nội dung nút không đổi) ... */}
                  {loading ? ( <span className="flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /*...*/></svg> Đang xử lý... </span> ) : 'Xác nhận đặt hàng'}
               </button>
            </div>

          </form>
        </div> {/* === Kết thúc cột Form === */}

        {/* === Cột Tóm tắt đơn hàng === */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 h-fit lg:sticky top-28">
           <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-4 text-gray-800">Tóm tắt đơn hàng ({cart.length} món)</h2>
           {/* Danh sách sản phẩm */}
           <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6 border-b border-gray-200 pb-4">
              {cart.map(item => (
                <div key={item.id_mon || item._id} className="flex items-center justify-between">
                   {/* ... (Hiển thị sản phẩm không đổi) ... */}
                    <div className="flex items-center gap-4"> <img src={item.anh || item.imageUrl || "https://placehold.co/64x64/F9F5EC/A1887F?text=O"} alt={item.ten_mon} className="w-16 h-16 rounded-lg object-cover flex-shrink-0"/> <div className="flex-1"> <p className="font-medium text-gray-800 text-sm leading-tight">{item.ten_mon || item.name}</p> <p className="text-xs text-gray-500 mt-1">SL: {item.so_luong}</p> </div> </div> <p className="font-semibold text-gray-800 text-sm">{(item.so_luong * (Number(item.gia) || 0)).toLocaleString('vi-VN')} ₫</p>
                </div>
              ))}
           </div>
           {/* Tổng tiền */}
           <div className="space-y-2">
             <div className="flex justify-between font-semibold text-lg text-gray-800 pt-2">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{totalPrice.toLocaleString('vi-VN')} ₫</span>
             </div>
           </div>

           {/* === 💡 DI CHUYỂN PHẦN THÔNG TIN CHUYỂN KHOẢN VÀO ĐÂY === */}
           {formData.pttt === 'BANK_TRANSFER' && (
              <div className="mt-6 pt-6 border-t border-gray-200"> {/* Thêm border top */}
                <h3 className="text-md font-semibold mb-3 text-gray-800">Thông tin chuyển khoản:</h3>
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-800 space-y-1">
                    {/* Sử dụng tên ngân hàng thay vì mã BIN */}
                    <p>Ngân hàng: <span className="font-medium">Vietcombank</span></p>
                    <p>Số tài khoản: <span className="font-medium">{VIETQR_ACCOUNT_NO}</span></p>
                    <p>Chủ tài khoản: <span className="font-medium">{VIETQR_ACCOUNT_NAME}</span></p>
                    <p>Số tiền: <span className="font-medium text-red-600">{totalPrice.toLocaleString('vi-VN')} ₫</span></p>
                    {/* Nội dung chuyển khoản đã cập nhật */}
                    <p>Nội dung: <span className="font-medium">{formData.sdt_nhan} - {shortAddress} - {formData.ho_ten_nhan}</span></p>
                    {/* Hiển thị QR Code */}
                    <img src={vietQRUrl} alt="VietQR Code" className="mt-3 max-w-[160px] mx-auto border rounded shadow-sm" /> {/* Tăng kích thước QR */}
                    <p className="text-xs mt-2 text-center text-blue-700">(Quét mã QR bằng ứng dụng ngân hàng)</p>
                </div>
              </div>
            )}
           {/* === KẾT THÚC PHẦN DI CHUYỂN === */}

        </div> {/* === Kết thúc cột Tóm tắt === */}

      </div> {/* === Kết thúc Grid === */}
    </div>
  );
}

