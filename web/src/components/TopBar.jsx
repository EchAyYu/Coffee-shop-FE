// web/src/components/TopBar.jsx
import { Link, useLocation } from "react-router-dom";
import { FaSun, FaMoon, FaShoppingCart, FaSignOutAlt, FaUser } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../context/ThemeContext"; // Import hook theme

export default function TopBar({ user, onCartOpen, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Hàm kiểm tra link đang active để highlight
  const isActive = (path) => location.pathname === path;

  // Component Link nội bộ cho gọn code
  const NavButton = ({ to, children, icon }) => (
    <Link
      to={to}
      className={`
        px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2
        ${isActive(to) 
          ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" 
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-orange-400"
        }
      `}
    >
      {icon}
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-[#121212]/80 dark:border-gray-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        
        {/* 1. Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wide text-gray-800 dark:text-white leading-none">LO COFFEE</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 tracking-wider">PREMIUM TASTE</span>
          </div>
        </Link>

        {/* 2. Navigation Buttons (Desktop) */}
        <nav className="hidden md:flex items-center bg-gray-100/50 dark:bg-white/5 p-1 rounded-full border border-transparent dark:border-white/10">
          <NavButton to="/">Trang chủ</NavButton>
          <NavButton to="/menu">Menu</NavButton>
          <NavButton to="/booking">Đặt bàn</NavButton>
          <NavButton to="/about">Về chúng tôi</NavButton>
          
          {/* Link đặc biệt cho User */}
          {user && (
            <Link
              to="/redeem"
              className="ml-2 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-100 rounded-full border border-orange-200 hover:bg-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400 transition-colors"
            >
              🎁 Đổi thưởng
            </Link>
          )}
        </nav>

        {/* 3. Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Nút đổi giao diện Sáng/Tối */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full grid place-items-center text-gray-600 hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-white/10 transition-all"
            title="Đổi giao diện"
          >
            {theme === 'dark' ? <FaSun className="text-xl animate-spin-slow" /> : <FaMoon className="text-xl" />}
          </button>

          {/* Nút Giỏ hàng */}
          <button
            onClick={onCartOpen}
            className="w-10 h-10 rounded-full grid place-items-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 relative transition-all"
          >
            <FaShoppingCart className="text-lg" />
            {/* (Nếu muốn hiển thị số lượng thì thêm badge ở đây) */}
          </button>

          {/* Phần User */}
          <div className="h-6 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1"></div>

          {!user ? (
            <Link
              to="/login"
              className="px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 shadow-lg shadow-gray-900/20 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all"
            >
              Đăng nhập
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationBell />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none">
                    {user.ten_dn || user.ho_ten || "User"}
                  </p>
                  <Link to="/customer" className="text-xs text-orange-600 hover:underline dark:text-orange-400">
                    Thông tin cá nhân
                  </Link>
                </div>
                
                <button
                  onClick={onLogout}
                  className="w-10 h-10 rounded-full bg-red-50 text-red-500 grid place-items-center hover:bg-red-500 hover:text-white shadow-sm dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all"
                  title="Đăng xuất"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}