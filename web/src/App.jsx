// web/src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import ChatbotTestPage from "./pages/ChatbotTestPage";
<Route path="/chatbot-test" element={<ChatbotTestPage />} />
// ---- Context ----
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./components/CartContext";
import { ThemeProvider } from "./context/ThemeContext"; 
import CartModal from "./components/CartModal";
import ChatbotWidget from "./components/ChatbotWidget";

// ---- Components ----
import TopBar from "./components/TopBar";
import { socket, connectSocket, disconnectSocket } from "./socket.js";

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


// ---- Admin & Employee ----
import AdminIndex from "./pages/admin";
import EmployeeApp from "./pages/employee/EmployeeApp";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute"; 

// ===============================
// Layout Public (Đã sửa: Xóa thông báo trùng)
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
    } else {
      disconnectSocket(); 
    }
    return () => {
      socket.off('connect');
      disconnectSocket();
    };
  }, [user]); 

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#fdfaf3] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        <TopBar user={user} onCartOpen={() => setCartOpen(true)} onLogout={logout} />
        <CartModal open={cartOpen} onClose={() => setCartOpen(false)} user={user} />

        {/* 🔽🔽 Chatbot xuất hiện ở mọi trang khách 🔽🔽 */}
        <ChatbotWidget />
        {/* 🔼🔼 */}

        <main className="flex-1 w-full">
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
      <ThemeProvider> 
        {/* limit={1} giúp chỉ hiện 1 toast tại 1 thời điểm, tránh spam */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" limit={1} />
        
        <Routes>
          
          {/* 1. Route Admin */}
          <Route path="/admin/*" element={<AdminIndex />} />

          {/* 2. Route Employee (Được bảo vệ) */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/employee/*" element={<EmployeeApp />} />
          </Route>

          {/* 3. Route Public (Khách hàng) */}
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