// src/pages/admin/AdminDashboard.jsx
// PHIÊN BẢN NÂNG CẤP V3 (Thêm biểu đồ Khách hàng mới)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/adminApi"; 
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { FaUserFriends, FaClipboardList, FaBoxOpen, FaStar } from "react-icons/fa";

// Đăng ký Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend
);

// Helper định dạng tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

// Helper định dạng ngày
const getLast7DaysLabels = () => {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }));
  }
  return labels;
};

// ===============================
// 🔹 MAIN COMPONENT
// ===============================
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      setError(null);
      setLoading(true);
      try {
        const res = await getAdminStats();
        setStats(res.data.data);
      } catch (err) {
        console.error("⚠️ Lỗi tải dữ liệu admin:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu trang quản trị.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // --- Xử lý dữ liệu biểu đồ ---
  
  // 1. Biểu đồ Doanh thu
  const revenueChartData = {
    labels: getLast7DaysLabels(),
    datasets: [
      {
        label: "Doanh thu",
        data: getLast7DaysLabels().map(label => {
          const apiDate = stats?.revenueOverTime.find(d => 
            new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) === label
          );
          return apiDate ? apiDate.revenue : 0;
        }),
        borderColor: "#16A34A", // Green-600
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };
  
  // 2. Biểu đồ Khách hàng mới
  const customerChartData = {
    labels: getLast7DaysLabels(),
    datasets: [
      {
        label: "Khách hàng mới",
        data: getLast7DaysLabels().map(label => {
          const apiDate = stats?.newCustomersOverTime.find(d => 
            new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) === label
          );
          return apiDate ? apiDate.count : 0;
        }),
        borderColor: "#3B82F6", // Blue-600
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // 3. Biểu đồ Trạng thái Đơn hàng
  const orderStatusChartData = {
    labels: stats?.orderStatusDistribution.map(s => s.trang_thai) || [],
    datasets: [
      {
        data: stats?.orderStatusDistribution.map(s => s.count) || [],
        backgroundColor: [
          "#FBBF24", // yellow (pending)
          "#3B82F6", // blue (confirmed)
          "#16A34A", // green (completed/done)
          "#EF4444", // red (cancelled)
          "#F97316", // orange (pending_payment)
          "#A855F7", // purple
        ],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };
  
  // Helper định dạng trạng thái
  const formatOrderStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' };
      case 'pending_payment': return { text: 'Chờ TT', color: 'bg-orange-100 text-orange-700' };
      case 'confirmed': return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' };
      case 'completed': case 'done': case 'paid': case 'shipped':
        return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
      case 'cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default: return { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-700' };
    }
  };

  // Loading & Error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-600 bg-red-50 rounded border border-red-200">{error}</div>;
  }
  if (!stats) return null; 
  
  // KPI Cards (Thêm "Khách hàng mới hôm nay")
  const kpiCards = [
    { title: "Doanh Thu Hôm Nay", value: formatCurrency(stats.kpiCards.todayRevenue), icon: "💵", color: "text-green-700" },
    { title: "Đơn Hàng Hôm Nay", value: stats.kpiCards.todayOrders, icon: "📦", color: "text-blue-700" },
    { title: "Khách Mới Hôm Nay", value: stats.kpiCards.todayCustomers, icon: "🌱", color: "text-indigo-700" },
    { title: "Đặt Bàn Chờ", value: stats.kpiCards.pendingReservations, icon: "📅", color: "text-orange-700" },
  ];

  // ===============================
  // 🔹 BẮT ĐẦU RENDER JSX
  // ===============================
  return (
    <div className="space-y-8 p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        📊 Bảng điều khiển
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Biểu đồ Doanh thu & Khách hàng mới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Biểu đồ Doanh thu */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Doanh thu 7 ngày qua</h2>
          

[Image of a line chart showing revenue trends over the last 7 days]

          <div style={{ height: '300px' }}>
            <Line options={{ responsive: true, maintainAspectRatio: false }} data={revenueChartData} />
          </div>
        </div>
        {/* Biểu đồ Khách hàng mới */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Khách hàng mới 7 ngày qua</h2>
          
          <div style={{ height: '300px' }}>
            <Line options={{ responsive: true, maintainAspectRatio: false }} data={customerChartData} />
          </div>
        </div>
      </div>


      {/* Layout 3 cột (Top Sản phẩm, Top Khách hàng, Trạng thái Đơn hàng) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT 1: SẢN PHẨM BÁN CHẠY (ĐÃ SỬA) */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaBoxOpen className="text-orange-500" /> Top Sản phẩm bán chạy
          </h2>
          {stats.topSellingProducts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-4">
              {stats.topSellingProducts.map((product) => (
                <div key={product.id_mon} className="flex items-center gap-4">
                  <img 
                    src={product.Product?.anh || "https://placehold.co/100x100/F9F5EC/A1887F?text=O"} 
                    alt={product.Product?.ten_mon}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate" title={product.Product?.ten_mon}>
                      {product.Product?.ten_mon || "Sản phẩm không tên"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Đã bán: <span className="font-bold text-green-600">{product.total_sold}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT 2: TOP KHÁCH HÀNG (MỚI) */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Top Khách hàng
          </h2>
          {stats.topCustomers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-4">
              {stats.topCustomers.map((customer) => (
                <div key={customer.id_kh} className="flex items-center gap-4">
                  <img 
                    src={customer.Customer?.anh || `https://ui-avatars.com/api/?name=${customer.Customer?.ho_ten}&background=random`} 
                    alt={customer.Customer?.ho_ten}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate" title={customer.Customer?.ho_ten}>
                      {customer.Customer?.ho_ten || "Khách hàng"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Chi tiêu: <span className="font-bold text-green-600">{formatCurrency(customer.total_spent)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT 3: TRẠNG THÁI ĐƠN HÀNG */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <FaClipboardList className="text-blue-500" /> Trạng thái Đơn hàng
           </h2>
           
           <div className="max-w-xs mx-auto">
              <Doughnut 
                data={orderStatusChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: true,
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
           </div>
        </div>
      </div>
      
      {/* Layout 2 cột (Hoạt động gần đây) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📦 Đơn hàng gần đây</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stats.recentOrders.map((order) => {
                const statusStyle = formatOrderStatus(order.trang_thai);
                return (
                  <Link to={`/admin/orders?view=${order.id_don}`} key={order.id_don} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        #{order.id_don} - {order.ho_ten_nhan || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleString('vi-VN') : "Chưa có ngày"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                        {statusStyle.text}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {formatCurrency(order.tong_tien)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        {/* ĐẶT BÀN CHỜ XỬ LÝ */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Đặt bàn chờ xử lý</h2>
          {stats.recentReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaUserFriends className="mx-auto text-4xl text-gray-400 mb-2" />
              Không có đặt bàn nào đang chờ.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stats.recentReservations.map((reservation) => (
                <Link to={`/admin/reservations`} key={reservation.id_datban} className="flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl transition-colors group">
                  <div className="min-w-0">
                    <p className="font-medium text-yellow-900 text-sm group-hover:text-yellow-700 transition-colors">
                      {reservation.ho_ten} ({reservation.so_nguoi} người)
                    </p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      {new Date(reservation.ngay_dat).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-medium text-yellow-800">
                      {reservation.sdt}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}