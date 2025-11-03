import { useEffect, useState } from "react";
// 💡 BƯỚC 1: Sửa import để khớp với adminApi.js
import { getProducts, getOrdersAdmin, customers, reservations } from "../../api/adminApi";
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState({
    customers: [],
    orders: [],
    products: [],
    reservations: [],
    ordersPagination: null, 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    async function load() {
      setError(null); 
      setLoading(true);
      try {
        const [productsRes, ordersRes, customersRes, reservationsRes] = await Promise.all([
          getProducts().catch(err => { console.error("Error loading products:", err); return { data: { data: [] }}; }), 
          // 💡 BƯỚC 2: Gọi hàm getOrdersAdmin (đã đúng)
          getOrdersAdmin().catch(err => { console.error("Error loading orders:", err); setError("Không thể tải đơn hàng."); return { data: { data: [] }}; }),
          // 💡 BƯỚC 3: Gọi customers.getAll() (đã đúng)
          customers.getAll().catch(err => { console.error("Error loading customers:", err); setError("Không thể tải khách hàng."); return { data: { data: [] }}; }),
          // 💡 BƯỚC 4: Gọi reservations.list() (đã đúng)
          reservations.list().catch(err => { console.error("Error loading reservations:", err); setError("Không thể tải đặt bàn."); return { data: { data: [] }}; }),
        ]);

        const adminOrders = ordersRes.data?.data || [];
        const paginationInfo = ordersRes.data?.pagination || null;

        setData({
          products: productsRes.data?.data || productsRes.data || [],
          orders: adminOrders,
          ordersPagination: paginationInfo, 
          customers: Array.isArray(customersRes.data?.data)
                     ? customersRes.data.data
                     : Array.isArray(customersRes.data)
                     ? customersRes.data 
                     : [], 
          reservations: reservationsRes.data?.data || reservationsRes.data || [],
        });
      } catch (err) {
        console.error("⚠️ Lỗi tải dữ liệu admin:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu trang quản trị.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3"> <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div> <span className="text-gray-600 font-medium">Đang tải dữ liệu...</span> </div>
      </div>
    );
  }

   if (error) {
     return <div className="p-4 text-red-600 bg-red-50 rounded border border-red-200">{error}</div>;
   }

  const stats = [
    { title: "Tổng sản phẩm", value: data.products.length, icon: "🛒", color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200" },
    { title: "Đơn hàng", value: data.ordersPagination?.totalItems ?? data.orders.length, icon: "📦", color: "green", bgColor: "bg-green-50", textColor: "text-green-700", borderColor: "border-green-200" },
    { title: "Khách hàng", value: data.customers.length, icon: "👥", color: "purple", bgColor: "bg-purple-50", textColor: "text-purple-700", borderColor: "border-purple-200" },
    { title: "Số bàn đặt", value: data.reservations.length, icon: "📅", color: "pink", bgColor: "bg-pink-50", textColor: "text-pink-700", borderColor: "border-pink-200" },
  ];

  const formatOrderStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'pending': return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' };
      case 'pending_payment': return { text: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-700' };
      case 'confirmed': return { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' };
      case 'completed': return { text: 'Hoàn thành', color: 'bg-green-100 text-green-700' };
      case 'cancelled': return { text: 'Đã hủy', color: 'bg-red-100 text-red-700' };
      default: return { text: status || 'Không rõ', color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          📊 Bảng điều khiển quản trị
        </h1>
        <p className="text-gray-600">Tổng quan về hệ thống LO COFFEE</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className="text-4xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sản phẩm */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
           <div className="flex items-center gap-3 mb-6"> <div className="h-10 w-10 rounded-xl bg-blue-100 grid place-items-center"> <span className="text-xl">🛒</span> </div> <h2 className="text-xl font-bold text-gray-900">Sản phẩm gần đây</h2> </div> {data.products.length === 0 ? ( <div className="text-center py-8 text-gray-500"> <div className="text-4xl mb-2">📦</div> <p>Chưa có sản phẩm nào</p> </div> ) : ( <div className="space-y-3 max-h-64 overflow-y-auto pr-2"> {data.products.slice(0, 5).map((product) => ( <div key={product.id_mon || product._id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"> <div className="flex items-center gap-3 min-w-0"> {product.anh && ( <img src={product.anh} alt={product.ten_mon} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" /> )} <div className="flex-1 min-w-0"> <p className="font-medium text-gray-900 text-sm truncate">{product.ten_mon}</p> <p className="text-xs text-gray-600">{product.gia?.toLocaleString('vi-VN')} ₫</p> </div> </div> <Link to={`/admin/products?edit=${product.id_mon || product._id}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"> Xem </Link> </div> ))} {data.products.length > 5 && ( <p className="text-center text-xs text-gray-500 py-2"> Và {data.products.length - 5} sản phẩm khác... </p> )} </div> )}
        </div>

        {/* Đơn hàng */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
           <div className="flex items-center gap-3 mb-6"> <div className="h-10 w-10 rounded-xl bg-green-100 grid place-items-center"> <span className="text-xl">📦</span> </div> <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2> </div> {data.orders.length === 0 ? ( <div className="text-center py-8 text-gray-500"> <div className="text-4xl mb-2">📋</div> <p>Chưa có đơn hàng nào</p> </div> ) : ( <div className="space-y-3 max-h-64 overflow-y-auto pr-2"> {data.orders.slice(0, 5).map((order) => { const statusStyle = formatOrderStatus(order.trang_thai); return ( <Link to={`/admin/orders?view=${order.id_don}`} key={order.id_don} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"> <div className="min-w-0"> <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">#{order.id_don} - {order.ho_ten_nhan || "Khách hàng"}</p> <p className="text-xs text-gray-500 mt-0.5"> {order.ngay_dat ? new Date(order.ngay_dat).toLocaleString('vi-VN') : "Chưa có ngày"} </p> </div> <div className="text-right flex-shrink-0"> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}> {statusStyle.text} </span> <p className="text-xs font-semibold text-gray-800 mt-1"> {order.tong_tien?.toLocaleString('vi-VN')} ₫ </p> </div> </Link> );})} {data.ordersPagination && data.ordersPagination.totalItems > 5 && ( <p className="text-center text-xs text-gray-500 py-2"> Và {data.ordersPagination.totalItems - 5} đơn hàng khác... </p> )} </div> )}
        </div>
      </div>

       {/* Khách hàng & Đặt bàn (Layout tương tự) */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Khách hàng */}
           <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
               <div className="flex items-center gap-3 mb-6"> <div className="h-10 w-10 rounded-xl bg-purple-100 grid place-items-center"> <span className="text-xl">👥</span> </div> <h2 className="text-xl font-bold text-gray-900">Khách hàng mới</h2> </div> {data.customers.length === 0 ? ( <div className="text-center py-8 text-gray-500"> <div className="text-4xl mb-2">👤</div> <p>Chưa có khách hàng nào</p> </div> ) : ( <div className="space-y-3 max-h-64 overflow-y-auto pr-2"> {data.customers.slice(0, 5).map((customer) => ( <div key={customer.id_kh || customer.id_tk} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"> <div className="flex items-center gap-3 min-w-0"> <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center text-white font-semibold text-sm flex-shrink-0"> {(customer.ho_ten || customer.ten_dn || "A").charAt(0).toUpperCase()} </div> <div className="flex-1 min-w-0"> <p className="font-medium text-gray-900 text-sm truncate">{customer.ho_ten || customer.ten_dn || "Khách hàng"}</p> <p className="text-xs text-gray-500 truncate">{customer.email || "Không có email"}</p> </div> </div> <span className="text-xs text-gray-400">ID: {customer.id_kh || customer.id_tk}</span> </div> ))} {data.customers.length > 5 && ( <p className="text-center text-xs text-gray-500 py-2"> Và {data.customers.length - 5} khách hàng khác... </p> )} </div> )}
           </div>
            {/* Đặt bàn */}
           <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6"> <div className="h-10 w-10 rounded-xl bg-pink-100 grid place-items-center"> <span className="text-xl">📅</span> </div> <h2 className="text-xl font-bold text-gray-900">Đặt bàn gần đây</h2> </div> {data.reservations.length === 0 ? ( <div className="text-center py-8 text-gray-500"> <div className="text-4xl mb-2">📅</div> <p>Chưa có bàn nào được đặt</p> </div> ) : ( <div className="space-y-3 max-h-64 overflow-y-auto pr-2"> {data.reservations.slice(0, 5).map((reservation) => ( <Link to={`/admin/reservations?view=${reservation.id_datban}`} key={reservation.id_datban} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"> <div className="min-w-0"> <p className="font-medium text-gray-900 text-sm group-hover:text-pink-600 transition-colors">{reservation.ho_ten || "Khách hàng"}</p> <p className="text-xs text-gray-500 mt-0.5">{reservation.sdt || "Không có sdt"}</p> </div> <div className="text-right flex-shrink-0"> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ reservation.trang_thai === 'CONFIRMED' ? 'bg-green-100 text-green-700' : reservation.trang_thai === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700' }`}> {reservation.trang_thai || 'PENDING'} </span> <p className="text-xs text-gray-500 mt-1">{reservation.ngay_dat ? new Date(reservation.ngay_dat).toLocaleDateString('vi-VN') : ''}</p> </div> </Link> ))} {data.reservations.length > 5 && ( <p className="text-center text-xs text-gray-500 py-2"> Và {data.reservations.length - 5} lượt đặt bàn khác... </p> )} </div> )}
           </div>
       </div>
    </div>
  );
}

