import { useEffect, useState, Fragment } from "react";
import { Transition, Dialog } from '@headlessui/react';
import Swal from "sweetalert2";
import { customers, reservations, getProducts } from "../api/api"; 
import { 
  CheckCircleIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon, 
  ShoppingCartIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";

// --- Helper Component: FormInput (Đã nâng cấp Dark Mode) ---
function FormInput({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 py-2.5 px-3 transition-colors"
      />
    </div>
  );
}

// Helper định dạng tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// --- Component Modal Chính ---
export default function BookingFormModal({ isOpen, onClose, table }) {
  const [formData, setFormData] = useState({
    ho_ten: "",
    sdt: "",
    ngay_dat: "",
    gio_dat: "",
    so_nguoi: table?.suc_chua || 2,
    ghi_chu: "",
    id_ban: table?.id_ban || null,
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State cho Menu ---
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [cart, setCart] = useState([]);

  // Reset và tải dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setIsEditingInfo(false);
      setIsLoadingUser(true);
      setFormData({
        ho_ten: "",
        sdt: "",
        ngay_dat: new Date().toISOString().split('T')[0], // Mặc định hôm nay
        gio_dat: "",
        so_nguoi: table?.suc_chua || 2,
        ghi_chu: "",
        id_ban: table?.id_ban || null,
      });
      setCart([]);
      setShowMenu(false);
      setMenu([]);

      // Lấy thông tin khách hàng
      customers.getMyInfo()
        .then(res => {
          const info = res.data?.data || res.data;
          setFormData(prev => ({
            ...prev,
            ho_ten: info.ho_ten || info.ten_kh || "",
            sdt: info.sdt || "",
          }));
        })
        .catch(err => {
          // Khách chưa đăng nhập hoặc lỗi
          setIsEditingInfo(true); 
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
      
      loadMenu();
    }
  }, [isOpen, table]);

  const loadMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const res = await getProducts({ limit: 100 }); // Lấy nhiều món
      const list = res.data?.data?.rows || res.data?.data || [];
      setMenu(list);
    } catch (err) {
      console.error("Lỗi tải menu:", err.message);
    } finally {
      setIsLoadingMenu(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Logic Giỏ hàng ---
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id_mon === product.id_mon);
      if (existingItem) {
        return prevCart.map(item => 
          item.id_mon === product.id_mon ? { ...item, so_luong: item.so_luong + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, id_mon: product.id_mon, so_luong: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (id_mon, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id_mon !== id_mon));
    } else {
      setCart(prevCart => 
        prevCart.map(item => item.id_mon === id_mon ? { ...item, so_luong: newQuantity } : item)
      );
    }
  };

  const totalCartPrice = cart.reduce((total, item) => total + (item.gia * item.so_luong), 0);

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ho_ten, sdt, ngay_dat, gio_dat, so_nguoi } = formData;
    
    if (!ho_ten || !sdt || !ngay_dat || !gio_dat || !so_nguoi) {
      Swal.fire({
        icon: "error",
        title: "Thiếu thông tin",
        text: "Vui lòng điền đầy đủ các trường bắt buộc.",
        confirmButtonColor: "#EA580C"
      });
      return;
    }

    if (parseInt(so_nguoi) > table.suc_chua) {
      Swal.fire({
        icon: "warning",
        title: "Quá sức chứa",
        text: `Bàn này chỉ tối đa ${table.suc_chua} người.`,
        confirmButtonColor: "#EA580C"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = cart.map(item => ({
        id_mon: item.id_mon,
        so_luong: item.so_luong
      }));

await reservations.create({
        ...formData,
        items: itemsPayload 
      });

      onClose();
      Swal.fire({
        icon: "success",
        title: "Gửi yêu cầu thành công!", // Đổi tiêu đề
        text: cart.length > 0 
            ? "Yêu cầu đặt bàn và đặt món của bạn đã được gửi. Lo Coffee sẽ xác nhận sớm nhất." 
            : "Yêu cầu đặt bàn của bạn đã được gửi. Lo Coffee sẽ xác nhận sớm nhất.",
        timer: 4000,
        showConfirmButton: true, // Hiện nút để khách yên tâm bấm đóng
        confirmButtonText: "Đã hiểu",
        confirmButtonColor: "#EA580C" // Màu cam
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi đặt bàn",
        text: err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        confirmButtonColor: "#EA580C"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!table) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-4" enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1E1E1E] p-6 text-left align-middle shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
                
                {/* Header Modal */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                      Đặt bàn: <span className="text-orange-600">{table.ten_ban || `Số ${table.so_ban}`}</span>
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Khu vực: <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{table.khu_vuc}</span> • Sức chứa: {table.suc_chua} người
                    </p>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* 1. Thông tin khách hàng */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Thông tin liên hệ</h4>
                      {!isEditingInfo && (
                        <button type="button" onClick={() => setIsEditingInfo(true)} className="text-xs font-bold text-orange-600 hover:underline">
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                    
                    {isLoadingUser ? (
                      <div className="text-sm text-gray-500 italic">Đang tải thông tin...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Họ tên *" id="ho_ten" name="ho_ten" value={formData.ho_ten} onChange={handleChange} disabled={!isEditingInfo} required />
                        <FormInput label="Số điện thoại *" id="sdt" name="sdt" value={formData.sdt} onChange={handleChange} disabled={!isEditingInfo} required />
                      </div>
                    )}
                  </div>

                  {/* 2. Thông tin đặt bàn */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Ngày đặt *" id="ngay_dat" name="ngay_dat" type="date" min={new Date().toISOString().split('T')[0]} value={formData.ngay_dat} onChange={handleChange} required />
                    <FormInput label="Giờ đến *" id="gio_dat" name="gio_dat" type="time" value={formData.gio_dat} onChange={handleChange} required />
                    <FormInput label="Số người *" id="so_nguoi" name="so_nguoi" type="number" min="1" max={table.suc_chua} value={formData.so_nguoi} onChange={handleChange} required />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ghi chú (Tùy chọn)</label>
                    <textarea name="ghi_chu" rows={2} value={formData.ghi_chu} onChange={handleChange} className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3" placeholder="Ví dụ: Cần ghế trẻ em, tổ chức sinh nhật..." />
                  </div>

                  {/* 3. Khu vực chọn món (Pre-order) */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showMenu ? 'bg-orange-600 border-orange-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}>
                          {showMenu && <CheckCircleIcon className="w-4 h-4 text-white" />}
                        </div>
                        <input type="checkbox" checked={showMenu} onChange={(e) => setShowMenu(e.target.checked)} className="hidden" />
                        <span className="font-bold text-gray-800 dark:text-white group-hover:text-orange-600 transition-colors flex items-center gap-2">
                          <ShoppingCartIcon className="w-5 h-5 text-orange-600"/>
                          Đặt món trước (Pre-order)
                        </span>
                      </label>
                    </div>
                    
                    {showMenu && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-[400px]">
                        
                        {/* Cột trái: Danh sách món */}
                        <div className="flex-1 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Thực đơn</h4>
                          {isLoadingMenu ? (
                            <div className="text-center py-4 text-sm text-gray-500">Đang tải thực đơn...</div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {menu.map(product => (
                                <div key={product.id_mon} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:border-orange-300 transition-colors">
                                  <div className="flex-1 pr-2">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">{product.ten_mon}</p>
                                    <p className="text-xs text-orange-600 font-semibold">{formatCurrency(product.gia)}</p>
                                  </div>
                                  <button type="button" onClick={() => handleAddToCart(product)} className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors">
                                    <PlusIcon className="w-4 h-4"/>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Cột phải: Giỏ hàng mini */}
                        <div className="w-full md:w-1/3 p-4 bg-white dark:bg-[#1a1a1a] flex flex-col">
                          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex justify-between items-center">
                            Món đã chọn
                            {cart.length > 0 && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{cart.length}</span>}
                          </h4>
                          
                          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {cart.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic">
                                <ShoppingCartIcon className="w-8 h-8 mb-2 opacity-20"/>
                                Chưa chọn món nào
                              </div>
                            ) : (
                              cart.map(item => (
                                <div key={item.id_mon} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.ten_mon}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(item.gia)} x {item.so_luong}</p>
                                  </div>
                                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button type="button" onClick={() => handleUpdateQuantity(item.id_mon, item.so_luong - 1)} className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-600">
                                      {item.so_luong === 1 ? <TrashIcon className="w-3 h-3"/> : <MinusIcon className="w-3 h-3"/>}
                                    </button>
                                    <span className="font-bold text-xs w-4 text-center text-gray-800 dark:text-white">{item.so_luong}</span>
                                    <button type="button" onClick={() => handleUpdateQuantity(item.id_mon, item.so_luong + 1)} className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-green-600">
                                      <PlusIcon className="w-3 h-3"/>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {cart.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-end">
                                <span className="text-xs text-gray-500">Tổng tiền món:</span>
                                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalCartPrice)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt bàn"}
                    </button>
                  </div>

                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}