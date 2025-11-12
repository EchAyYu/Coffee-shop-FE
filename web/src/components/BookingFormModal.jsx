import { useEffect, useState, Fragment } from "react";
import { Transition, Dialog } from '@headlessui/react';
import Swal from "sweetalert2";
import { customers, reservations, getProducts } from "../api/api"; // 💡 Import thêm getProducts
import { 
  CheckCircleIcon, 
  PlusIcon, 
  MinusIcon, 
  TrashIcon, 
  ShoppingCartIcon 
} from "@heroicons/react/24/solid";

// --- Input Component (để tái sử dụng) ---
function FormInput({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
      />
    </div>
  );
}

// 💡 (Helper) Hàm định dạng tiền
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
    so_nguoi: table?.suc_chua || 1,
    ghi_chu: "",
    id_ban: table?.id_ban || null,
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡💡💡 STATE MỚI CHO VIỆC ĐẶT MÓN 💡💡💡
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState([]); // Danh sách món
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [cart, setCart] = useState([]); // Giỏ hàng mini
  // 💡💡💡 KẾT THÚC STATE MỚI 💡💡💡

  // Tải thông tin người dùng VÀ MENU khi Modal mở
  useEffect(() => {
    if (isOpen) {
      // Reset state khi mở
      setIsEditingInfo(false);
      setIsLoadingUser(true);
      setFormData({
        ho_ten: "",
        sdt: "",
        ngay_dat: "",
        gio_dat: "",
        so_nguoi: table?.suc_chua || 1,
        ghi_chu: "",
        id_ban: table?.id_ban || null,
      });
      setCart([]); // Reset giỏ hàng
      setShowMenu(false); // Ẩn menu
      setMenu([]); // Xóa menu cũ

      // Gọi API lấy thông tin
      customers.getMyInfo()
        .then(res => {
          const info = res.data?.data || res.data;
          setFormData(prev => ({
            ...prev,
            ho_ten: info.ho_ten || "",
            sdt: info.sdt || "",
          }));
        })
        .catch(err => {
          console.error("Lỗi khi lấy thông tin, khách có thể chưa đăng nhập:", err.message);
          setIsEditingInfo(true); 
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
      
      // 💡 Tải menu
      loadMenu();
    }
  }, [isOpen, table]);

  // 💡 Hàm tải menu
  const loadMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const res = await getProducts(); // Dùng hàm getProducts từ api.js
      setMenu(res.data?.data || []);
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

  // 💡💡💡 HÀM XỬ LÝ GIỎ HÀNG MINI 💡💡💡
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id_mon === product.id_mon);
      if (existingItem) {
        // Tăng số lượng
        return prevCart.map(item => 
          item.id_mon === product.id_mon 
            ? { ...item, so_luong: item.so_luong + 1 } 
            : item
        );
      } else {
        // Thêm mới
        return [...prevCart, { ...product, id_mon: product.id_mon, so_luong: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (id_mon, newQuantity) => {
    if (newQuantity <= 0) {
      // Xóa khỏi giỏ
      setCart(prevCart => prevCart.filter(item => item.id_mon !== id_mon));
    } else {
      // Cập nhật
      setCart(prevCart => 
        prevCart.map(item => 
          item.id_mon === id_mon ? { ...item, so_luong: newQuantity } : item
        )
      );
    }
  };

  const totalCartPrice = cart.reduce((total, item) => total + (item.gia * item.so_luong), 0);
  // 💡💡💡 KẾT THÚC HÀM GIỎ HÀNG 💡💡💡

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const { ho_ten, sdt, ngay_dat, gio_dat, so_nguoi } = formData;
    if (!ho_ten || !sdt || !ngay_dat || !gio_dat || !so_nguoi) {
      Swal.fire("Lỗi!", "Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
      return;
    }
    if (parseInt(so_nguoi) > table.suc_chua) {
      Swal.fire("Lỗi!", `Bàn này chỉ có sức chứa tối đa ${table.suc_chua} người.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // 💡 Chuẩn bị dữ liệu 'items' để gửi đi
      const itemsPayload = cart.map(item => ({
        id_mon: item.id_mon,
        so_luong: item.so_luong
      }));

      // 💡 Gửi 'items' cùng với 'formData'
      await reservations.create({
        ...formData,
        items: itemsPayload // 👈 GỬI DỮ LIỆU MÓN ĂN
      });

      onClose(); // Đóng modal trước
      Swal.fire({
        icon: "success",
        title: "🎉 Đặt bàn thành công!",
        text: cart.length > 0 ? "Đặt bàn và đặt món thành công!" : "Chúng tôi sẽ liên hệ xác nhận sớm nhất.",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi đặt bàn",
        text: err.response?.data?.message || "Không thể đặt bàn",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!table) return null; // Không render gì nếu không có bàn

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay/Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* 💡 TĂNG CHIỀU RỘNG MODAL */}
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                >
                  Đặt bàn {table.ten_ban || table.so_ban}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* --- Thông tin cá nhân (Tự động điền) --- */}
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">Thông tin liên hệ</p>
                      {!isEditingInfo && (
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(true)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Thay đổi
                        </button>
                      )}
                    </div>
                    {isLoadingUser ? (
                      <div className="text-sm text-gray-500">Đang tải thông tin...</div>
                    ) : (
                      <div className="space-y-3">
                        <FormInput 
                          label="Họ tên *"
                          id="ho_ten"
                          name="ho_ten"
                          value={formData.ho_ten}
                          onChange={handleChange}
                          disabled={!isEditingInfo}
                          required
                        />
                        <FormInput 
                          label="Số điện thoại *"
                          id="sdt"
                          name="sdt"
                          value={formData.sdt}
                          onChange={handleChange}
                          disabled={!isEditingInfo}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* --- Thông tin đặt bàn --- */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput 
                      label="Ngày đặt *"
                      id="ngay_dat"
                      name="ngay_dat"
                      type="date"
                      value={formData.ngay_dat}
                      onChange={handleChange}
                      required
                    />
                    <FormInput 
                      label="Giờ đặt *"
                      id="gio_dat"
                    name="gio_dat"
                     type="time"
                      value={formData.gio_dat}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <FormInput 
                    label="Số người *"
                    id="so_nguoi"
                   name="so_nguoi"
                    type="number"
                    min="1"
                    max={table.suc_chua}
                    value={formData.so_nguoi}
                    onChange={handleChange}
                    required
                  />

                  <div>
                    <label htmlFor="ghi_chu" className="block text-sm font-medium text-gray-700">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="ghi_chu"
                      name="ghi_chu"
                      rows={3}
                      value={formData.ghi_chu}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                 </div>

                {/* 💡💡💡 THÊM KHU VỰC ĐẶT MÓN 💡💡💡 */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <label htmlFor="showMenu" className="font-medium text-gray-900 flex items-center gap-2">
                      <ShoppingCartIcon className="w-5 h-5 text-red-700"/>
                      Bạn có muốn đặt món trước không?
                    </label>
                    <input
                      id="showMenu"
                      type="checkbox"
                      checked={showMenu}
                      onChange={(e) => setShowMenu(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-600"
                    />
                  </div>
                  
                  {showMenu && (
                    <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
                      
                      {/* --- Giỏ hàng Mini --- */}
                      {cart.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold">Món đã chọn:</h4>
                          {cart.map(item => (
                            <div key={item.id_mon} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{item.ten_mon}</p>
                                <p className="text-gray-500">{formatCurrency(item.gia)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleUpdateQuantity(item.id_mon, item.so_luong - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                                  {item.so_luong === 1 ? <TrashIcon className="w-4 h-4 text-red-600"/> : <MinusIcon className="w-4 h-4"/>}
                                </button>
                                <span className="font-medium w-6 text-center">{item.so_luong}</span>
                                <button type="button" onClick={() => handleUpdateQuantity(item.id_mon, item.so_luong + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300">
                                  <PlusIcon className="w-4 h-4"/>
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2 text-right font-bold">
                            Tổng tạm tính: {formatCurrency(totalCartPrice)}
                          </div>
                        </div>
                      )}

                      {/* --- Danh sách Menu --- */}
                      <h4 className="font-semibold">Chọn từ thực đơn:</h4>
                      {isLoadingMenu ? (
                        <div>Đang tải thực đơn...</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {menu.map(product => (
                            <div key={product.id_mon} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                              <div className="flex-1 pr-2">
                                <p className="font-medium text-sm">{product.ten_mon}</p>
                                <p className="text-xs text-gray-600">{formatCurrency(product.gia)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                <PlusIcon className="w-5 h-5"/>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* 💡💡💡 KẾT THÚC KHU VỰC ĐẶT MÓN 💡💡💡 */}

                  {/* Nút Bấm */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-red-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-800 disabled:bg-red-400"
                      disabled={isSubmitting}
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