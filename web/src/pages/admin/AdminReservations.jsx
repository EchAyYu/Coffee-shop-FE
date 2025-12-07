// src/pages/admin/AdminReservations.jsx
// Nâng cấp V3: thống kê tuần/tháng + export + phân quyền admin/employee

import { useEffect, useState } from "react";
import { reservations } from "../../api/adminApi";
import Swal from "sweetalert2";
import ReservationDetailModal from "../../components/ReservationDetailModal";

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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Stats week/month
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Lấy role
  const rawUser = localStorage.getItem("admin_user");
  let role = null;
  try {
    role = JSON.parse(rawUser)?.role || null;
  } catch {
    role = null;
  }

  useEffect(() => {
    loadReservations();
  }, []);

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
          await reservations.update(id, { status: apiStatus });
          Swal.fire("Thành công!", "Đã cập nhật trạng thái.", "success");

          setData((currentData) =>
            currentData.map((item) =>
              item.id_datban === id
                ? { ...item, trang_thai: apiStatus }
                : item
            )
          );
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
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

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
              {data.map((item) => {
                const isFinalState =
                  ["CONFIRMED", "CANCELLED", "DONE"].includes(
                    item.trang_thai?.toUpperCase()
                  );
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Xem chi tiết
                        </button>

                        {!isFinalState && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id_datban, "CONFIRMED")
                              }
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id_datban, "CANCELLED")
                              }
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

      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={isModalLoading ? null : selectedReservation}
      />
    </div>
  );
}
