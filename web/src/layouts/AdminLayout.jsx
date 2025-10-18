// ===============================
// 🧱 AdminLayout.jsx - Modern & Bright Design
// Giao diện layout tổng cho trang admin
// ===============================
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/api";
import { useEffect, useState } from "react";

export default function AdminLayout() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Nếu không phải admin => chặn
  useEffect(() => {
    if (!user) return; // đang tải hoặc chưa login
    if (user.role?.toLowerCase() !== "admin") {
      alert("Bạn không có quyền truy cập khu vực quản trị!");
      nav("/");
    }
  }, [user]);

  async function handleLogout() {
    await logout();
    setUser(null);
    nav("/login");
  }

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊", color: "blue" },
    { path: "/admin/products", label: "Sản phẩm", icon: "🛒", color: "green" },
    { path: "/admin/orders", label: "Đơn hàng", icon: "📦", color: "orange" },
    { path: "/admin/customers", label: "Khách hàng", icon: "👥", color: "purple" },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
      green: "hover:bg-green-50 hover:text-green-700 hover:border-green-200",
      orange: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
      purple: "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200",
    };
    return colors[color] || colors.blue;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 grid place-items-center text-white font-bold text-xl shadow-lg">
              👑
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Coffee Shop</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 grid place-items-center text-white font-semibold">
              {user?.ho_ten?.charAt(0) || "A"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.ho_ten || "Admin"}</p>
              <p className="text-sm text-gray-600">Quản trị viên</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : `text-gray-700 border border-transparent ${getColorClasses(item.color)}`
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200 font-medium"
          >
            <span className="text-lg">🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Chào mừng trở lại, <span className="font-semibold text-gray-900">{user?.ho_ten || "Admin"}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 grid place-items-center text-white text-sm font-semibold">
                {user?.ho_ten?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}