import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <nav className="flex justify-center gap-8 p-4 bg-[#b71c1c] text-white text-lg">
      <Link to="/">Trang chủ</Link>
      <Link to="/menu">Menu</Link>
      <Link to="/about">Về chúng tôi</Link>
      <Link to="/career">Tuyển dụng</Link>
      <Link to="/booking">Đặt bàn</Link>
      <Link to="/customer">Khách hàng</Link>
    </nav>
  );
}
