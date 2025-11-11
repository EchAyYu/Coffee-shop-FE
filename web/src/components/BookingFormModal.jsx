// src/components/BookingFormModal.jsx
import { useEffect, useState, Fragment } from "react";
import { Transition, Dialog } from '@headlessui/react';
import Swal from "sweetalert2";
import { customers, reservations } from "../api/api";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

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

  // Tải thông tin người dùng khi Modal mở
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
          // Nếu lỗi (ví dụ: 401), cho phép người dùng tự điền
          setIsEditingInfo(true); 
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    }
  }, [isOpen, table]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      await reservations.create(formData);
      onClose(); // Đóng modal trước
      Swal.fire({
        icon: "success",
        title: "🎉 Đặt bàn thành công!",
        text: "Chúng tôi sẽ liên hệ xác nhận sớm nhất.",
        timer: 2500,
        showConfirmButton: false,
      });
      // (BookingPage sẽ tự động load lại bàn sau khi modal đóng)
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
        {/* ... (Phần Overlay/Backdrop giữ nguyên) ... */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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