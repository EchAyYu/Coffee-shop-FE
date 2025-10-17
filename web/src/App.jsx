// ===============================
// ☕ Coffee Shop - App.jsx (Updated)
// ===============================
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { me } from "./api/api";
import "./index.css";

// ---- Context ----
import { AuthProvider, useAuth } from "./context/AuthContext";

// ---- Pages (Public) ----
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import CareerPage from "./pages/CareerPage";
import BookingPage from "./pages/BookingPage";
import CustomerInfoPage from "./pages/CustomerInfoPage";
import Login from "./pages/Login"; // Trang đăng nhập chung (user/admin)

// ---- Admin ----
import AdminIndex from "./pages/admin"; // index.jsx đã tạo ở bước trước

// ===============================
// 🔹 Top Navigation
// ===============================
function TopBar({ user, onAuthOpen, onCartOpen }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-red-700 grid place-items-center text-white font-bold">
            H
          </div>
          <span className="text-xl font-semibold tracking-wide">
            Highlands Style
          </span>
        </Link>

        {/* Menu */}
        <nav className="flex gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-red-700">Trang chủ</Link>
          <Link to="/menu" className="hover:text-red-700">Menu</Link>
          <Link to="/booking" className="hover:text-red-700">Đặt bàn</Link>
          <Link to="/career" className="hover:text-red-700">Tuyển dụng</Link>
          <Link to="/about" className="hover:text-red-700">Về chúng tôi</Link>
          <Link to="/customer" className="hover:text-red-700">Khách hàng</Link>

          {/* Hiện link Admin nếu role=admin */}
          {user?.role === "admin" && (
            <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800">
              Quản trị
            </Link>
          )}
        </nav>

        {/* Tài khoản & giỏ hàng */}
        <div className="flex gap-2 items-center">
          {!user ? (
            <Link
              to="/login"
              className="px-3 py-2 border rounded-xl hover:bg-neutral-50"
            >
              Đăng nhập
            </Link>
          ) : (
            <span className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg">
              Xin chào, {user.ho_ten || "User"}
            </span>
          )}
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
// 🔸 Wrapper chính của ứng dụng
// ===============================
function MainApp() {
  const [cartOpen, setCartOpen] = useState(false);
  const { user, setUser } = useAuth();

  // Tự load user nếu có token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      me()
        .then((res) => setUser(res.data?.data))
        .catch(() => localStorage.removeItem("access_token"));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf3]">
      <TopBar user={user} onCartOpen={() => setCartOpen(true)} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/customer" element={<CustomerInfoPage user={user} />} />
          <Route path="/login" element={<Login />} />

          {/* Admin route */}
          <Route path="/admin/*" element={<AdminIndex />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t mt-12">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500 text-center">
          © {new Date().getFullYear()} Highlands Style — Graduation Project.
        </div>
      </footer>
    </div>
  );
}

// ===============================
// 🔹 Gói App với AuthProvider
// ===============================
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
