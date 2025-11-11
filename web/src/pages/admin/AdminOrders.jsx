// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from "react";
import { getOrdersAdmin, updateOrderStatus, getOrderDetailAdmin } from "../../api/adminApi"; // 💡 THÊM getOrderDetailAdmin
import Swal from "sweetalert2";
import OrderDetailModal from "../../components/OrderDetailModal";

// --- Helper Functions (Copy từ AdminOrders.jsx) ---
const STATUS_MAP = {
  pending: { label: "Đang xử lý", colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { label: "Đã xác nhận", colorClass: "bg-blue-100 text-blue-800 border-blue-200" },
  paid: { label: "Đã thanh toán", colorClass: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  shipped: { label: "Đang giao", colorClass: "bg-purple-100 text-purple-800 border-purple-200" },
  done: { label: "Hoàn thành", colorClass: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Đã hủy", colorClass: "bg-red-100 text-red-800 border-red-200" },
};

// Lấy LỚP MÀU SẮC dựa trên key trạng thái
const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.colorClass || "bg-gray-100 text-gray-800 border-gray-200";
};

// Lấy NHÃN TIẾNG VIỆT dựa trên key trạng thái
const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.label || "Không rõ";
};

// Định dạng tiền tệ VNĐ
const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0 ₫";
  return numAmount.toLocaleString('vi-VN') + ' ₫';
};

