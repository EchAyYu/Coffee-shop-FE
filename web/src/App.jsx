// web/src/App.jsx
import { Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import Swal from "sweetalert2";

// ---- Context ----
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./components/CartContext";
import { ThemeProvider } from "./context/ThemeContext"; // 👈 MỚI: Import ThemeProvider
import CartModal from "./components/CartModal";

// ---- Components ----
import TopBar from "./components/TopBar"; // 👈 MỚI: Import từ file riêng
import { socket, connectSocket, disconnectSocket } from "./socket.js";

// ---- Pages ----
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
import AdminIndex from "./pages/admin";
import EmployeeApp from "./pages/employee/EmployeeApp";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute"; 

// ===============================
// Layout Public (Đã cập nhật Dark Mode)
// ===============================
function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && user.id_tk) {
      connectSocket(user.id_tk);
      socket.on('connect', () => {
        socket.emit("join", user.id_tk);
      });
      socket.on('new_notification', (notification) => {
        Swal.fire({
          toast: true, position: 'top-end', icon: 'info',
          title: notification.title, text: notification.message,
          showConfirmButton: false, timer: 5000, timerProgressBar: true,
        });
      });
    } else {
      disconnectSocket(); 
    }
    return () => {
      socket.off('connect');
      socket.off('new_notification');
      disconnectSocket();
    };
  }, [user]); 

  return (
    <CartProvider>
      {/* 💡 CẬP NHẬT CLASS TẠI ĐÂY: 
          bg-[#fdfaf3] cho Light Mode 
          dark:bg-neutral-900 cho Dark Mode (màu tối sang trọng)
          text-neutral-900 (chữ đen) -> dark:text-neutral-100 (chữ trắng)
      */}
      <div className="min-h-screen flex flex-col bg-[#fdfaf3] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        <TopBar user={user} onCartOpen={() => setCartOpen(true)} onLogout={logout} />
        <CartModal open={cartOpen} onClose={() => setCartOpen(false)} user={user} />
        
        <main className="flex-1 w-full">
           {/* Xóa max-w-6xl ở đây nếu muốn full màn hình, hoặc giữ nguyên tùy bạn */}
           {/* Tôi thêm class để đảm bảo nội dung con cũng hưởng ứng dark mode */}
           <Outlet />
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 bg-white dark:bg-[#111] transition-colors">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500 dark:text-neutral-400 text-center">
            © {new Date().getFullYear()} LO COFFEE — Graduation Project.
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}

// ===============================
// App Component
// ===============================
export default function App() {
  return (
    <AuthProvider>
      {/* 💡 Bọc ThemeProvider ở ngoài cùng (hoặc trong AuthProvider) */}
      <ThemeProvider> 
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
        
        <Routes>
          {/* Admin & Employee Routes (Giữ nguyên) */}
          <Route path="/admin/*" element={<AdminIndex />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/employee/*" element={<EmployeeApp />} />
          </Route>

          {/* Public Routes */}
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
      </ThemeProvider>
    </AuthProvider>
  );
}