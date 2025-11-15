import { Link, Outlet, useLocation } from "react-router-dom"; // 💡 Thêm useLocation
import { useAdminAuth } from "../pages/admin/AdminProtectedRoute"; // Import hook

export default function AdminLayout() {
  // 💡 1. Lấy cả `logout` và `user` từ context
  const { logout, user } = useAdminAuth();
  const location = useLocation();

  // 💡 2. Lấy Tên hiển thị (chào mừng)
  const displayName = user?.ten_dn || "Quản trị viên";
  
  // 💡 3. Lấy tên trang hiện tại
  const getPageTitle = () => {
    const item = navItems.find(item => location.pathname.startsWith(item.path));
    return item ? item.name : "Dashboard";
  };

  // 💡 4. Cấu hình Menu (thêm `roles` để phân quyền)
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", roles: ["admin"] },
    { name: "Sản phẩm", path: "/admin/products", roles: ["admin"] },
    { name: "Đơn hàng", path: "/admin/orders", roles: ["admin", "employee"] },
    { name: "Đặt bàn", path: "/admin/reservations", roles: ["admin", "employee"] },
    { name: "Đánh giá", path: "/admin/reviews", roles: ["admin"] },
    { name: "Bàn", path: "/admin/tables", roles: ["admin"] },
    { name: "Khách hàng", path: "/admin/customers", roles: ["admin"] },
    { name: "Voucher", path: "/admin/vouchers", roles: ["admin"] },
    // 💡 5. THÊM LINK QUẢN LÝ NHÂN VIÊN (CHỈ ADMIN THẤY)
    { name: "Nhân viên", path: "/admin/employees", roles: ["admin"] },
  ];

  // 💡 6. Lọc ra các menu mà user này được phép xem
  const allowedNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          👑 Admin
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* 💡 7. Render các menu đã được lọc */}
          {allowedNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {item.name}
              </Link>
            )
          })}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <Link
              to="/"
              target="_blank"
              className="block text-center text-sm mb-4 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Xem trang chủ ↗
            </Link>
            <button
              onClick={logout}
              className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Đăng xuất ({displayName})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 💡 8. THÊM HEADER CHO NỘI DUNG CHÍNH */}
          <header className="bg-white shadow-sm border-b border-gray-200 z-10">
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            <Outlet /> {/* Đây là nơi các trang con (Dashboard, Products...)_hiện ra */}
          </main>
        </div>
      </div>
    );
  }