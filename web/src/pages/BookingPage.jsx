import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { tables } from "../api/api"; // Đảm bảo đường dẫn đúng
import BookingFormModal from "../components/BookingFormModal";
import { FaSearch, FaChair, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";

export default function BookingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState("all");

  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const areas = [
    { value: "all", label: "Tất cả khu vực" },
    { value: "indoor", label: "Phòng lạnh" },
    { value: "outside", label: "Ngoài trời" },
    { value: "vip", label: "Phòng VIP" },
  ];

  useEffect(() => {
    loadTables();
  }, [selectedArea]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    loadTables(); // Refresh lại trạng thái bàn sau khi đặt xong
  };

  const loadTables = async () => {
    try {
      setLoading(true);
      const params = selectedArea !== "all" ? { khu_vuc: selectedArea } : {};
      // Gọi API
      const res = await tables.list(params);
      // Xử lý data trả về (tùy format API của bạn)
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setData(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Màu sắc trạng thái (Dark mode supported)
  const getStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "occupied": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "reserved": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "maintenance": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available": return "Còn trống";
      case "occupied": return "Đang dùng";
      case "reserved": return "Đã đặt";
      case "maintenance": return "Bảo trì";
      default: return status;
    }
  };

  const handleBookTable = (table) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng đăng nhập",
        text: "Bạn cần đăng nhập để thực hiện đặt bàn.",
        confirmButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#EA580C", // Orange-600
      }).then((result) => {
        if (result.isConfirmed) window.location.href = "/login";
      });
      return;
    }
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 min-h-screen">
      
      {/* 1. Header Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
          Đặt bàn trực tuyến
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4 text-gray-800 dark:text-white">
          Chọn vị trí yêu thích
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-400 to-red-600 mx-auto rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          Không gian thoáng đãng, ấm cúng. Hãy chọn cho mình một vị trí đẹp nhất để thưởng thức cà phê.
        </p>
      </div>

      {/* 2. Filter Section (Pill Style) */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {areas.map((area) => (
          <button
            key={area.value}
            onClick={() => setSelectedArea(area.value)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
              ${selectedArea === area.value
                ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/30 scale-105"
                : "bg-white dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-white/5 hover:border-orange-200"
              }
            `}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* 3. Table Grid */}
      {loading ? (
        // Skeleton Loading
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((table) => (
            <div
              key={table.id_ban}
              className="group bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Ảnh bàn */}
              <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={table.hinh_anh || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"}
                  alt={table.ten_ban}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getStatusColor(table.trang_thai)}`}>
                    {getStatusText(table.trang_thai)}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                   <h3 className="text-xl font-bold text-white">{table.ten_ban || `Bàn số ${table.so_ban}`}</h3>
                </div>
              </div>

              {/* Thông tin */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <FaChair className="text-orange-500" />
                    <span>{table.suc_chua} chỗ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-orange-500" />
                    <span className="capitalize">
                      {areas.find(a => a.value === table.khu_vuc)?.label || table.khu_vuc}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 line-clamp-2 flex-1">
                  {table.mo_ta || "Vị trí đẹp, không gian thoáng đãng, thích hợp cho nhóm bạn hoặc gia đình."}
                </p>

                {/* Nút đặt bàn */}
                <button
                  disabled={table.trang_thai !== "available"}
                  onClick={() => handleBookTable(table)}
                  className={`
                    w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-md
                    ${table.trang_thai === "available"
                      ? "bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-600/40"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none"
                    }
                  `}
                >
                  {table.trang_thai === "available" ? "Đặt bàn ngay" : "Tạm thời không khả dụng"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Modal Form */}
      <BookingFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={selectedTable}
      />
    </div>
  );
}