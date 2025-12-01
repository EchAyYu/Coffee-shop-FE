import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCoffee,
  FaCalendarAlt,
  FaStar,
  FaShoppingCart,
  FaLeaf,
  FaAward,
  FaMugHot,
} from "react-icons/fa";

import { getProducts } from "../api/api";
import { useCart } from "../components/CartContext";

// Helper định dạng tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getProducts({ limit: 8, page: 1 });
        const products = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-10">
      {/* =========================================
          🎬 1. HERO SECTION (VIDEO BACKGROUND)
      ========================================= */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl">
        {/* VIDEO NỀN */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/coffee-pour.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />

        {/* CONTENT */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6 mx-auto hover:bg-white/30 transition-all">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Premium Taste
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Thưởng thức <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
              Cà phê đậm vị
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Khám phá hương vị cà phê Việt Nam đích thực, được tuyển chọn từ
            những hạt cà phê thượng hạng nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/menu"
              className="group relative px-8 py-4 bg-orange-600 rounded-full font-bold text-lg overflow-hidden shadow-lg shadow-orange-600/40 hover:scale-105 transition-transform duration-300"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="flex items-center gap-2 relative">
                <FaCoffee /> Khám phá Menu
              </span>
            </Link>

            <Link
              to="/booking"
              className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-full font-bold text-lg hover:bg-white hover:text-orange-800 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <FaCalendarAlt /> Đặt bàn ngay
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          🏆 2. WHY CHOOSE US
      ========================================= */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full grid place-items-center text-2xl group-hover:scale-110 transition-transform">
              <FaLeaf />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">
              Nguyên liệu sạch
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              100% hạt cà phê được tuyển chọn kỹ lưỡng từ nông trại Đà Lạt.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full grid place-items-center text-2xl group-hover:scale-110 transition-transform">
              <FaMugHot />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">
              Hương vị đậm đà
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Công thức pha chế độc quyền giữ trọn hương vị truyền thống.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full grid place-items-center text-2xl group-hover:scale-110 transition-transform">
              <FaAward />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">
              Dịch vụ tận tâm
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Không gian thoải mái, nhân viên thân thiện, phục vụ chu đáo.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          ☕ 3. SẢN PHẨM NỔI BẬT (Featured Products)
      ========================================= */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-orange-600 font-bold tracking-wider uppercase text-sm">
            Menu của chúng tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 dark:text-white">
            Sản phẩm nổi bật
          </h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id_mon}
                className="bg-white dark:bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all group flex flex-col h-full"
              >
                {/* Ảnh sản phẩm */}
                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={
                      product.anh ||
                      "https://placehold.co/300x300?text=No+Image"
                    }
                    alt={product.ten_mon}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge rating */}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                    <FaStar className="text-yellow-400" />{" "}
                    {product.rating_avg || "5.0"}
                  </div>
                </div>

                {/* Thông tin */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-1"
                    title={product.ten_mon}
                  >
                    {product.ten_mon}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                    {product.mo_ta || "Hương vị tuyệt hảo..."}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(product.gia)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 grid place-items-center transition-colors shadow-sm"
                      title="Thêm vào giỏ"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-block px-8 py-3 rounded-full border-2 border-orange-600 text-orange-600 font-bold hover:bg-orange-600 hover:text-white transition-all"
          >
            Xem toàn bộ Menu
          </Link>
        </div>
      </section>

      {/* =========================================
          🎁 4. BANNER KHUYẾN MÃI TĨNH
          (thay cho dynamic promotions)
      ========================================= */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 to-orange-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <div className="relative z-10 mb-6 md:mb-0 md:w-2/3">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4 inline-block">
              Khuyến mãi đặc biệt
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Giảm ngay 20% cho đơn hàng đầu tiên!
            </h2>
            <p className="text-orange-100 text-lg mb-0">
              Đăng ký thành viên ngay hôm nay để nhận ưu đãi và tích điểm
              đổi quà.
            </p>
          </div>
          <div className="relative z-10">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-orange-800 font-bold rounded-full shadow-lg hover:bg-orange-50 hover:scale-105 transition-transform inline-block"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
