// ================================
// ☕ Coffee Shop FE - Booking Page
// ================================
import { useEffect, useState } from "react";
import { tables } from "../api/api";

export default function BookingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState("all");

  const areas = [
    { value: "all", label: "Tất cả" },
    { value: "main", label: "Khu vực chính" },
    { value: "vip", label: "VIP" },
    { value: "outdoor", label: "Ngoài trời" },
    { value: "rooftop", label: "Sân thượng" }
  ];

  useEffect(() => {
    loadTables();
  }, [selectedArea]);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const params = selectedArea !== "all" ? { khu_vuc: selectedArea } : {};
      const res = await tables.list(params);
  
      console.log("📦 Dữ liệu trả về từ API:", res.data);
  
      // 🔥 Cập nhật đoạn này:
      const list =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.tables)
          ? res.data.tables
          : [];
  
      setData(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách bàn:", err);
      setError(err.message || "Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };
  
  

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "occupied":
        return "bg-red-100 text-red-700";
      case "reserved":
        return "bg-yellow-100 text-yellow-700";
      case "maintenance":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Còn trống";
      case "occupied":
        return "Đang sử dụng";
      case "reserved":
        return "Đã đặt";
      case "maintenance":
        return "Bảo trì";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-4">
        Đặt bàn tại LO Coffee
      </h2>
      <p className="text-center text-neutral-600 mb-8">
        Chọn bàn phù hợp với nhu cầu của bạn
      </p>

      {/* Filter by area */}
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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-700 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Đang tải danh sách bàn...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">❌ {error}</p>
          <button
            onClick={loadTables}
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Tables grid */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((table) => (
            <div
              key={table.id_ban}
              className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <img
                src={table.hinh_anh || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
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
                    📍 {table.khu_vuc}
                  </span>
                </div>

                {table.gia_dat_ban > 0 && (
                  <p className="text-sm text-amber-600 mb-3">
                    💰 Phí đặt bàn: {table.gia_dat_ban.toLocaleString()}đ
                  </p>
                )}

                <button
                  disabled={table.trang_thai !== "available"}
                  className={`w-full px-4 py-2 rounded-xl font-medium transition-colors ${
                    table.trang_thai === "available"
                      ? "bg-red-700 text-white hover:bg-red-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {table.trang_thai === "available" ? "Đặt bàn" : "Không khả dụng"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 text-lg">
            Không có bàn nào trong khu vực này
          </p>
        </div>
      )}
    </div>
  );
}