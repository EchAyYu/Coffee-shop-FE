// ================================
// ☕ Coffee Shop FE - Navbar (final)
// ================================
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-h)] bg-maroon shadow z-50">
      <div className="container-lg h-full flex items-center justify-between">
        <Link to="/" className="text-cream font-bold tracking-wide text-lg">
          Highlands-style
        </Link>

        <nav className="flex gap-6 items-center">
          <NavLink to="/menu" className="nav-link">
            Menu
          </NavLink>
          <NavLink to="/reservation" className="nav-link">
            Reservation
          </NavLink>
          <NavLink to="/cart" className="nav-link">
            Cart
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className="nav-link">
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Đăng ký
              </NavLink>
            </>
          ) : (
            <>
              <span className="text-cream">Xin chào, {user.ten_dn}</span>
              {user.role === "admin" ? (
                <NavLink to="/admin/dashboard" className="nav-link">
                  Quản trị
                </NavLink>
              ) : (
                <NavLink to="/account" className="nav-link">
                  Tài khoản
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 bg-cream text-maroon rounded font-semibold hover:opacity-80"
              >
                Đăng xuất
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
