// src/routes/App.jsx

import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Swal from "sweetalert2"; // 💡 THÊM IMPORT NÀY

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
// 💡 THÊM 'socket' (instance) VÀO IMPORT
import { socket, connectSocket, disconnectSocket } from "./socket.js";

// ===============================
// 1. 🔹 Top Navigation (Giữ nguyên)
// ===============================
function TopBar({ user, onCartOpen, onLogout }) {
  // ... (Code của bạn giữ nguyên, không thay đổi)
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

  // 💡💡💡 CẬP NHẬT LOGIC SOCKET TẠI ĐÂY 💡💡💡
  useEffect(() => {
    // A. KHI NGƯỜI DÙNG ĐĂNG NHẬP
    if (user && user.id_tk) {
      connectSocket(user.id_tk);

      socket.on('connect', () => {
        // 💡💡💡 DÒNG NÀY ĐÃ ĐƯỢC THÊM LẠI 💡💡💡
        // Gửi 'id_tk' của bạn lên server để join "phòng"
        socket.emit("join", user.id_tk);
        
        // Log này của bạn đã chính xác, nhưng giờ nó sẽ là sự thật
        console.log(`✅ Socket connected! ID: ${socket.id}. Emitted join room: ${user.id_tk}`);
      });

      // Lắng nghe thông báo (Giữ nguyên)
      socket.on('new_notification', (notification) => {
        console.log('🔔 Thông báo mới:', notification);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: notification.title, 
          text: notification.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
      });

      // Lắng nghe lỗi (Giữ nguyên)
      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

    // B. KHI NGƯỜI DÙNG ĐĂNG XUẤT
    } else {
      disconnectSocket(); 
    }

    // C. HÀM DỌN DẸP (Giữ nguyên)
    return () => {
      socket.off('connect');
      socket.off('new_notification');
      socket.off('connect_error');
      disconnectSocket();
    };
  }, [user]); 
  // 💡💡💡 KẾT THÚC CẬP NHẬT 💡💡💡

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#fdfaf3]">
        <TopBar user={user} onCartOpen={() => setCartOpen(true)} onLogout={logout} />
        <CartModal open={cartOpen} onClose={() => setCartOpen(false)} user={user} />
        
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
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
      
      <Routes>
        {/* Tuyến 1: ADMIN */}
        <Route path="/admin/*" element={<AdminIndex />} />

        {/* Tuyến 2: PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/career" element={<CareerPage />} />
         <Route path="/booking" element={<BookingPage />} />
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