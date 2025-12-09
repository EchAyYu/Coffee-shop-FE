// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from "react";
import {
  getOrdersAdmin,
  updateOrderStatus,
  getOrderDetailAdmin,
  getAdminOrderStats,
  exportAdminOrders,
} from "../../api/adminApi";
import Swal from "sweetalert2";
import OrderDetailModal from "../../components/OrderDetailModal";

const STATUS_MAP = {
  pending: {
    label: "Đang xử lý",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  // 💡 THÊM TRẠNG THÁI MỚI
  pending_payment: {
    label: "Chờ thanh toán",
    colorClass: "bg-orange-100 text-orange-800 border-orange-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  paid: {
    label: "Đã thanh toán",
    colorClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  shipped: {
    label: "Đang giao",
    colorClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  done: {
    label: "Hoàn thành (ĐH)", // Đơn hàng tại cửa hàng (Done)
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  completed: {
    label: "Hoàn thành (Online)", // Đơn hàng giao đi (Completed)
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Đã hủy",
    colorClass: "bg-red-100 text-red-800 border-red-200",
  },
};

const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || "pending";
  return (
    STATUS_MAP[key]?.colorClass ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || "pending";
  return STATUS_MAP[key]?.label || "Không rõ";
};

const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0 ₫";
  return numAmount.toLocaleString("vi-VN") + " ₫";
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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Stats week / month
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Lấy role từ localStorage
  const rawUser = localStorage.getItem("admin_user");
  let role = null;
  try {
    role = JSON.parse(rawUser)?.role || null;
  } catch {
    role = null;
  }

  useEffect(() => {
    async function fetchOrders() {
      // Bắt đầu tải mỗi khi ngày lọc thay đổi
      setLoading(true);
      try {
        const params = {};
        if (selectedDate) {
          // Chỉ thêm tham số 'date' nếu đã chọn ngày
          params.date = selectedDate;
        }

        const res = await getOrdersAdmin(params);
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("❌ Fetch orders failed:", err);
        Swal.fire("Lỗi", "Không thể tải danh sách đơn hàng.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [selectedDate]); // 💡 selectedDate là dependency để tải lại khi lọc theo ngày

  // Chỉ admin mới fetch thống kê
  useEffect(() => {
    if (role !== "admin") {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const res = await getAdminOrderStats({ period });
        setStats(res.data?.data || null);
      } catch (err) {
        console.error("❌ Fetch order stats failed:", err);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, [period, role]);

  // 💡 Cập nhật logic lọc theo trạng thái để tách biệt 'pending' và 'pending_payment'
  const completedOrders = orders.filter((o) =>
    ["done", "completed"].includes(o.trang_thai?.toLowerCase())
  );
  const processingOrders = orders.filter(
    (o) => o.trang_thai?.toLowerCase() === "pending"
  );
  const pendingPaymentOrders = orders.filter(
    (o) => o.trang_thai?.toLowerCase() === "pending_payment"
  );
  const cancelledOrders = orders.filter(
    (o) => o.trang_thai?.toLowerCase() === "cancelled"
  );

  // Doanh thu trong kỳ (week / month)
  // 💡 LẤY TỪ STATS API: Dựa trên backend, trường doanh thu là 'revenue'
  const periodRevenue = stats?.revenue || 0;

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) => order.trang_thai?.toLowerCase() === filter
        );

  // Update trạng thái
  const handleStatusChange = async (orderId, newStatusKey) => {
    const newApiValue = newStatusKey.toLowerCase(); // backend dùng lowercase

    try {
      await updateOrderStatus(orderId, newApiValue);
      setOrders((prev) =>
        prev.map((o) =>
          o.id_don === orderId ? { ...o, trang_thai: newStatusKey } : o
        )
      );
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: `Đã cập nhật trạng thái thành "${getStatusLabel(
          newStatusKey
        )}".`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể cập nhật trạng thái.";
      console.error("Update failed:", msg);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: msg,
      });
    }
  };

  // Modal chi tiết đơn hàng
  const handleViewDetails = async (orderId) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await getOrderDetailAdmin(orderId);
      setSelectedOrder(res.data?.data || null);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      Swal.fire("Lỗi", "Không thể tải chi tiết đơn hàng.", "error");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Export CSV
  const handleExport = async () => {
    try {
      const res = await exportAdminOrders({ period });
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
        `orders_${label}_${today}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export orders failed:", err);
      Swal.fire("Lỗi", "Không thể xuất file Excel đơn hàng.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 font-medium text-lg">
            Đang tải dữ liệu đơn hàng...
          </span>
        </div>
      </div>
    );
  }

  const totalOrdersPeriod = stats?.totalOrders || 0;
  const completedPercent = stats?.completedPercent || 0;
  const cancelledPercent = stats?.cancelledPercent || 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header + chọn kỳ + Export (chỉ admin) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📦 Quản lý đơn hàng
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi đơn hàng và cập nhật trạng thái.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Đơn trong kỳ"
            value={statsLoading ? "…" : totalOrdersPeriod}
            icon="🧾"
            colorClass="text-gray-900"
          />
          <StatCard
            title="Hoàn thành (số + %)"
            value={
              statsLoading
                ? "…"
                : `${stats?.completedOrders || 0} (${completedPercent}%)`
            }
            icon="✅"
            colorClass="text-emerald-600"
          />
          <StatCard
            title="Đã hủy (số + %)"
            value={
              statsLoading
                ? "…"
                : `${stats?.cancelledOrders || 0} (${cancelledPercent}%)`
            }
            icon="❌"
            colorClass="text-red-600"
          />
          <StatCard
            title="Doanh thu trong kỳ (Hoàn thành)"
            value={statsLoading ? "…" : formatCurrency(periodRevenue)}
            icon="💰"
            colorClass="text-orange-600"
          />
        </div>
      )}

      {/* Bộ lọc & bảng */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
            {/* 💡 BỘ LỌC NGÀY 💡 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Lọc theo ngày:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate("")}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Xóa lọc
                </button>
              )}
            </div>
            {/* 💡 KẾT THÚC BỘ LỌC NGÀY 💡 */}

            {/* BỘ LỌC TRẠNG THÁI HIỆN CÓ */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                Lọc theo trạng thái:
              </span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "Tất cả", count: orders.length },
                  {
                    value: "pending",
                    label: "Đang xử lý",
                    count: processingOrders.length, // Cập nhật count
                  },
                  {
                    value: "pending_payment", // Thêm trạng thái mới
                    label: "Chờ thanh toán",
                    count: pendingPaymentOrders.length, // Cập nhật count
                  },
                  {
                    value: "done",
                    label: "Hoàn thành",
                    count: completedOrders.length,
                  },
                  {
                    value: "cancelled",
                    label: "Đã hủy",
                    count: cancelledOrders.length,
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
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all"
                ? "Chưa có đơn hàng nào"
                : "Không có đơn hàng với trạng thái này"}
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "Các đơn hàng sẽ xuất hiện ở đây khi khách hàng đặt hàng."
                : "Thử chọn trạng thái khác để xem đơn hàng."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID Đơn hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id_don}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-blue-600">
                        #{order.id_don}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.ho_ten_nhan || "Khách vãng lai"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.dia_chi_nhan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.ngay_dat
                          ? new Date(order.ngay_dat).toLocaleDateString(
                              "vi-VN"
                            )
                          : "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.ngay_dat
                          ? new Date(order.ngay_dat).toLocaleTimeString(
                              "vi-VN"
                            )
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {order.OrderDetails?.length ? (
                          <div className="space-y-1">
                            {order.OrderDetails.slice(0, 2).map(
                              (detail, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-gray-700 truncate"
                                  title={detail.Product?.ten_mon}
                                >
                                  {detail.Product?.ten_mon || "Không rõ"}
                                  <span className="text-gray-500">
                                    {" "}
                                    (x{detail.so_luong})
                                  </span>
                                </div>
                              )
                            )}
                            {order.OrderDetails.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{order.OrderDetails.length - 2} sản phẩm khác
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.tong_tien)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                          order.trang_thai
                        )}`}
                      >
                        {getStatusLabel(order.trang_thai)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order.id_don)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Xem chi tiết
                        </button>
                        <select
                          value={
                            order.trang_thai?.toLowerCase() || "pending"
                          }
                          onChange={(e) =>
                            handleStatusChange(order.id_don, e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={["done", "completed", "cancelled"].includes(
                            order.trang_thai?.toLowerCase()
                          )}
                        >
                          {Object.entries(STATUS_MAP).map(
                            ([key, { label }]) => (
                              // 💡 Chỉ cho phép chọn trạng thái khả dụng, loại bỏ 'completed' khỏi select
                              // Vì 'done' và 'completed' đều là trạng thái cuối cùng, nên chỉ cần giữ 'done' cho việc cập nhật.
                              // Tuy nhiên, để đơn giản, ta giữ nguyên logic của bạn: hiển thị tất cả status
                              <option key={key} value={key}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={isModalLoading ? null : selectedOrder}
      />
    </div>
  );
}