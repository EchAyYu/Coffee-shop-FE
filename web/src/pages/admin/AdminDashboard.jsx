import { useEffect, useState } from "react";
import { getProducts, getOrders, customers } from "../../api/api";

export default function AdminDashboard() {
  const [data, setData] = useState({
    customers: [],
    orders: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, ordersRes, customersRes] = await Promise.all([
          getProducts(),
          getOrders().catch(() => ({ data: [] })), // nếu /orders chưa có
          customers.getMyInfo().catch(() => ({ data: [] })), // nếu /customers/all chưa có
        ]);

        setData({
          products: productsRes.data?.data || productsRes.data || [],
          orders: ordersRes.data?.data || ordersRes.data || [],
          customers: Array.isArray(customersRes.data)
            ? customersRes.data
            : [customersRes.data],
        });
      } catch (err) {
        console.error("⚠️ Lỗi tải dữ liệu admin:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: data.products.length,
      icon: "🛒",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    {
      title: "Đơn hàng",
      value: data.orders.length,
      icon: "📦",
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    {
      title: "Khách hàng",
      value: data.customers.length,
      icon: "👥",
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      title: "Doanh thu",
      value: data.orders.reduce((sum, order) => sum + (order.tong_tien || 0), 0).toLocaleString('vi-VN') + ' ₫',
      icon: "💰",
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📊 Bảng điều khiển quản trị
        </h1>
        <p className="text-gray-600">Tổng quan về hệ thống Coffee Shop</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sản phẩm */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-100 grid place-items-center">
              <span className="text-xl">🛒</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sản phẩm</h2>
          </div>
          
          {data.products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <p>Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.products.slice(0, 5).map((product) => (
                <div key={product.id_mon} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {product.anh && (
                      <img src={product.anh} alt={product.ten_mon} className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{product.ten_mon}</p>
                      <p className="text-sm text-gray-600">{product.gia?.toLocaleString('vi-VN')} ₫</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    ID: {product.id_mon}
                  </span>
                </div>
              ))}
              {data.products.length > 5 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  Và {data.products.length - 5} sản phẩm khác...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Đơn hàng */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-100 grid place-items-center">
              <span className="text-xl">📦</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
          </div>
          
          {data.orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {data.orders.slice(0, 5).map((order) => (
                <div key={order.id_don} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id_don}</p>
                    <p className="text-sm text-gray-600">{order.ho_ten_nhan || "Khách hàng"}</p>
                    <p className="text-xs text-gray-500">
                      {order.ngay_dat ? new Date(order.ngay_dat).toLocaleDateString('vi-VN') : "Chưa có ngày"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.trang_thai === 'completed' ? 'bg-green-100 text-green-700' :
                      order.trang_thai === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.trang_thai || "Đang xử lý"}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {order.tong_tien?.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              ))}
              {data.orders.length > 5 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  Và {data.orders.length - 5} đơn hàng khác...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Khách hàng */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-purple-100 grid place-items-center">
            <span className="text-xl">👥</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Khách hàng</h2>
        </div>
        
        {data.customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👤</div>
            <p>Chưa có khách hàng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.customers.map((customer) => (
              <div key={customer.id_kh || customer.id_tk} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center text-white font-semibold">
                    {(customer.ho_ten || customer.ten_dn || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{customer.ho_ten || customer.ten_dn || "Khách hàng"}</p>
                    <p className="text-sm text-gray-600">{customer.email || "Không có email"}</p>
                    <p className="text-xs text-gray-500">ID: {customer.id_kh || customer.id_tk}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}