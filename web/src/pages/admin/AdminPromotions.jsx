// =======================================================
// ⚛️ AdminPromotionsPage.jsx (PHIÊN BẢN ĐÃ CẬP NHẬT IMPORT)
// =======================================================
import React, { useState, useEffect } from 'react';
import { 
    FaPlus, FaEdit, FaTrashAlt, FaTag, FaImage, FaToggleOn, FaToggleOff 
} from 'react-icons/fa';
// ⚠️ CẬP NHẬT: Đảm bảo đường dẫn này trỏ đến file adminApi.js mới
import { promotions } from "../../api/adminApi"; 
import PromotionFormModal from '../../components/PromotionFormModal'; 
import { toast } from 'react-toastify'; 

// Hàm Helper để định dạng ngày tháng hiển thị
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Cần thêm .split('T')[0] để tránh lỗi múi giờ khi tạo đối tượng Date từ chuỗi ISO
    // Sử dụng new Date(dateString) sau đó định dạng có thể an toàn hơn nếu backend trả về ISO String
    return new Date(dateString).toLocaleDateString('vi-VN');
};

// Helper để chuyển đổi số thứ sang tên
const getDayName = (dayIndex) => {
    // Lưu ý: lap_lai_thu thường là 0 (Chủ Nhật) đến 6 (Thứ Bảy)
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

export default function AdminPromotionsPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentPromo, setCurrentPromo] = useState(null); 
    const [isEdit, setIsEdit] = useState(false);

    // --- READ: Lấy danh sách khuyến mãi (Hàm này chạy sau khi CRUD thành công) ---
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            // ✅ Dùng hàm getAllForAdmin() từ adminApi.js mới
            const res = await promotions.getAllForAdmin(); 
            // Cấu trúc response thường là res.data.data hoặc res.data
            setPromos(res.data.data || res.data || []); 
        } catch (error) {
            // Xử lý lỗi từ adminApi
            toast.error(error.message || "Lỗi tải danh sách khuyến mãi!");
            console.error("API Error:", error);
            setPromos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // --- Logic mở Form Modal ---
    const handleOpenCreateModal = () => {
        setIsEdit(false);
        // Khi tạo mới, đảm bảo các trường ngày tháng là chuỗi rỗng
        setCurrentPromo(initialFormState); 
        setShowModal(true);
    };

    const handleOpenEditModal = (promo) => {
        setIsEdit(true);
        // Tạo bản sao để tránh chỉnh sửa trực tiếp state
        setCurrentPromo({...promo}); 
        setShowModal(true);
    };

    // --- UPDATE: Toggle Hiển thị ---
    const handleToggleDisplay = async (promo) => {
        try {
            const newDisplayStatus = !promo.hien_thi;
            // ✅ Dùng hàm update() từ adminApi.js mới
            await promotions.update(promo.id_km, { hien_thi: newDisplayStatus });
            toast.success(`Đã ${newDisplayStatus ? 'hiển thị' : 'ẩn'} khuyến mãi: ${promo.ten_km}`);
            
            // Cập nhật trạng thái ngay lập tức trên UI (Optimistic update)
            setPromos(prevPromos => 
                prevPromos.map(p => 
                    p.id_km === promo.id_km ? { ...p, hien_thi: newDisplayStatus } : p
                )
            );
        } catch (error) {
            toast.error(error.message || "Lỗi khi thay đổi trạng thái hiển thị.");
            console.error(error);
        }
    };

    // --- DELETE: Xóa khuyến mãi ---
    const handleDelete = async (id_km) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này? Thao tác này không thể hoàn tác.")) return;

        try {
            // ✅ Dùng hàm delete() từ adminApi.js mới
            await promotions.delete(id_km);
            toast.success("Xóa khuyến mãi thành công!");
            fetchPromotions(); // Tải lại danh sách
        } catch (error) {
            toast.error(error.message || "Lỗi khi xóa khuyến mãi.");
            console.error(error);
        }
    };


    // --- Main Render (Không đổi) ---
    return (
        <div className="p-6 bg-white dark:bg-[#121212] min-h-screen">
            <header className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-800">
                <h1 className="text-3xl font-bold dark:text-white">
                    <FaTag className="inline mr-2 text-orange-500" /> Quản Lý Khuyến Mãi
                </h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                    <FaPlus className="mr-2" /> Thêm Khuyến Mãi
                </button>
            </header>

            {loading ? (
                <div className="text-center py-10 dark:text-gray-400">Đang tải dữ liệu...</div>
            ) : (
                promos.length === 0 ? (
                    <div className="text-center py-10 dark:text-gray-400 bg-gray-50 dark:bg-[#1E1E1E] rounded-lg p-6 shadow-md">
                        <p className='text-lg font-semibold'>Không tìm thấy khuyến mãi nào.</p>
                        <p className='text-sm mt-2'>Hãy thêm một khuyến mãi mới để bắt đầu.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-gray-50 dark:bg-[#1E1E1E] rounded-lg shadow-xl">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-[#202020]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ảnh</th> 
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tên Khuyến Mãi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Giảm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Áp dụng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Hiển thị</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#1E1E1E] divide-y divide-gray-200 dark:divide-gray-700">
                                {promos.map((promo) => (
                                    <tr key={promo.id_km} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                                    {/* Cột Ảnh */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {promo.hinh_anh ? (
                                            <img 
                                                src={promo.hinh_anh} 
                                                alt={promo.ten_km} 
                                                className="w-12 h-12 object-cover rounded-md shadow-sm" 
                                                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} 
                                            />
                                        ) : (
                                            <FaImage className='text-gray-300 text-2xl' title='Không có ảnh' />
                                        )}
                                    </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{promo.id_km}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="font-semibold dark:text-white">{promo.ten_km}</div>
                                            <div className="text-xs italic line-clamp-1">{promo.mo_ta}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold dark:text-red-400">
                                            {promo.pt_giam}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {promo.lap_lai_thu !== null 
                                                ? <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300'>Hàng tuần: {getDayName(promo.lap_lai_thu)}</span>
                                                : <span>{formatDate(promo.ngay_bd)} - {formatDate(promo.ngay_kt)}</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleToggleDisplay(promo)} title={promo.hien_thi ? "Đang hiển thị (Bấm để Ẩn)" : "Đã ẩn (Bấm để Hiển thị)"}>
                                                {promo.hien_thi ? (
                                                    <FaToggleOn className="text-green-500 text-2xl hover:text-green-600 transition-colors" />
                                                ) : (
                                                    <FaToggleOff className="text-red-500 text-2xl hover:text-red-600 transition-colors" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                            <button
                                                onClick={() => handleOpenEditModal(promo)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit className="text-lg" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id_km)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Xóa"
                                            >
                                                <FaTrashAlt className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
            
            {/* Modal component được truyền props */}
            <PromotionFormModal 
                showModal={showModal}
                setShowModal={setShowModal}
                isEdit={isEdit}
                currentPromo={currentPromo}
                onSuccess={fetchPromotions} // Gọi lại API fetch data khi thành công
            />
        </div>
    );
}