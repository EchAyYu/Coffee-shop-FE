// src/pages/admin/AdminReservations.jsx
// --- PHIÊN BẢN NÂNG CẤP (V2) ---

import { useEffect, useState } from "react";
import { reservations } from "../../api/adminApi";
import Swal from "sweetalert2";
import ReservationDetailModal from "../../components/ReservationDetailModal"; // 💡 Import Modal

// 💡 "Nguồn chân lý" cho trạng thái (Đồng bộ Tiếng Việt)
const STATUS_MAP = {
  pending: { label: "Đang chờ", colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Đã xác nhận", colorClass: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Đã hủy", colorClass: "bg-red-100 text-red-800 border-red-200" },
  done: { label: "Hoàn thành", colorClass: "bg-blue-100 text-blue-800 border-blue-200" },
};

const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.label || "Không rõ";
};

const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.colorClass || "bg-gray-100 text-gray-800 border-gray-200";
};

// --- Component chính ---
export default function AdminReservations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reservations.list();
      setData(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message);
      Swal.fire("Lỗi", "Không thể tải danh sách đặt bàn.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const newStatusKey = newStatus.toLowerCase();
    const newStatusLabel = getStatusLabel(newStatusKey);
    // Giá trị gửi đi là UPPERCASE (như BE của bạn yêu cầu)
    const apiStatus = newStatus.toUpperCase(); 

    Swal.fire({
      title: `Cập nhật trạng thái?`,
      text: `Bạn có chắc muốn đổi trạng thái thành "${newStatusLabel}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reservations.update(id, { status: apiStatus }); // Gửi đi 'CONFIRMED', 'CANCELLED'
          Swal.fire("Thành công!", "Đã cập nhật trạng thái.", "success");
          
          setData((currentData) =>
            currentData.map((item) =>
              item.id_datban === id ? { ...item, trang_thai: apiStatus } : item
            )
          );
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
        }
      }
    });
  };

  // 💡 Hàm mở Modal
  const handleViewDetails = async (id) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await reservations.getById(id); // Gọi API mới
      setSelectedReservation(res.data?.data || null);
    } catch (err) {
      Swal.fire("Lỗi", "Không thể tải chi tiết đặt bàn.", "error");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  // 💡 Hàm đóng Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium text-lg">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📅 Quản lý Đặt bàn</h1>
        <p className="text-gray-600 mt-1">Xác nhận hoặc hủy các yêu cầu đặt bàn của khách hàng.</p>
      </div>

      {/* 2. Bảng Dữ Liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số người</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bàn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item) => {
                const isFinalState = item.trang_thai?.toUpperCase() === "CONFIRMED" || 
                                     item.trang_thai?.toUpperCase() === "CANCELLED" || 
                                     item.trang_thai?.toUpperCase() === "DONE";
                return (
                  <tr key={item.id_datban} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Khách hàng */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.ho_ten}</div>
                      <div className="text-xs text-gray-600">{item.sdt}</div>
                    </td>

                    {/* Thời gian */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(item.ngay_dat).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-xs text-gray-500">{item.gio_dat || ""}</div>
                    </td>

                    {/* Số người */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.so_nguoi} người</div>
                    </td>

                    {/* Bàn */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.Table ? (item.Table.ten_ban || item.Table.so_ban) : <span className="text-gray-400">Chưa gán</span>}
                      </div>
                    </td>
                    
                    {/* Trạng thái */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(item.trang_thai)}`}>
                        {getStatusLabel(item.trang_thai)}
                      </span>
                    </td>

                    {/* Hành động */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(item.id_datban)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Xem chi tiết
                        </button>

                        {/* Chỉ hiển thị nút nếu chưa ở trạng thái cuối */}
                        {!isFinalState && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item.id_datban, "CONFIRMED")}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id_datban, "CANCELLED")}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💡 Render Modal */}
      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={isModalLoading ? null : selectedReservation}
      />
    </div>
  );
}