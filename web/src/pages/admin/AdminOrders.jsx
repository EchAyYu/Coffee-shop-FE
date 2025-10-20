// src/pages/admin/AdminOrders.jsx - Modern & Bright Design
import { useEffect, useState } from "react";
import { getOrdersAdmin, updateOrderStatus } from "../../api/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await getOrdersAdmin();
        console.log("✅ API /admin/orders result:", res.data);
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("❌ Fetch orders failed:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'hoàn thành':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'đang xử lý':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'đã hủy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.trang_thai?.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Quản lý đơn hàng</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Tổng cộng:</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
            {orders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
          <div className="flex gap-2">
            {[
              { value: "all", label: "Tất cả", count: orders.length },
              { value: "pending", label: "Đang xử lý", count: orders.filter(o => o.trang_thai?.toLowerCase() === 'pending' || o.trang_thai?.toLowerCase() === 'đang xử lý').length },
              { value: "completed", label: "Hoàn thành", count: orders.filter(o => o.trang_thai?.toLowerCase() === 'completed' || o.trang_thai?.toLowerCase() === 'hoàn thành').length },
              { value: "cancelled", label: "Đã hủy", count: orders.filter(o => o.trang_thai?.toLowerCase() === 'cancelled' || o.trang_thai?.toLowerCase() === 'đã hủy').length },
            ].map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID Đơn hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id_don} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          #{order.id_don}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.ho_ten_nhan || "Khách hàng"}</p>
                        {order.dia_chi_nhan && (
                          <p className="text-sm text-gray-600">{order.dia_chi_nhan}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleDateString("vi-VN") : "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleTimeString("vi-VN") : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.trang_thai)}`}>
                        {order.trang_thai || "Đang xử lý"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {order.tong_tien?.toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {order.OrderDetails?.length ? (
                          <div className="space-y-1">
                            {order.OrderDetails.slice(0, 2).map((detail, index) => (
                              <div key={index} className="text-sm text-gray-700">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          onClick={() => alert(`Chi tiết đơn #${order.id_don}`)}
                        >
                          Xem chi tiết
                        </button>
                        <select
                          value={order.trang_thai || "PENDING"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await updateOrderStatus(order.id_don, newStatus);
                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id_don === order.id_don ? { ...o, trang_thai: newStatus } : o
                                )
                              );
                              alert(`✅ Đã cập nhật trạng thái: ${newStatus}`);
                            } catch (err) {
                              console.error("Update failed:", err);
                              alert("❌ Lỗi cập nhật trạng thái");
                            }
                          }}
                          className="border rounded-lg px-2 py-1 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
                        >
                          <option value="PENDING">Đang xử lý</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="PAID">Đã thanh toán</option>
                          <option value="SHIPPED">Đang giao</option>
                          <option value="DONE">Hoàn thành</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {orders.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-sm text-gray-600">Tổng đơn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.trang_thai?.toLowerCase() === 'completed' || o.trang_thai?.toLowerCase() === 'hoàn thành').length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.trang_thai?.toLowerCase() === 'pending' || o.trang_thai?.toLowerCase() === 'đang xử lý').length}
              </div>
              <div className="text-sm text-gray-600">Đang xử lý</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {orders.reduce((sum, order) => sum + (order.tong_tien || 0), 0).toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-sm text-gray-600">Tổng doanh thu</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}