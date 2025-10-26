import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/api';
// 💡 LƯU Ý: Bạn cần tạo file ProductCard.jsx (tôi đã cung cấp ở file dưới)
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      const productList = response.data?.data || response.data || [];
      // Lấy 8 sản phẩm nổi bật
      setProducts(productList.slice(0, 8));
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ================= HERO SECTION (GIỮ LẠI) ================= */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900"></div>
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-28 h-28 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-6xl mx-auto px-4 text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full grid place-items-center">
                  ☕
                </div>
                <span className="font-semibold">LO COFFEE</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Thưởng thức{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                Cà phê đậm vị
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Khám phá hương vị cà phê Việt Nam đích thực...
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🍽️ Khám phá Menu
              </Link>
              <Link
                to="/booking"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border border-white/30"
              >
                📅 Đặt bàn ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== Promotions Section (ĐÃ XÓA) ============== */}
      {/* Phần khuyến mãi đã được xóa theo yêu cầu của bạn.
      */}

      {/* ============== Store Info Section (ĐÃ XÓA) ============== */}
      {/* Phần thông tin "Về LO COFFEE" đã được di chuyển sang trang /about (AboutPage.jsx)
      */}

      {/* ============ Featured Products Section (GIỮ LẠI VÀ SỬA) ============ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ☕ Sản phẩm nổi bật
            </h2>
            <p className="text-xl text-gray-600">
              Những món đồ uống được yêu thích nhất
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">Đang tải sản phẩm...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                // Sử dụng component ProductCard mới
                <ProductCard key={product.id_mon || product.id} p={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Xem tất cả sản phẩm
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA Section (GIỮ LẠI) ============ */}
      <section className="py-16 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Sẵn sàng trải nghiệm LO COFFEE?
          </h2>
          <p className="text-xl mb-8 text-amber-100">
            Đặt bàn ngay hôm nay và thưởng thức những ly cà phê tuyệt vời nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/booking"
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              📅 Đặt bàn ngay
            </Link>
            <Link
              to="/customer"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border border-white/30"
            >
              👤 Tài khoản của tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
