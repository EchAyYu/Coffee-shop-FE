// ===============================
// 🧱 AdminLayout.jsx
// Giao diện layout tổng cho trang admin
// ===============================
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../api/api";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();

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

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#111]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1c1c1c] border-r">
        <div className="p-4 border-b text-xl font-semibold text-center">
          ☕ Coffee Admin
        </div>
        <nav className="flex flex-col p-4 space-y-2 text-sm">
          <Link to="/admin/dashboard" className="hover:text-blue-500">
            📊 Dashboard
          </Link>
          <Link to="/admin/products" className="hover:text-blue-500">
            🛒 Products
          </Link>
          <Link to="/admin/orders" className="hover:text-blue-500">
            📦 Orders
          </Link>
          <Link to="/admin/customers" className="hover:text-blue-500">
            👥 Customers
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
