import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../api/api";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data || res.data))
      .catch((err) => console.error("Lỗi lấy danh mục:", err));

    getProducts()
      .then((res) => setProducts(res.data.data || res.data))
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

  return (
    <div className="py-12">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        Menu Highlands Style
      </h2>

      {/* Danh mục */}
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

      {/* Danh sách sản phẩm */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {filtered.map((p) => (
          <div
            key={p.id_mon || p._id}
            className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
          >
            <img
              src={p.anh || p.imageUrl || "/images/placeholder.png"}
              alt={p.ten_mon || p.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-center">
              <h3 className="font-semibold text-lg">
                {p.ten_mon || p.name}
              </h3>
              <p className="text-red-700 font-semibold mt-2">
                {(Number(p.gia) || 0).toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-neutral-500 mt-8">
          Không có sản phẩm nào để hiển thị.
        </p>
      )}
    </div>
  );
}
