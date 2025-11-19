// src/components/admin/TableFormModal.jsx
import { Fragment, useState, useEffect } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { uploadImage } from '../api/adminApi'; 

const AREAS = [
  { value: "indoor", label: "Phòng lạnh" },
  { value: "outside", label: "Ngoài trời" },
  { value: "vip", label: "VIP" },
];

// Các Component Input con (Giữ nguyên)
function FormInput({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} {...props} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
    </div>
  );
}

function FormSelect({ label, id, children, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <select id={id} {...props} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
        {children}
      </select>
    </div>
  );
}

function FormTextArea({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea id={id} rows={3} {...props} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
    </div>
  );
}

export default function TableFormModal({ isOpen, onClose, onSave, initialData }) {
  const isCreating = initialData === null;
  const [formData, setFormData] = useState({});
  
  // 💡 State xử lý file
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.hinh_anh || ""); 
    } else {
      setFormData({
        so_ban: "", ten_ban: "", khu_vuc: "indoor", suc_chua: 4, hinh_anh: "", mo_ta: "",
      });
      setPreviewUrl("");
    }
    setSelectedFile(null); // Reset file
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  // 💡 Handle chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 💡 Handle Submit với Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.so_ban) {
      alert("Số bàn là bắt buộc.");
      return;
    }

    setIsUploading(true);
    try {
      let finalImageUrl = formData.hinh_anh;

      // Nếu có file mới -> Upload
      if (selectedFile) {
        const res = await uploadImage(selectedFile);
        if (res && res.url) {
          finalImageUrl = res.url;
        }
      }

      // Gửi data đã có ảnh về cha
      await onSave({ ...formData, hinh_anh: finalImageUrl }, isCreating);
      onClose();
    } catch (error) {
      console.error("Lỗi upload/lưu:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                  {isCreating ? "Tạo bàn mới" : "Cập nhật bàn"}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Số bàn*" id="so_ban" name="so_ban" value={formData.so_ban || ""} onChange={handleChange} placeholder="B01, V02..." required />
                    <FormInput label="Tên bàn" id="ten_ban" name="ten_ban" value={formData.ten_ban || ""} onChange={handleChange} placeholder="Cạnh cửa sổ..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect label="Khu vực" id="khu_vuc" name="khu_vuc" value={formData.khu_vuc || "indoor"} onChange={handleChange}>
                      {AREAS.map((area) => (<option key={area.value} value={area.value}>{area.label}</option>))}
                    </FormSelect>
                    <FormInput label="Sức chứa" id="suc_chua" name="suc_chua" type="number" min="1" value={formData.suc_chua || 4} onChange={handleChange} />
                  </div>

                  {/* 💡 INPUT FILE CHO BÀN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh bàn</label>
                    <div className="flex items-center gap-4 mb-2">
                       {previewUrl ? (
                         <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />
                       ) : (
                         <div className="h-16 w-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No Img</div>
                       )}
                       <div className="flex-1">
                          <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                       </div>
                    </div>
                    <input type="text" name="hinh_anh" value={formData.hinh_anh || ""} onChange={(e) => { handleChange(e); setPreviewUrl(e.target.value); }} placeholder="Hoặc nhập link ảnh..." className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>

                  <FormTextArea label="Mô tả" id="mo_ta" name="mo_ta" value={formData.mo_ta || ""} onChange={handleChange} placeholder="Tùy chọn..." />

                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" onClick={onClose}>
                      Hủy
                    </button>
                    <button type="submit" disabled={isUploading} className={`inline-flex justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {isUploading ? "Đang tải..." : (isCreating ? "Lưu lại" : "Cập nhật")}
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