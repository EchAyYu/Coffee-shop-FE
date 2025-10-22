// ================================
// ☕ LO COFFEE - Editable Homepage (Updated)
// ================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/api';
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
      setProducts(productList.slice(0, 8)); // Hiển thị 8 sản phẩm đầu tiên
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ================= HERO SECTION ================= */}
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
                {/* The Editable component was removed, so this will now be a static text */}
                Cà phê đậm vị
              </span>
            </h1>

            {/* ⚠️ Sửa lỗi lồng <p> */}
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              {/* The Editable component was removed, so this will now be a static text */}
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

      {/* ============== Promotions Section ============== */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Khuyến mãi đặc biệt
            </h2>
            <p className="text-xl text-gray-600">
              Những ưu đãi hấp dẫn chỉ dành riêng cho bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Promotion Card 1 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🔥</div>
                  <div className="text-2xl font-bold">HOT DEAL</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Giảm 30%</h3>
                <p className="text-gray-600 mb-4">Tất cả đồ uống từ 14:00 - 17:00</p>
                <div className="text-sm text-gray-500">
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Có hiệu lực đến 31/12</span>
                </div>
              </div>
            </div>

            {/* Promotion Card 2 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🎁</div>
                  <div className="text-2xl font-bold">COMBO</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mua 2 tặng 1</h3>
                <p className="text-gray-600 mb-4">Combo cà phê + bánh ngọt</p>
                <div className="text-sm text-gray-500">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Áp dụng cuối tuần</span>
                </div>
              </div>
            </div>

            {/* Promotion Card 3 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <div className="text-2xl font-bold">VIP</div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thành viên VIP</h3>
                <p className="text-gray-600 mb-4">Tích điểm đổi quà hấp dẫn</p>
                <div className="text-sm text-gray-500">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Đăng ký miễn phí</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🏪 Về LO COFFEE
            </h2>
            <p className="text-xl text-gray-600">
              Câu chuyện của chúng tôi và cam kết với khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl grid place-items-center text-white text-xl">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cà phê nguyên chất</h3>
                    <p className="text-gray-600">Chúng tôi sử dụng 100% cà phê Arabica và Robusta từ các trang trại uy tín tại Việt Nam.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl grid place-items-center text-white text-xl">
                    👨‍🍳
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Barista chuyên nghiệp</h3>
                    <p className="text-gray-600">Đội ngũ barista được đào tạo bài bản, tạo ra những ly cà phê hoàn hảo.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl grid place-items-center text-white text-xl">
                    ❤️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Phục vụ tận tâm</h3>
                    <p className="text-gray-600">Chúng tôi cam kết mang đến trải nghiệm tuyệt vời nhất cho mỗi khách hàng.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full grid place-items-center text-white text-4xl mx-auto mb-6">
                    ☕
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Thông tin cửa hàng</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-600">📍</span>
                      <span className="text-gray-700">123 Đường ABC, Quận XYZ, TP.HCM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-600">🕒</span>
                      <span className="text-gray-700">6:00 - 22:00 (Hàng ngày)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-600">📞</span>
                      <span className="text-gray-700">0123 456 789</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-600">✉️</span>
                      <span className="text-gray-700">info@locoffee.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
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

      {/* CTA Section */}
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