// --- Component Thẻ Thống Kê (Stat Card) ---
function StatCard({ title, value, icon, colorClass = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold ${colorClass}`}>
        {value}
      </div>
    </div>
  );
}

// --- Component Chính: AdminOrders ---
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 💡💡💡 THÊM STATE MỚI CHO MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 'selectedOrder' sẽ lưu chi tiết đơn hàng (từ API)
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await getOrdersAdmin();
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("❌ Fetch orders failed:", err.response?.data || err.message);
        Swal.fire("Lỗi", "Không thể tải danh sách đơn hàng.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // --- Logic Tính Toán Thống Kê ---
  const completedOrders = orders.filter(o => o.trang_thai?.toLowerCase() === 'done');
  const pendingOrders = orders.filter(o => o.trang_thai?.toLowerCase() === 'pending');
  const cancelledOrders = orders.filter(o => o.trang_thai?.toLowerCase() === 'cancelled');

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (parseFloat(order.tong_tien) || 0),
    0
  );

  // --- Logic Lọc Đơn Hàng ---
  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(order => order.trang_thai?.toLowerCase() === filter);

  // --- Logic Cập Nhật Trạng Thái ---
  const handleStatusChange = async (orderId, newStatusKey) => {
    const newStatusApiValue = newStatusKey.toUpperCase();
    
    try {
      await updateOrderStatus(orderId, newStatusApiValue);
      setOrders((prev) =>
        prev.map((o) =>
          o.id_don === orderId ? { ...o, trang_thai: newStatusKey } : o
        )
      );
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: `Đã cập nhật trạng thái thành "${getStatusLabel(newStatusKey)}".`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật trạng thái.';
      console.error("Update failed:", errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMessage,
      });
    }
  };

  // 💡💡💡 THÊM HÀM MỚI: MỞ VÀ TẢI CHI TIẾT ĐƠN HÀNG
  const handleViewDetails = async (orderId) => {
    setIsModalOpen(true); // Mở Modal (hiển thị trạng thái loading)
    setIsModalLoading(true); // Báo hiệu đang tải
    
    try {
      const res = await getOrderDetailAdmin(orderId); // Gọi API chi tiết
      setSelectedOrder(res.data?.data || null); // Lưu data vào state
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      Swal.fire("Lỗi", "Không thể tải chi tiết đơn hàng.", "error");
      setIsModalOpen(false); // Đóng modal nếu lỗi
    } finally {
      setIsModalLoading(false); // Tải xong
    }
  };

  // 💡💡💡 THÊM HÀM MỚI: ĐÓNG MODAL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null); // Xóa data cũ khi đóng
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium text-lg">Đang tải dữ liệu đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      
      {/* 1. Header (Tiêu đề) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đơn hàng trong hệ thống.</p>
        </div>
      </div>

      {/* 2. Bảng Thống Kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Tổng doanh thu (Hoàn thành)" 
          value={formatCurrency(totalRevenue)}
          icon="💰"
          colorClass="text-green-600"
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={orders.length} 
          icon="📋"
          colorClass="text-blue-600"
        />
        <StatCard 
          title="Đơn đang xử lý" 
          value={pendingOrders.length} 
          icon="⏳"
          colorClass="text-yellow-600"
        />
        <StatCard 
          title="Đơn đã hủy" 
          value={cancelledOrders.length} 
          icon="❌"
          colorClass="text-red-600"
        />
      </div>

      {/* 3. Thanh Lọc & Bảng Dữ Liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Thanh Lọc */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Tất cả", count: orders.length },
                { value: "pending", label: "Đang xử lý", count: pendingOrders.length },
                { value: "done", label: "Hoàn thành", count: completedOrders.length },
                { value: "cancelled", label: "Đã hủy", count: cancelledOrders.length },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bảng Dữ Liệu */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all" ? "Chưa có đơn hàng nào" : "Không có đơn hàng với trạng thái này"}
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "Các đơn hàng sẽ xuất hiện ở đây khi khách hàng đặt hàng."
                : "Thử chọn trạng thái khác để xem đơn hàng."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID Đơn hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id_don} className="hover:bg-gray-50 transition-colors duration-150">
                    
                    {/* ID Đơn hàng */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-blue-600">
                        #{order.id_don}
                      </div>
                    </td>
                    
                    {/* Khách hàng */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.ho_ten_nhan || "Khách vãng lai"}</div>
                      <div className="text-xs text-gray-600">{order.dia_chi_nhan}</div>
                    </td>
                    
                    {/* Ngày đặt */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleDateString("vi-VN") : "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleTimeString("vi-VN") : ""}
                      </div>
                    </td>

                    {/* Sản phẩm */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {order.OrderDetails?.length ? (
                          <div className="space-y-1">
                            {order.OrderDetails.slice(0, 2).map((detail, index) => (
                              <div key={index} className="text-sm text-gray-700 truncate" title={detail.Product?.ten_mon}>
                                {detail.Product?.ten_mon || "Không rõ"}
                                <span className="text-gray-500"> (x{detail.so_luong})</span>
                              </div>
                            ))}
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
                    
                    {/* Tổng tiền */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.tong_tien)}
                      </span>
                    </td>
                    
                    {/* Trạng thái */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(order.trang_thai)}`}>
                        {getStatusLabel(order.trang_thai)}
                      </span>
                    </td>
                    
                    {/* 💡 SỬA CỘT THAO TÁC CUỐI CÙNG */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* 1. Nút Xem chi tiết MỚI */}
                        <button
                          onClick={() => handleViewDetails(order.id_don)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Xem chi tiết
                        </button>
                        
                        {/* 2. Dropdown cập nhật (Giữ nguyên) */}
                        <select
                          value={order.trang_thai?.toLowerCase() || "pending"}
                          onChange={(e) => handleStatusChange(order.id_don, e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={order.trang_thai?.toLowerCase() === 'done' || order.trang_thai?.toLowerCase() === 'cancelled'}
                        >
                          {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
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

      {/* 💡💡💡 THÊM MODAL VÀO ĐÂY (Ở CUỐI CÙNG) */}
      <OrderDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        // Nếu đang loading thì 'selectedOrder' là null (modal sẽ tự hiển thị loading)
        // nếu đã tải xong thì 'selectedOrder' là data (modal sẽ hiển thị nội dung)
        order={isModalLoading ? null : selectedOrder}
      />

    </div>
  );
}