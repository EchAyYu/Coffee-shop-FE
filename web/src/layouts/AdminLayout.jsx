  import { Link, Outlet } from "react-router-dom";
  import { useAdminAuth } from "../pages/admin/AdminProtectedRoute"; // Import hook

  export default function AdminLayout() {
    // Lấy hàm logout từ context riêng của Admin
    const { logout } = useAdminAuth();

    const navItems = [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Sản phẩm", path: "/admin/products" },
      { name: "Đơn hàng", path: "/admin/orders" },
      { name: "Đánh giá", path: "/admin/reviews" },
      { name: "Đặt bàn", path: "/admin/reservations" },
      { name: "Bàn", path: "/admin/tables" },
      { name: "Khách hàng", path: "/admin/customers" },
    ];

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-6 text-2xl font-bold border-b border-gray-700">
            👑 Admin
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <Link
              to="/"
              target="_blank"
              className="block text-center text-sm mb-4 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Xem trang chủ ↗
            </Link>
            <button
              onClick={logout}
              className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
            >
              Đăng xuất Admin
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            <Outlet /> {/* Đây là nơi các trang con (Dashboard, Products...)_hiện ra */}
          </main>
        </div>
      </div>
    );
  }
