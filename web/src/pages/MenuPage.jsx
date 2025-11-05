// 💡 THÊM: useState
import { useEffect, useState } from "react"; 
import { getProducts, getCategories } from "../api/api";
import ProductCard from "../components/ProductCard";
// 💡 THÊM: Import Modal
import ProductQuickViewModal from "../components/ProductQuickViewModal";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  
  // 💡 THÊM: State để quản lý sản phẩm đang xem nhanh
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data || res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));

    getProducts()
      .then((res) => {
        const productsData = res.data.data?.rows || res.data.data || res.data;
        setProducts(productsData);
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err));
  }, []);

  const filtered =
    activeCat === "all"
      ? products
      : products.filter(
          (p) =>
            p.id_dm === activeCat ||
            p.categoryId === activeCat ||
            p.category_id === activeCat
        );

  // 💡 THÊM: Hàm để mở/đóng modal
  const handleOpenQuickView = (product) => {
    setSelectedProduct(product);
  };
  const handleCloseQuickView = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        Khám phá Menu
      </h2>

      {/* --- (Phần Lọc Danh mục giữ nguyên) --- */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveCat("all")}
          className={`px-4 py-2 rounded-full border text-sm ${
            activeCat === "all"
              ? "bg-red-700 text-white border-red-700"
              : "hover:bg-red-50"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id_dm || cat._id}
            onClick={() => setActiveCat(cat.id_dm || cat._id)}
            className={`px-4 py-2 rounded-full border text-sm ${
              activeCat === (cat.id_dm || cat._id)
                ? "bg-red-700 text-white border-red-700"
                : "hover:bg-red-50"
            }`}
          >
            {cat.ten_dm || cat.name}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((p) => (
          <ProductCard 
            key={p.id_mon || p._id} 
            p={p} 
            // 💡 THÊM: Truyền hàm xử lý click xuống
            onQuickViewClick={handleOpenQuickView}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-neutral-500 mt-8">
          Không có sản phẩm nào để hiển thị.
        </p>
      )}

      {/* 💡 THÊM: Render Modal nếu có sản phẩm được chọn */}
      {selectedProduct && (
        <ProductQuickViewModal 
          product={selectedProduct} 
          onClose={handleCloseQuickView} 
        />
      )}
    </div>
  );
}