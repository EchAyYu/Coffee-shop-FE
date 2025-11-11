// src/components/admin/TableFormModal.jsx
import { Fragment, useState, useEffect } from 'react';
import { Transition, Dialog } from '@headlessui/react';

// Lấy từ file AdminTablesPage, định nghĩa lại ở đây cho tiện
const AREAS = [
  { value: "indoor", label: "Phòng lạnh" },
  { value: "outside", label: "Ngoài trời" },
  { value: "vip", label: "VIP" },
];
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400";

// --- Component Input (để dùng lại) ---
function FormInput({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  );
}

function FormSelect({ label, id, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {children}
      </select>
    </div>
  );
}

function FormTextArea({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        {...props}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  );
}


// --- Component Modal Chính ---
export default function TableFormModal({ isOpen, onClose, onSave, initialData }) {
  // initialData = null -> Tạo mới
  // initialData = { ...table } -> Chỉnh sửa
  const isCreating = initialData === null;
  const [formData, setFormData] = useState({});

  // Cập nhật form khi 'initialData' thay đổi (khi mở modal để Sửa)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset về trạng thái Mặc định khi Tạo mới
      setFormData({
        so_ban: "",
        ten_ban: "",
        khu_vuc: "indoor",
        suc_chua: 4,
        hinh_anh: DEFAULT_IMAGE,
        mo_ta: "",
      });
    }
  }, [initialData, isOpen]); // Chạy lại khi mở modal hoặc data thay đổi

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.so_ban) {
      Swal.fire("Lỗi!", "Số bàn là bắt buộc.", "error"); // Vẫn dùng Swal cho thông báo
      return;
    }
    // Gửi data về cho component cha (AdminTablesPage) xử lý
    onSave(formData, isCreating);
    onClose(); // Tự động đóng modal
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 mb-6"
                >
                  {isCreating ? "Tạo bàn mới" : "Cập nhật bàn"}
                </Dialog.Title>
                
                {/* --- FORM GIAO DIỆN MỚI --- */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput 
                      label="Số bàn*"
                      id="so_ban"
                      name="so_ban"
                      value={formData.so_ban || ""}
                      onChange={handleChange}
                      placeholder="B01, V02..."
                      required
                    />
                    <FormInput 
                      label="Tên bàn"
                      id="ten_ban"
                      name="ten_ban"
                      value={formData.ten_ban || ""}
                      onChange={handleChange}
                      placeholder="Cạnh cửa sổ..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Khu vực"
                      id="khu_vuc"
                      name="khu_vuc"
                      value={formData.khu_vuc || "indoor"}
                      onChange={handleChange}
                    >
                      {AREAS.map(area => (
                        <option key={area.value} value={area.value}>{area.label}</option>
                      ))}
                    </FormSelect>
                    
                    <FormInput 
                      label="Sức chứa"
                      id="suc_chua"
                      name="suc_chua"
                      type="number"
                      min="1"
                      value={formData.suc_chua || 4}
                      onChange={handleChange}
                    />
                  </div>

                  <FormInput 
                    label="URL Hình ảnh"
                    id="hinh_anh"
                    name="hinh_anh"
                    value={formData.hinh_anh || ""}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />

                  <FormTextArea 
                    label="Mô tả"
                    id="mo_ta"
                    name="mo_ta"
                    value={formData.mo_ta || ""}
                    onChange={handleChange}
                    placeholder="Tùy chọn..."
                  />

                  {/* Nút Bấm */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      onClick={onClose}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                      {isCreating ? "Lưu lại" : "Cập nhật"}
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