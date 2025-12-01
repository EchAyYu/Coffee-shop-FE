import React, { useState, useEffect } from 'react';
import { 
  FaTag, FaCalendarAlt, FaPercentage, FaClock, FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify'; 
import { promotions } from '../api/adminApi';

// Hàm Helper để chuyển đổi số thứ sang tên
const getDayName = (dayIndex) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return (dayIndex >= 0 && dayIndex <= 6) ? days[dayIndex] : 'N/A';
};

// Hàm khởi tạo form rỗng
const initialFormState = {
    id_km: null,
    ten_km: '',
    mo_ta: '',
    hinh_anh: '',
    pt_giam: 0,
    ngay_bd: '',
    ngay_kt: '',
    lap_lai_thu: '', 
    hien_thi: true,
};

// ===================================
// COMPONENT CHÍNH
// ===================================
export default function PromotionFormModal({ 
    showModal, 
    setShowModal, 
    isEdit, 
    currentPromo, // Dữ liệu khuyến mãi hiện tại
    onSuccess 
}) {
    // Sử dụng state cục bộ cho form
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);

    // Load dữ liệu khi modal mở hoặc thay đổi chế độ chỉnh sửa
    useEffect(() => {
        if (showModal) {
            if (isEdit && currentPromo) {
                // Định dạng lại ngày tháng theo chuẩn YYYY-MM-DD cho input type="date"
                const formattedStartDate = currentPromo.ngay_bd ? new Date(currentPromo.ngay_bd).toISOString().split('T')[0] : '';
                const formattedEndDate = currentPromo.ngay_kt ? new Date(currentPromo.ngay_kt).toISOString().split('T')[0] : '';
                
                setFormData({ 
                    ...currentPromo, 
                    ngay_bd: formattedStartDate, 
                    ngay_kt: formattedEndDate,
                    // Đảm bảo lap_lai_thu là chuỗi rỗng nếu là null/undefined
                    lap_lai_thu: currentPromo.lap_lai_thu === null ? '' : String(currentPromo.lap_lai_thu), 
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [showModal, isEdit, currentPromo]);


    // --- Logic xử lý Form ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;
        
        if (type === 'checkbox') {
            finalValue = checked;
        } else if (name === 'lap_lai_thu') {
            // Lưu là chuỗi rỗng nếu chọn "Không lặp lại"
            finalValue = value; 
        } else if (name === 'pt_giam') {
            finalValue = Number(value);
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const dataToSend = { ...formData };
        
        // Chuyển chuỗi rỗng thành null cho API nếu không lặp lại
        dataToSend.lap_lai_thu = dataToSend.lap_lai_thu === '' ? null : Number(dataToSend.lap_lai_thu);
        dataToSend.hinh_anh = dataToSend.hinh_anh || null;

        // Validation cơ bản
        if (dataToSend.lap_lai_thu === null && (!dataToSend.ngay_bd || !dataToSend.ngay_kt)) {
            setLoading(false);
            return toast.error("Phải chọn Ngày Bắt Đầu và Ngày Kết Thúc nếu không lặp lại theo Thứ!");
        }

        try {
            if (isEdit) {
                await promotions.update(formData.id_km, dataToSend);
                toast.success("Cập nhật khuyến mãi thành công!");
            } else {
                await promotions.create(dataToSend);
                toast.success("Tạo khuyến mãi thành công!");
            }
            setShowModal(false);
            onSuccess(); // Gọi lại hàm fetch data từ AdminPromotionsPage
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu khuyến mãi.");
            console.error("Submit Error:", error);
        } finally {
            setLoading(false);
        }
    };
    
    if (!showModal) return null;

    // Class đồng bộ cho input/select/textarea
    const inputClass = "mt-1 p-2 w-full border rounded-md dark:bg-[#303030] dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#202020] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {isEdit ? "Cập Nhật Khuyến Mãi" : "Tạo Khuyến Mãi Mới"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Tên khuyến mãi */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium dark:text-gray-300"><FaTag className="inline mr-1"/> Tên Khuyến Mãi *</label>
                        <input
                            type="text"
                            name="ten_km"
                            value={formData.ten_km || ''} 
                            onChange={handleInputChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium dark:text-gray-300">Mô Tả Ngắn</label>
                        <textarea
                            name="mo_ta"
                            value={formData.mo_ta || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className={inputClass}
                        ></textarea>
                    </div>

                    {/* Hình ảnh (URL) và Phần trăm giảm */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium dark:text-gray-300"><FaImage className="inline mr-1"/> URL Hình Ảnh</label>
                            <input
                                type="url"
                                name="hinh_anh"
                                value={formData.hinh_anh || ''}
                                onChange={handleInputChange}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium dark:text-gray-300"><FaPercentage className="inline mr-1"/> Phần Trăm Giảm *</label>
                            <input
                                type="number"
                                name="pt_giam"
                                value={formData.pt_giam}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Khuyến mãi theo Ngày hoặc theo Thứ */}
                    <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg dark:border-gray-700">
                        {/* Lặp lại theo Thứ */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium dark:text-gray-300"><FaClock className="inline mr-1"/> Lặp lại theo Thứ</label>
                            <select
                                name="lap_lai_thu"
                                value={formData.lap_lai_thu} 
                                onChange={handleInputChange}
                                className={inputClass}
                            >
                                <option value="">--- Không lặp lại (theo Ngày) ---</option>
                                <option value="0">Chủ Nhật</option>
                                <option value="1">Thứ Hai</option>
                                <option value="2">Thứ Ba</option>
                                <option value="3">Thứ Tư</option>
                                <option value="4">Thứ Năm</option>
                                <option value="5">Thứ Sáu</option>
                                <option value="6">Thứ Bảy</option>
                            </select>
                        </div>
                        
                        {/* Ngày bắt đầu / kết thúc */}
                        {formData.lap_lai_thu === '' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium dark:text-gray-300"><FaCalendarAlt className="inline mr-1"/> Ngày Bắt Đầu *</label>
                                    <input
                                        type="date"
                                        name="ngay_bd"
                                        value={formData.ngay_bd || ''}
                                        onChange={handleInputChange}
                                        required={formData.lap_lai_thu === ''}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium dark:text-gray-300">Ngày Kết Thúc *</label>
                                    <input
                                        type="date"
                                        name="ngay_kt"
                                        value={formData.ngay_kt || ''}
                                        onChange={handleInputChange}
                                        required={formData.lap_lai_thu === ''}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className='flex items-center justify-center bg-gray-100 dark:bg-[#303030] rounded-md mt-1'>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>Áp dụng hàng tuần vào **{getDayName(Number(formData.lap_lai_thu))}**. Không cần ngày kết thúc.</p>
                            </div>
                        )}
                    </div>

                    {/* Hiển thị công khai */}
                    <div className="flex items-center space-x-2 pt-4">
                        <input
                            type="checkbox"
                            name="hien_thi"
                            id="hien_thi"
                            checked={formData.hien_thi}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="hien_thi" className="text-sm font-medium dark:text-gray-300">
                            Hiển thị công khai trên trang chủ
                        </label>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : isEdit ? "Lưu Cập Nhật" : "Tạo Khuyến Mãi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};