// src/routes/App.jsx (ĐÃ CẤU TRÚC LẠI)

import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// ---- Context ----
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./components/CartContext";
import CartModal from "./components/CartModal";

// ---- Pages (Public) ----
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import CareerPage from "./pages/CareerPage";
import BookingPage from "./pages/BookingPage";
import CustomerInfoPage from "./pages/CustomerInfoPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutPage from "./pages/CheckoutPage";
import RedeemVoucherPage from "./pages/RedeemVoucherPage"; 

// ---- Admin ----
import AdminIndex from "./pages/admin";

// ---- Components ----
import NotificationBell from "./components/NotificationBell";
import { connectSocket, disconnectSocket } from "./socket.js";

// ===============================
// 1. 🔹 Top Navigation (Giữ nguyên)
// ===============================
function TopBar({ user, onCartOpen, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 grid place-items-center text-white font-bold">
            L
          </div>
          <span className="text-xl font-semibold tracking-wide">LO COFFEE</span>
        </Link>

        {/* Menu */}
        <nav className="flex gap-4 text-sm font-medium items-center"> 
          <Link to="/" className="hover:text-red-700">Trang chủ</Link>
          <Link to="/menu" className="hover:text-red-700">Menu</Link>
          <Link to="/booking" className="hover:text-red-700">Đặt bàn</Link>
          <Link to="/career" className="hover:text-red-700">Tuyển dụng</Link>
          <Link to="/about" className="hover:text-red-700">Về chúng tôi</Link>
          
          {user && (
            <>
              <Link to="/customer" className="hover:text-red-700">Khách hàng</Link>
              <Link 
                to="/redeem" 
                className="text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 rounded-md bg-orange-50 border border-orange-200"
              >
                🎁 Đổi thưởng
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              Quản trị
            </Link>
          )}
        </nav>

        {/* User & Cart */}
        <div className="flex gap-2 items-center">
          {!user ? (
            <Link
              to="/login"
              className="px-3 py-2 border rounded-xl hover:bg-neutral-50"
            >
              Đăng nhập
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                Xin chào, {user.ho_ten || "User"}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-2 border rounded-xl hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                >
                  Đăng xuất
              </button>
            </div>
          )}
          
          {user && <NotificationBell />}

          <button
            onClick={onCartOpen}
            className="px-3 py-2 border rounded-xl hover:bg-neutral-50"
        >
            🛒
        </button>
        </div>
    </div>
  </header>
  );
}

// ===============================
// 2. 🔸 Layout cho trang Public (Khách hàng)
// ===============================
function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();

  // Logic Socket (chỉ cho khách hàng)
  useEffect(() => {
    if (user && user.id_tk) {
      connectSocket(user.id_tk);
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#fdfaf3]">
        <TopBar user={user} onCartOpen={() => setCartOpen(true)} onLogout={logout} />
        <CartModal open={cartOpen} onClose={() => setCartOpen(false)} user={user} />
        
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
          {/* Các trang con của Public sẽ render ở đây */}
          <Outlet />
        </main>

        <footer className="border-t mt-12">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500 text-center">
            © {new Date().getFullYear()} LO COFFEE — Graduation Project.
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}

// ===============================
// 3. 🔹 Gói App với AuthProvider và Routes
// ===============================
export default function App() {
  return (
    <AuthProvider>
      {/* 💡 Đưa ToastContainer ra ngoài để cả Admin và Public đều dùng được */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* 💡 Cấu trúc lại Routes */}
      <Routes>
        {/* Tuyến 1: ADMIN - Không có TopBar/Footer */}
        {/* AdminIndex sẽ tự chứa AdminLayout (sidebar) */}
        <Route path="/admin/*" element={<AdminIndex />} />

        {/* Tuyến 2: PUBLIC - Có TopBar/Footer */}
        {/* CartProvider đã được bọc trong PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/booking" element={<BookingPage />} />
          {/* CustomerInfoPage có thể tự gọi useAuth() nên không cần truyền prop 'user' */}
          <Route path="/customer" element={<CustomerInfoPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/redeem" element={<RedeemVoucherPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}