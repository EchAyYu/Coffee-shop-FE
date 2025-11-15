import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import canthoData from "../constants/cantho.json"; // Dùng đường dẫn và tên biến đúng

// --- Component Input (Giữ nguyên) ---
function FormInput({ id, label, type = "text", value, onChange, placeholder, required = false, disabled = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  );
}

// --- Component Select (Giữ nguyên, đã sửa 'name') ---
function FormSelect({ id, label, name, value, onChange, children, required = false, disabled = false }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        {children}
      </select>
    </div>
  );
}

const initialFormData = {
  ten_nv: "",
  ten_dn: "",
  mat_khau: "",
  email: "",
  sdt: "",
  ngay_sinh: "",
  street: "", 
  selectedDistrict: "", 
  selectedWard: "", 
};

// --- Component Modal (Đã sửa) ---
export default function AddEmployeeModal({ isOpen, onClose, onSubmit, employeeData }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Load danh sách quận/huyện
  useEffect(() => {
    setDistricts(Object.keys(canthoData.districts));
  }, []);

  // Cập nhật phường/xã khi quận thay đổi
  useEffect(() => {
    if (formData.selectedDistrict) {
      setWards(canthoData.districts[formData.selectedDistrict] || []);
    } else {
      setWards([]); 
    }
    if (!isEditMode) {
      setFormData((prev) => ({ ...prev, selectedWard: "" }));
    }
  }, [formData.selectedDistrict, isEditMode]);

  // Tách địa chỉ (dùng cho chế độ Sửa)
  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { street: "", selectedDistrict: "", selectedWard: "" };
    const parts = fullAddress.split(",").map(p => p.trim());
    if (parts.length >= 3) {
      // Giả định: [street, ward, district, ...]
      return {
        street: parts[0] || "",
        selectedWard: parts[1] || "",
        selectedDistrict: parts[2] || "",
      };
    }
    return { street: fullAddress, selectedDistrict: "", selectedWard: "" };
  };

  // Reset form khi modal mở (Logic Thêm/Sửa)
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      if (employeeData) {
        // --- CHẾ ĐỘ SỬA ---
        setIsEditMode(true);
        const { street, selectedDistrict, selectedWard } = parseAddress(employeeData.dia_chi);
        
        setFormData({
          ten_nv: employeeData.ten_nv || "",
          email: employeeData.email || "",
          sdt: employeeData.sdt || "",
          ngay_sinh: employeeData.ngay_sinh ? employeeData.ngay_sinh.split('T')[0] : "", 
          ten_dn: employeeData.Account?.ten_dn || "", 
          mat_khau: "", 
          street: street,
          selectedDistrict: selectedDistrict,
          selectedWard: selectedWard,
        });

        if (selectedDistrict) {
          setWards(canthoData.districts[selectedDistrict] || []);
        }

      } else {
        // --- CHẾ ĐỘ THÊM MỚI ---
        setIsEditMode(false);
        setFormData(initialFormData);
        setWards([]);
      }
    }
  }, [isOpen, employeeData]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Hàm này sẽ được gọi bởi <form onSubmit>
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Submit error in modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Cập nhật thông tin Nhân viên" : "Tạo tài khoản Nhân viên mới"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* 💡 💡 💡 --- SỬA LỖI CẤU TRÚC FORM BẮT ĐẦU TẠI ĐÂY --- 💡 💡 💡 */}
        
        {/* 1. Thẻ <form> BỌC CẢ BODY VÀ FOOTER */}
        <form onSubmit={handleSubmit} className="flex-1 contents flex flex-col">
          
          {/* 2. Body (Giữ nguyên) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* --- Phần Thông tin cá nhân --- */}
            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="px-2 text-lg font-semibold text-gray-800">Thông tin cá nhân</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  id="ten_nv" name="ten_nv"
                  label="Họ và tên"
                  value={formData.ten_nv}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                />
                <FormInput
                  id="email" name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="a.nguyen@gmail.com"
                />
                <FormInput
                  id="sdt" name="sdt"
                  label="Số điện thoại"
                  value={formData.sdt}
                  onChange={handleChange}
                  placeholder="090xxxxxxx"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormInput
                  id="ngay_sinh" name="ngay_sinh"
                  label="Ngày sinh"
                  type="date"
                  value={formData.ngay_sinh}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            {/* --- Phần Tài khoản --- */}
            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="px-2 text-lg font-semibold text-gray-800">Thông tin tài khoản</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="ten_dn" name="ten_dn"
                  label="Tên đăng nhập"
                  value={formData.ten_dn}
                  onChange={handleChange}
                  placeholder="nhanvien_a"
                  required
                  disabled={isEditMode} 
                />
                <FormInput
                  id="mat_khau" name="mat_khau"
                  label={isEditMode ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu"}
                  type="password"
                  value={formData.mat_khau}
                  onChange={handleChange}
                  placeholder={isEditMode ? "Nhập mật khẩu mới" : "Tối thiểu 6 ký tự"}
                  required={!isEditMode} 
                />
              </div>
            </fieldset>

            {/* --- Phần Địa chỉ --- */}
            <fieldset className="border border-gray-300 p-4 rounded-lg">
              <legend className="px-2 text-lg font-semibold text-gray-800">Địa chỉ (Cần Thơ)</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect id="province" label="Tỉnh/Thành phố" value="Cần Thơ" onChange={() => {}} disabled>
                  <option value="Cần Thơ">Cần Thơ</option>
                </FormSelect>
                <FormSelect
                  id="selectedDistrict"
                  name="selectedDistrict"
                  label="Quận/Huyện"
                  value={formData.selectedDistrict}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </FormSelect>
                <FormSelect
                  id="selectedWard"
                  name="selectedWard"
                  label="Phường/Xã"
                  value={formData.selectedWard}
                  onChange={handleChange}
                  disabled={!formData.selectedDistrict} 
                  required
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                ))}
                </FormSelect>
              </div>
              <div className="mt-4">
                <FormInput
                  id="street"
                  name="street"
                  label="Số nhà, tên đường"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Nguyễn Văn Linh"
                  required
                />
              </div>
            </fieldset>
          </div> {/* Kết thúc </div> body của form */}

          {/* 3. Footer (BÂY GIỜ NẰM BÊN TRONG FORM) */}
          <div className="flex items-center justify-end p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button" // Quan trọng: nút Hủy phải là type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 mr-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit" // Nút này là "submit"
              // 💡 4. XÓA BỎ onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting 
                ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...") 
                : (isEditMode ? "Lưu thay đổi" : "Tạo tài khoản")
              }
            </button>
          </div>
        </form> {/* 5. Thẻ </form> KẾT THÚC Ở ĐÂY */}

      </div>
    </div>
  );
}