import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
// 💡 SỬA: Sử dụng useAdminAuth thay vì useAuth (vì đăng nhập bằng AdminLogin)
import { useAdminAuth } from "../admin/AdminProtectedRoute";

// Tái sử dụng component Admin
import AdminOrders from "../admin/AdminOrders";
import AdminReservations from "../admin/AdminReservations";
import { FaClipboardList, FaCalendarAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";

// --- Component Sidebar ---
function EmployeeSidebar() {
  const { logout, user } = useAdminAuth(); // Lấy user và logout từ Admin Context
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname.startsWith(`/employee${path}`);
    return isActive
      ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium";
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen shadow-sm">
      {/* Logo / Header Sidebar */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
          E
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">Workspace</h2>
          <p className="text-xs text-gray-500 font-medium">Nhân viên LO COFFEE</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Quản lý
        </div>
        <Link
          to="orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getLinkClass("/orders")}`}
        >
          <FaClipboardList className="text-lg" />
          <span>Đơn hàng</span>
        </Link>
        <Link
          to="reservations"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getLinkClass("/reservations")}`}
        >
          <FaCalendarAlt className="text-lg" />
          <span>Đặt bàn</span>
        </Link>
      </nav>

      {/* User Info / Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <FaUserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.ten_nv || user?.ten_dn || "Nhân viên"}</p>
            <p className="text-xs text-gray-500 truncate">Đang hoạt động</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
        >
          <FaSignOutAlt />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

// --- Component Layout chính ---
export default function EmployeeApp() {
  const { user } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header đơn giản cho khu vực nội dung */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            Xin chào, {user?.ten_nv || "Đồng nghiệp"}! 👋
          </h1>
          <div className="text-sm text-gray-500">
             {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
             <Routes>
              <Route path="/" element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="*" element={<Navigate to="orders" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}