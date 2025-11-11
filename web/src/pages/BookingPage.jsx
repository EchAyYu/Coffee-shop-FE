// src/pages/BookingPage.jsx
// --- PHIÊN BẢN NÂNG CẤP (V2) - TÁCH FORM RA MODAL ---

import { useEffect, useState } from "react"; // 💡 Thêm useState
import Swal from "sweetalert2";
import { tables, reservations } from "../api/api";
import BookingFormModal from "../components/BookingFormModal"; // 💡 THÊM IMPORT MODAL

export default function BookingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState("all");

  // 💡 STATE MỚI ĐỂ QUẢN LÝ MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const areas = [
    { value: "all", label: "Tất cả" },
    { value: "indoor", label: "Phòng lạnh" },
    { value: "outside", label: "Ngoài trời" },
    { value: "vip", label: "VIP" },
  ];

  useEffect(() => {
    loadTables();
  }, [selectedArea]);

  // 💡 Hàm đóng modal cũng sẽ tải lại bàn
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    loadTables(); // Tải lại danh sách bàn khi đóng modal (để cập nhật trạng thái)
  };

  const loadTables = async () => {
    try {
      setLoading(true);
      const params = selectedArea !== "all" ? { khu_vuc: selectedArea } : {};
      const res = await tables.list(params);
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setData(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (Các hàm getStatusColor và getStatusText giữ nguyên) ...
  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700";
      case "occupied": return "bg-red-100 text-red-700";
      case "reserved": return "bg-yellow-100 text-yellow-700";
      case "maintenance": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "available": return "Còn trống";
      case "occupied": return "Đang sử dụng";
      case "reserved": return "Đã đặt";
      case "maintenance": return "Bảo trì";
      default: return status;
    }
  };

  // 💡💡💡 HÀM handleBookTable ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN 💡💡💡
  const handleBookTable = (table) => {
    // 1. Kiểm tra đăng nhập
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập",
        text: "Bạn cần đăng nhập để đặt bàn.",
        confirmButtonText: "Đăng nhập ngay",
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }

    // 2. Nếu đã đăng nhập, mở Modal
    setSelectedTable(table);
    setIsModalOpen(true);
  };
  // 💡💡💡 KẾT THÚC HÀM VIẾT LẠI 💡💡💡


  return (
    <div className="max-w-6xl mx-auto py-12">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-4">
        Đặt bàn tại LO Coffee
      </h2>
      <p className="text-center text-neutral-600 mb-8">
        Chọn bàn phù hợp với nhu cầu của bạn
      </p>

      {/* Nút lọc */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {areas.map((area) => (
          <button
            key={area.value}
            onClick={() => setSelectedArea(area.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedArea === area.value
                ? "bg-red-700 text-white"
                : "bg-white border hover:bg-red-50"
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Đang tải danh sách bàn...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((table) => (
            <div
              key={table.id_ban}
              className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <img
                src={
                  table.hinh_anh ||
                  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                }
                alt={table.ten_ban || table.so_ban}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    {table.ten_ban || `Bàn ${table.so_ban}`}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      table.trang_thai
                    )}`}
                  >
                    {getStatusText(table.trang_thai)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  {table.mo_ta || "Không có mô tả"}
                </p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="flex items-center gap-1">
                    👥 <strong>{table.suc_chua}</strong> người
                  </span>
                  <span className="text-neutral-500 capitalize">
                    📍 {areas.find(a => a.value === table.khu_vuc)?.label || table.khu_vuc}
                  </span>
              _ </div>
                <button
                  disabled={table.trang_thai !== "available"}
                  onClick={() => handleBookTable(table)}
                  className={`w-full px-4 py-2 rounded-xl font-medium transition-colors ${
                    table.trang_thai === "available"
                      ? "bg-red-700 text-white hover:bg-red-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {table.trang_thai === "available"
                    ? "Đặt bàn"
                    : "Không khả dụng"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 💡 RENDER MODAL MỚI Ở ĐÂY */}
      <BookingFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={selectedTable}
      />
    </div>
  );
}