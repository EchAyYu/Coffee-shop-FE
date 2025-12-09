import { useEffect, useState, useCallback } from "react"; 
import { reservations } from "../../api/adminApi"; // ✅ Đã sửa lỗi: CHỈ IMPORT reservations
import Swal from "sweetalert2";
import ReservationDetailModal from "../../components/ReservationDetailModal";

// =========================================================
// 💡 CÁC HÀM XÁC ĐỊNH KHOẢNG NGÀY (GIẢ ĐỊNH TẠM THỜI)
// =========================================================
const getTodayDate = () => new Date().toISOString().slice(0, 10);
const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
  // Điều chỉnh về thứ Hai
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  // Đặt lại giờ về 0h để đảm bảo dải ngày chính xác
  startOfWeek.setHours(0, 0, 0, 0); 
  return startOfWeek.toISOString().slice(0, 10);
};
// =========================================================

const STATUS_MAP = {
  pending: {
    label: "Đang chờ",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Đã hủy",
    colorClass: "bg-red-100 text-red-800 border-red-200",
  },
  done: {
    label: "Hoàn thành",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || "pending";
  return STATUS_MAP[key]?.label || "Không rõ";
};

const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || "pending";
  return (
    STATUS_MAP[key]?.colorClass ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

function StatCard({ title, value, icon, colorClass = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${colorClass}`}>
        {value}
      </div>
    </div>
  );
}

export default function AdminReservations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho bộ lọc trạng thái
  const [filter, setFilter] = useState("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Stats week/month
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 💡 State cho lọc theo ngày (MỚI)
  // Mặc định là tuần hiện tại
  const [startDate, setStartDate] = useState(getStartOfWeek());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [dateRangeError, setDateRangeError] = useState(null);

  // Lấy role
  const rawUser = localStorage.getItem("admin_user");
  let role = null;
  try {
    role = JSON.parse(rawUser)?.role || null;
  } catch {
    role = null;
  }

  // 💡 HÀM TẢI DỮ LIỆU ĐẶT BÀN (CẬP NHẬT)
  const loadReservations = useCallback(async () => {
    // 💡 Kiểm tra ngày trước khi tải
    if (new Date(startDate) > new Date(endDate)) {
      setDateRangeError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      setData([]);
      setLoading(false);
      return;
    }
    setDateRangeError(null);

    try {
      setLoading(true);
      setError(null);
      // ✅ TRUYỀN THAM SỐ NGÀY VÀO API
      const res = await reservations.list({ startDate, endDate }); 
      setData(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message);
      Swal.fire("Lỗi", "Không thể tải danh sách đặt bàn.", "error");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]); // CHẠY LẠI KHI NGÀY THAY ĐỔI

  // 💡 useEffect gọi loadReservations khi ngày thay đổi
  useEffect(() => {
    loadReservations();
  }, [loadReservations]); // Chạy lại khi loadReservations thay đổi (tức là khi ngày thay đổi)

  // Chỉ admin gọi stats
  useEffect(() => {
    if (role !== "admin") {
      setStats(null);
      setStatsLoading(false);
      return;
    }

    async function fetchStats() {
      setStatsLoading(true);
      try {
        // ✅ SỬ DỤNG ĐÚNG reservations.stats (Đã sửa lỗi Uncaught SyntaxError)
        const res = await reservations.stats({ period }); 
        setStats(res.data?.data || null);
      } catch (err) {
        console.error("Lỗi khi tải thống kê đặt bàn:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [period, role]);

  const handleUpdateStatus = async (id, newStatusKey) => {
    // newStatusKey là giá trị lowercase (pending, confirmed, cancelled, done)
    const apiStatus = newStatusKey.toUpperCase(); // API backend có thể yêu cầu uppercase
    const newStatusLabel = getStatusLabel(newStatusKey);

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
          // reservations.update có thể cần phải được export thêm trong adminApi
          await reservations.update(id, { status: apiStatus }); // Đã đổi trang_thai thành status để thống nhất với backend
          Swal.fire("Thành công!", "Đã cập nhật trạng thái.", "success");

          // Cập nhật state local
          setData((currentData) =>
            currentData.map((item) =>
              item.id_datban === id
                ? { ...item, trang_thai: apiStatus }
                : item
            )
          );
        } catch (error) {
          const msg =
            error.response?.data?.message || "Không thể cập nhật trạng thái.";
          Swal.fire("Lỗi!", msg, "error");
        }
      }
    });
  };

  const handleViewDetails = async (id) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await reservations.getById(id);
      setSelectedReservation(res.data?.data || null);
    } catch (err) {
      Swal.fire("Lỗi", "Không thể tải chi tiết đặt bàn.", "error");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  // Export Excel
  const handleExport = async () => {
    // ... (Bạn có thể cần cập nhật API export để hỗ trợ startDate/endDate) ...
    try {
      const res = await reservations.export({ period });
      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const label = period === "week" ? "week" : "month";
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute(
        "download",
        `reservations_${label}_${today}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export reservations failed:", err);
      Swal.fire("Lỗi", "Không thể xuất file Excel đặt bàn.", "error");
    }
  };

  // LỌC DỮ LIỆU BẰNG STATE TRẠNG THÁI
  const confirmedReservations = data.filter((r) =>
    r.trang_thai?.toLowerCase() === "confirmed"
  );
  const pendingReservations = data.filter(
    (r) => r.trang_thai?.toLowerCase() === "pending"
  );
  const cancelledReservations = data.filter(
    (r) => r.trang_thai?.toLowerCase() === "cancelled"
  );
  const doneReservations = data.filter(
    (r) => r.trang_thai?.toLowerCase() === "done"
  );

  const filteredData =
    filter === "all"
      ? data
      : data.filter((item) => item.trang_thai?.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 font-medium text-lg">
            Đang tải dữ liệu...
          </span>
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

  const totalReservations = stats?.totalReservations || 0;
  const successPercent = stats?.successPercent || 0;
  const cancelledPercent = stats?.cancelledPercent || 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header + chọn kỳ + Export (chỉ admin) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📅 Quản lý Đặt bàn
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi các yêu cầu đặt bàn và cập nhật trạng thái.
          </p>
        </div>
        {role === "admin" && (
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="inline-flex rounded-full bg-gray-100 p-1 text-sm">
              <button
                onClick={() => setPeriod("week")}
                className={`px-4 py-1 rounded-full ${
                  period === "week"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={`px-4 py-1 rounded-full ${
                  period === "month"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Tháng này
              </button>
            </div>

            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm"
            >
              ⬇ Xuất Excel ({period === "week" ? "Tuần" : "Tháng"})
            </button>
          </div>
        )}
      </div>

      {/* Thống kê (chỉ admin) */}
      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Tổng lượt đặt trong kỳ"
            value={statsLoading ? "…" : totalReservations}
            icon="📌"
          />
          <StatCard
            title="Đặt thành công (số + %)"
            value={
              statsLoading
                ? "…"
                : `${stats?.successfulReservations || 0} (${successPercent}%)`
            }
            icon="✅"
            colorClass="text-emerald-600"
          />
          <StatCard
            title="Đặt bị hủy (số + %)"
            value={
              statsLoading
                ? "…"
                : `${stats?.cancelledReservations || 0} (${cancelledPercent}%)`
            }
            icon="❌"
            colorClass="text-red-600"
          />
        </div>
      )}

      {/* 💡 Bộ lọc theo ngày (MỚI) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🗓 Lọc theo Khoảng Ngày Đặt
        </h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              Từ ngày:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              Đến ngày:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {dateRangeError && (
          <p className="text-sm text-red-500 mt-2">{dateRangeError}</p>
        )}
      </div>

      {/* Bộ lọc trạng thái & Bảng dữ liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Bộ lọc trạng thái */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Lọc theo trạng thái:
            </span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Tất cả", count: data.length },
                {
                  value: "pending",
                  label: "Đang chờ",
                  count: pendingReservations.length,
                },
                {
                  value: "confirmed",
                  label: "Đã xác nhận",
                  count: confirmedReservations.length,
                },
                {
                  value: "done",
                  label: "Hoàn thành",
                  count: doneReservations.length,
                },
                {
                  value: "cancelled",
                  label: "Đã hủy",
                  count: cancelledReservations.length,
                },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bảng */}
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all"
                ? "Chưa có yêu cầu đặt bàn nào trong khoảng thời gian này"
                : "Không có đặt bàn với trạng thái này trong khoảng thời gian này"}
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "Các yêu cầu sẽ xuất hiện ở đây."
                : "Thử chọn trạng thái hoặc khoảng ngày khác để xem yêu cầu đặt bàn."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số người
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bàn
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item) => {
                  // DONE và CANCELLED là trạng thái cuối cùng
                  const isFinalState = ["DONE", "CANCELLED"].includes(
                    item.trang_thai?.toUpperCase()
                  );
                  // Lấy key trạng thái lowercase để hiển thị trong select
                  const currentStatusKey =
                    item.trang_thai?.toLowerCase() || "pending";

                  return (
                    <tr
                      key={item.id_datban}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.ho_ten}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.sdt}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(item.ngay_dat).toLocaleDateString("vi-VN")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.gio_dat || ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.so_nguoi} người
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.Table ? (
                            item.Table.ten_ban || item.Table.so_ban
                          ) : (
                            <span className="text-gray-400">Chưa gán</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                            item.trang_thai
                          )}`}
                        >
                          {getStatusLabel(item.trang_thai)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(item.id_datban)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            Xem chi tiết
                          </button>

                          {/* 💡 SỬ DỤNG SELECT ĐỂ CẬP NHẬT TRẠNG THÁI */}
                          <select
                            value={currentStatusKey}
                            onChange={(e) =>
                              handleUpdateStatus(
                                item.id_datban,
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isFinalState}
                          >
                            {Object.entries(STATUS_MAP).map(
                              ([key, { label }]) => (
                                <option key={key} value={key}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                          {/* 💡 KẾT THÚC SELECT */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={isModalLoading ? null : selectedReservation}
      />
    </div>
  );
}