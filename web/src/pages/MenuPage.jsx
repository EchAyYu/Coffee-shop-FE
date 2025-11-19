import { useEffect, useState } from "react"; 
import { getProducts, getCategories } from "../api/api";
import ProductCard from "../components/ProductCard";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { FaCoffee, FaFilter, FaSearch } from "react-icons/fa";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true); // 💡 Thêm state loading
  
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Chạy song song 2 API để tiết kiệm thời gian
        const [catRes, prodRes] = await Promise.all([
          getCategories(),
          getProducts({ limit: 100 }) // Lấy nhiều sản phẩm để lọc client
        ]);

        setCategories(catRes.data.data || catRes.data || []);
        
        const productsData = prodRes.data.data?.rows || prodRes.data.data || prodRes.data || [];
        setProducts(productsData);
      } catch (err) {
        console.error("Lỗi tải dữ liệu menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Logic lọc
  const filtered = activeCat === "all"
    ? products
    : products.filter(p => 
        p.id_dm === activeCat || p.categoryId === activeCat || p.category_id === activeCat
      );

  const handleOpenQuickView = (product) => setSelectedProduct(product);
  const handleCloseQuickView = () => setSelectedProduct(null);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      
      {/* 1. Header Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
          Thực đơn đa dạng
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold mt-3 mb-4 text-gray-800 dark:text-white">
          Khám phá Menu
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-400 to-red-600 mx-auto rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
          Từ cà phê truyền thống đến các loại trà trái cây nhiệt đới, chúng tôi có mọi thứ để làm hài lòng vị giác của bạn.
        </p>
      </div>

      {/* 2. Category Filter (Giao diện Pill hiện đại) */}
      <div className="sticky top-[70px] z-30 py-4 bg-[#fdfaf3]/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md -mx-4 px-4 mb-8 border-b border-transparent dark:border-white/5 transition-colors">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveCat("all")}
            className={`
              px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
              ${activeCat === "all"
                ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/30 scale-105"
                : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-white/10 hover:border-orange-200"
              }
            `}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id_dm || cat._id}
              onClick={() => setActiveCat(cat.id_dm || cat._id)}
              className={`
                px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border whitespace-nowrap
                ${activeCat === (cat.id_dm || cat._id)
                  ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/30 scale-105"
                  : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-white/10 hover:border-orange-200"
                }
              `}
            >
              {cat.ten_dm || cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Product Grid */}
      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-[360px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[400px]">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <ProductCard 
                key={p.id_mon || p._id} 
                p={p} 
                onQuickViewClick={handleOpenQuickView}
              />
            ))
          ) : (
            // Empty State
            <div className="col-span-full flex flex-col items-center justify-center text-gray-400 py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl">
                <FaCoffee />
              </div>
              <p className="text-lg font-medium">Không tìm thấy sản phẩm nào trong danh mục này.</p>
              <button 
                onClick={() => setActiveCat("all")}
                className="mt-4 text-orange-600 hover:underline"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Xem Nhanh */}
      {selectedProduct && (
        <ProductQuickViewModal 
          product={selectedProduct} 
          onClose={handleCloseQuickView} 
        />
      )}
    </div>
  );
}