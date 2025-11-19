import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, vouchers } from "../api/api";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";
import AddressFields from "../components/AddressFields";
import Swal from "sweetalert2";
import { FaMoneyBillWave, FaQrcode, FaTicketAlt, FaArrowLeft, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaStickyNote, FaSpinner } from "react-icons/fa";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(true);
  const [saveToProfile, setSaveToProfile] = useState(false);

  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const [form, setForm] = useState({
    receiver_name: "",
    phone: "",
    emailInvoice: "",
    note: "",
    pttt: "COD",
    address: { street: "", ward: "", district: "", province: "Cần Thơ" },
  });

  // Config VietQR
  const VIETQR_BANK_ID = "970436"; 
  const VIETQR_ACCOUNT_NO = "9878303713";
  const VIETQR_ACCOUNT_NAME = "HUYNH NGOC HAU";
  const VIETQR_TEMPLATE = "compact2";

  // Prefill data
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

  // Tải voucher
  useEffect(() => {
    const fetchMyVouchers = async () => {
      if (!user) return;
      setLoadingVouchers(true);
      try {
        const res = await vouchers.my();
        const activeVouchers = (res.data.data || []).filter(
          (r) => r.status === "active" && (!r.expires_at || new Date(r.expires_at) > new Date())
        );
        setMyVouchers(activeVouchers);
      } catch (err) {
        console.error("Lỗi tải voucher:", err);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchMyVouchers();
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !loading) navigate("/");
  }, [cart, loading, navigate]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const shortAddress = useMemo(
    () => (form.address.street + " " + form.address.ward + " " + form.address.district).trim().slice(0, 30),
    [form.address]
  );

  const orderDescription = useMemo(
    () => encodeURIComponent(`${form.phone || "SDT"} - ${shortAddress || "DiaChi"} - ${form.receiver_name || "KhachHang"}`),
    [form.phone, shortAddress, form.receiver_name]
  );

  const vietQRUrl = useMemo(
    () => `https://img.vietqr.io/image/${VIETQR_BANK_ID}-${VIETQR_ACCOUNT_NO}-${VIETQR_TEMPLATE}.png?amount=${totalPrice - discount}&addInfo=${orderDescription}&accountName=${encodeURIComponent(VIETQR_ACCOUNT_NAME)}`,
    [totalPrice, discount, orderDescription]
  );

  const usableVouchers = useMemo(() => {
    return myVouchers.filter(
      (r) => r.Voucher && totalPrice >= (Number(r.Voucher.min_order) || 0)
    );
  }, [myVouchers, totalPrice]);

  async function applyVoucher(code) {
    const codeToApply = (code || voucherCode).trim();
    if (!codeToApply) return;
    setVoucherCode(codeToApply);

    try {
      const { data } = await vouchers.validate(codeToApply, totalPrice);
      const dc = Number(data?.data?.discount || 0);
      setDiscount(dc);
      Swal.fire({
         icon: 'success',
         title: 'Áp dụng thành công!',
         text: `Bạn được giảm ${dc.toLocaleString("vi-VN")} ₫`,
         timer: 1500, showConfirmButton: false
      });
    } catch (e) {
      setDiscount(0);
      Swal.fire("Lỗi", e?.response?.data?.message || "Mã không hợp lệ", "error");
    }
  }

  function clearVoucher() {
    setVoucherCode("");
    setDiscount(0);
  }

  async function submitOrder(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.receiver_name || !form.phone || !form.address.street || !form.address.ward || !form.address.district) {
        Swal.fire("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin nhận hàng.", "warning");
        setLoading(false);
        return;
      }
      if (form.pttt === "BANK_TRANSFER" && !form.emailInvoice) {
        Swal.fire("Thiếu email", "Vui lòng nhập Email để nhận thông tin chuyển khoản.", "warning");
        setLoading(false);
        return;
      }

      if (!locked && saveToProfile) {
        await updateCheckoutProfile({
          fullName: form.receiver_name, phone: form.phone,
          street: form.address.street, ward: form.address.ward,
          district: form.address.district, province: form.address.province,
        });
      }

      const payload = {
        ho_ten_nhan: form.receiver_name,
        sdt_nhan: form.phone,
        dia_chi_nhan: [form.address.street, form.address.ward, form.address.district, form.address.province].filter(Boolean).join(", "),
        email_nhan: form.emailInvoice,
        ghi_chu: form.note,
        pttt: form.pttt,
        items: cart.map((i) => ({ id_mon: i.id_mon || i._id, so_luong: i.so_luong })),
        voucher_code: discount > 0 ? voucherCode.trim() : undefined,
      };

const res = await createOrder(payload);

      // 💡 SỬA ĐOẠN NÀY: Ẩn mã đơn hàng, thay bằng lời cảm ơn chung
      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công!",
        text: "Cảm ơn bạn đã ủng hộ LO COFFEE. Đơn hàng của bạn đang được xử lý.",
        confirmButtonText: "Về trang chủ",
        confirmButtonColor: "#EA580C", // Màu cam
      }).then(() => {
        clearCart();
        navigate("/");
      });
    } catch (err) {
      Swal.fire("Lỗi", err?.response?.data?.message || "Đặt hàng thất bại.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0 && !loading) return <div className="text-center py-20 dark:text-white">Giỏ hàng trống...</div>;

  // --- Helper: Input Wrapper ---
  const InputGroup = ({ icon, children }) => (
     <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
           {icon}
        </div>
        {children}
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
         <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <FaArrowLeft className="text-gray-600 dark:text-gray-300"/>
         </button>
         <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thanh toán</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Cột Trái: Form Thông tin */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Thông tin nhận hàng */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
                 Thông tin nhận hàng
               </h2>
               <label className="flex items-center gap-2 text-sm text-orange-600 font-medium cursor-pointer select-none">
                 <input type="checkbox" checked={!locked} onChange={(e) => setLocked(!e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500"/>
                 Thay đổi thông tin
               </label>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên *</label>
                     <InputGroup icon={<FaUser/>}>
                        <input type="text" value={form.receiver_name} onChange={(e) => change("receiver_name", e.target.value)} disabled={locked} className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 py-2.5 disabled:bg-gray-100 dark:disabled:bg-gray-700" placeholder="Nguyễn Văn A" />
                     </InputGroup>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại *</label>
                     <InputGroup icon={<FaPhone/>}>
                        <input type="tel" value={form.phone} onChange={(e) => change("phone", e.target.value)} disabled={locked} className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 py-2.5 disabled:bg-gray-100 dark:disabled:bg-gray-700" placeholder="09xx..." />
                     </InputGroup>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email {form.pttt === "BANK_TRANSFER" && "*"}</label>
                  <InputGroup icon={<FaEnvelope/>}>
                     <input type="email" value={form.emailInvoice} onChange={(e) => change("emailInvoice", e.target.value)} className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 py-2.5" placeholder="email@example.com (Nhận hóa đơn)" />
                  </InputGroup>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa chỉ giao hàng *</label>
                  <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${locked ? 'opacity-80 pointer-events-none' : ''}`}>
                     <AddressFields value={form.address} onChange={(addr) => change("address", addr)} disabled={locked} />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
                  <InputGroup icon={<FaStickyNote/>}>
                     <textarea rows={2} value={form.note} onChange={(e) => change("note", e.target.value)} className="pl-10 w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500 py-2.5" placeholder="Lời nhắn cho shipper..." />
                  </InputGroup>
               </div>
               
               {!locked && (
                 <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2 cursor-pointer">
                   <input type="checkbox" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500"/>
                   Lưu thông tin này cho lần sau
                 </label>
               )}
            </div>
          </div>
          
          {/* 2. Phương thức thanh toán */}
          <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
             <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
                Phương thức thanh toán
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.pttt === 'COD' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                   <input type="radio" name="pttt" value="COD" checked={form.pttt === 'COD'} onChange={(e) => change('pttt', e.target.value)} className="text-orange-600 focus:ring-orange-500"/>
                   <div className="flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-600 text-xl"/>
                      <span className="font-medium text-gray-800 dark:text-white">Tiền mặt (COD)</span>
                   </div>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.pttt === 'BANK_TRANSFER' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                   <input type="radio" name="pttt" value="BANK_TRANSFER" checked={form.pttt === 'BANK_TRANSFER'} onChange={(e) => change('pttt', e.target.value)} className="text-orange-600 focus:ring-orange-500"/>
                   <div className="flex items-center gap-2">
                      <FaQrcode className="text-blue-600 text-xl"/>
                      <span className="font-medium text-gray-800 dark:text-white">Chuyển khoản (QR)</span>
                   </div>
                </label>
             </div>

             {/* Thông tin chuyển khoản */}
             {form.pttt === "BANK_TRANSFER" && (
                <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 animate-fade-in">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 space-y-2 text-sm text-blue-900 dark:text-blue-100">
                         <p>Ngân hàng: <b>Vietcombank</b></p>
                         <p>Số TK: <b className="font-mono text-lg">{VIETQR_ACCOUNT_NO}</b></p>
                         <p>Chủ TK: <b>{VIETQR_ACCOUNT_NAME}</b></p>
                         <p>Nội dung: <b className="bg-yellow-200 dark:bg-yellow-800 dark:text-white px-1 rounded text-black">{form.phone} - {form.receiver_name}</b></p>
                      </div>
                      <div className="text-center">
                         <img src={vietQRUrl} alt="QR Code" className="w-32 h-32 rounded-lg border border-white shadow-md bg-white p-1" />
                         <p className="text-xs mt-1 opacity-70">Quét để thanh toán</p>
                      </div>
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Cột Phải: Tóm tắt đơn hàng */}
        <div className="lg:col-span-5">
           <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                 Đơn hàng ({cart.length} món)
              </h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                 {cart.map(item => (
                    <div key={item.id_mon} className="flex gap-4">
                       <div className="relative">
                          <img src={item.anh || "https://placehold.co/64"} alt={item.ten_mon} className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"/>
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">{item.so_luong}</span>
                       </div>
                       <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{item.ten_mon}</h4>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
                             {(Number(item.gia) * item.so_luong).toLocaleString("vi-VN")}₫
                          </p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Voucher */}
              <div className="mb-6">
                 <div className="flex gap-2 mb-3">
                    <input 
                       type="text" 
                       value={voucherCode} 
                       onChange={(e) => setVoucherCode(e.target.value)}
                       placeholder="Nhập mã giảm giá"
                       className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm px-3 py-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white"
                    />
                    <button 
                       onClick={() => applyVoucher()}
                       disabled={!voucherCode}
                       className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                       Áp dụng
                    </button>
                 </div>

                 {/* List Voucher của tôi */}
                 {usableVouchers.length > 0 && (
                    <div className="space-y-2">
                       <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Voucher khả dụng:</p>
                       <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {usableVouchers.map(v => {
                             const isUsed = v.code === voucherCode;
                             return (
                                <div key={v.id} onClick={() => applyVoucher(v.code)} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${isUsed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}>
                                   <div className="flex items-center gap-3">
                                      <FaTicketAlt className={isUsed ? "text-green-600" : "text-orange-500"} />
                                      <div>
                                         <p className="text-sm font-bold text-gray-800 dark:text-white">{v.Voucher.name}</p>
                                         <p className="text-xs text-gray-500">Mã: <span className="font-mono">{v.code}</span></p>
                                      </div>
                                   </div>
                                   {isUsed && <span className="text-xs font-bold text-green-600">Đang dùng</span>}
                                </div>
                             )
                          })}
                       </div>
                    </div>
                 )}
              </div>

              {/* Tổng kết */}
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                 <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString("vi-VN")} ₫</span>
                 </div>
                 {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm font-medium">
                       <span>Giảm giá (Voucher)</span>
                       <span>- {discount.toLocaleString("vi-VN")} ₫</span>
                    </div>
                 )}
                 <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <span>Tổng cộng</span>
                    <span className="text-orange-600 dark:text-orange-500">{(totalPrice - discount).toLocaleString("vi-VN")} ₫</span>
                 </div>
              </div>

              <button 
                 onClick={submitOrder}
                 disabled={loading}
                 className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                 {loading ? <FaSpinner className="animate-spin"/> : "ĐẶT HÀNG NGAY"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}