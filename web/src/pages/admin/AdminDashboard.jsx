// src/pages/admin/AdminDashboard.jsx
// PHIÊN BẢN V4 (FIX LỖI LAYOUT KPI + TINH CHỈNH GIAO DIỆN)

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
const translateStatus = (status) => {
  const statusMap = {
    pending: "Chờ xử lý",
    pending_payment: "Chờ thanh toán",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    done: "Hoàn thành",
    paid: "Đã thanh toán",
    shipped: "Đang giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status?.toLowerCase()] || status; // Trả về tên gốc nếu không khớp
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
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        backgroundColor: '#FFF',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#DDD',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        grid: {
          color: '#EEE',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };
  
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
        pointBackgroundColor: '#16A34A',
      },
    ],
  };
  
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
        pointBackgroundColor: '#3B82F6',
      },
    ],
  };

  const orderStatusChartData = {
   labels: stats?.orderStatusDistribution.map(s => translateStatus(s.trang_thai)) || [],
    datasets: [
      {
        data: stats?.orderStatusDistribution.map(s => s.count) || [],
        backgroundColor: [
          "#FBBF24", "#3B82F6", "#16A34A", "#EF4444", "#F97316", "#A855F7",
        ],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };
  
  const formatOrderStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
      case 'pending_payment': return { text: 'Chờ TT', color: 'bg-orange-100 text-orange-800 border border-orange-200' };
      case 'confirmed': return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border border-blue-200' };
      case 'completed': case 'done': case 'paid': case 'shipped':
        return { text: 'Hoàn thành', color: 'bg-green-100 text-green-800 border border-green-200' };
      case 'cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-800 border border-red-200' };
      default: return { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-800 border border-gray-200' };
    }
  };

  if (loading) {
    return (
      // 💡 TINH CHỈNH: Loading toàn trang thay vì chỉ 1 góc
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }
  if (error) {
    // 💡 TINH CHỈNH: Căn giữa lỗi
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="p-6 text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }
  if (!stats) return null; 
  
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
    // 💡 TINH CHỈNH: Bỏ p-6/p-8, để layout tự căn (đã làm ở turn trước)
    <div className="space-y-6"> 
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">
        📊 Bảng điều khiển
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat) => (
          <div
            key={stat.title}
            // 💡 TINH CHỈNH: Giao diện thẻ nhất quán
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              {/* 💡 SỬA LỖI: Thêm min-w-0 để text không bị tràn */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                {/* 💡 SỬA LỖI: Giảm font từ 3xl -> 2xl, thêm truncate */}
                <p className={`text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
              </div>
              {/* 💡 TINH CHỈNH: Đổi icon sang cỡ nhỏ hơn, có nền */}
              <div className="text-2xl opacity-100 p-3 rounded-full bg-gray-100">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Biểu đồ Doanh thu & Khách hàng mới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 7 ngày qua</h2>
          

[Image of a line chart showing revenue trends over the last 7 days]

          <div style={{ height: '300px' }}>
            <Line options={chartOptions} data={revenueChartData} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng mới 7 ngày qua</h2>
          
          <div style={{ height: '300px' }}>
            <Line options={chartOptions} data={customerChartData} />
          </div>
        </div>
      </div>

      {/* Layout 3 cột (Top Sản phẩm, Top Khách hàng, Trạng thái Đơn hàng) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT 1: SẢN PHẨM BÁN CHẠY */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
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
                    <p className="font-semibold text-gray-800 text-sm truncate" title={product.Product?.ten_mon}>
                      {product.Product?.ten_mon || "Sản phẩm không tên"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đã bán: <span className="font-bold text-green-600">{product.total_sold}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT 2: TOP KHÁCH HÀNG */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaStar className="text-yellow-400" /> Top Khách hàng
          </h2>
          {stats.topCustomers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-4">
              {stats.topCustomers.map((customer) => (
                <div key={customer.id_kh} className="flex items-center gap-4">
                  <img 
                    src={customer.Customer?.anh || `https://ui-avatars.com/api/?name=${customer.Customer?.ho_ten}&background=random&color=fff`} 
                    alt={customer.Customer?.ho_ten}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate" title={customer.Customer?.ho_ten}>
                      {customer.Customer?.ho_ten || "Khách hàng"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Chi tiêu: <span className="font-bold text-green-600">{formatCurrency(customer.total_spent)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT 3: TRẠNG THÁI ĐƠN HÀNG */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
             <FaClipboardList className="text-blue-500" /> Trạng thái Đơn hàng
           </h2>
           
           <div className="max-w-xs mx-auto">
              <Doughnut data={orderStatusChartData} options={doughnutOptions} />
           </div>
        </div>
      </div>
      
      {/* Layout 2 cột (Hoạt động gần đây) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">📦 Đơn hàng gần đây</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stats.recentOrders.map((order) => {
                const statusStyle = formatOrderStatus(order.trang_thai);
                return (
                  <Link to={`/admin/orders?view=${order.id_don}`} key={order.id_don} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                        #{order.id_don} - {order.ho_ten_nhan || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.ngay_dat ? new Date(order.ngay_dat).toLocaleString('vi-VN') : "Chưa có ngày"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${statusStyle.color}`}>
                        {statusStyle.text}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">📅 Đặt bàn chờ xử lý</h2>
          {stats.recentReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaUserFriends className="mx-auto text-4xl text-gray-400 mb-3" />
              Không có đặt bàn nào đang chờ.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stats.recentReservations.map((reservation) => (
                <Link to={`/admin/reservations`} key={reservation.id_datban} className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors group">
                  <div className="min-w-0">
                    <p className="font-semibold text-yellow-900 text-sm group-hover:text-yellow-700 transition-colors">
                      {reservation.ho_ten} ({reservation.so_nguoi} người)
                    </p>
                    <p className="text-xs text-yellow-800 mt-1">
                      {new Date(reservation.ngay_dat).toLocaleString('vi-VN', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-medium text-yellow-900">
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