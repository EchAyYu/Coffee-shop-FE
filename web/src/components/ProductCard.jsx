// web/src/components/ProductCard.jsx
import { useCart } from "./CartContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { EyeIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

// --- Component StarRating (Cập nhật màu cho Dark Mode) ---
const StarRating = ({ rating, count }) => {
  const roundedRating = Math.round(rating || 0);
  if (count === 0) {
    return (
      <div className="text-xs text-gray-400 dark:text-gray-500 h-5">
        Chưa có đánh giá
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 h-5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= roundedRating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({count})
      </span>
    </div>
  );
};

export default function ProductCard({ p, onQuickViewClick }) {
  const { addToCart } = useCart();

  // Tính giá hiển thị (có khuyến mãi hay không)
  const originalPrice = Number(p.gia) || 0;
  const promoPrice =
    p.gia_km != null ? Number(p.gia_km) : originalPrice;
  const hasPromo = promoPrice < originalPrice;

  // Logic thêm vào giỏ
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemToAdd = {
      ...p, // giữ lại gia_km, khuyen_mai_ap_dung nếu có
      id_mon: p.id_mon,
      ten_mon: p.ten_mon || p.name,
      gia: p.gia, // giá gốc; CartContext sẽ tự dùng gia_km nếu có
      so_luong: 1,
      size: "M",
      cartItemId: `${p.id_mon}_M`,
    };

    addToCart(itemToAdd);
    toast.success(`Đã thêm "${itemToAdd.ten_mon}" vào giỏ!`);
  };

  // Logic xem nhanh
  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickViewClick) onQuickViewClick(p);
  };

  return (
    <Link
      to={`/product/${p.id_mon}`}
      key={p.id_mon || p._id}
      className="group relative bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* 1. Phần Ảnh */}
      <div className="w-full h-56 overflow-hidden relative bg-gray-100 dark:bg-gray-800">
        <img
          src={
            p.anh ||
            p.imageUrl ||
            "https://placehold.co/400x300/F9F5EC/A1887F?text=LO+COFFEE"
          }
          alt={p.ten_mon || p.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Nút Xem nhanh */}
        <button
          onClick={handleQuickViewClick}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/60 backdrop-blur rounded-full shadow-lg text-gray-600 dark:text-white
                     opacity-0 group-hover:opacity-100 transition-all duration-300
                     hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 transform hover:scale-110"
          title="Xem nhanh"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Phần Thông tin */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tên món */}
          <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 mb-1 group-hover:text-orange-600 transition-colors">
            {p.ten_mon || p.name}
          </h3>

          {/* Đánh giá sao */}
          <div className="mb-3 flex items-center">
            <StarRating rating={p.rating_avg} count={p.rating_count} />
          </div>

          {/* Giá tiền */}
          {hasPromo ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-500">
                  {promoPrice.toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {originalPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              {/* Badge nhỏ nếu muốn cho rõ là đang khuyến mãi */}
              {p.khuyen_mai_ap_dung && (
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                  {p.khuyen_mai_ap_dung.loai_km === "FIXED_PRICE"
                    ? "Đồng giá khuyến mãi"
                    : "Đang áp dụng khuyến mãi"}
                </span>
              )}
            </div>
          ) : (
            <p className="text-lg font-bold text-orange-600 dark:text-orange-500">
              {originalPrice.toLocaleString("vi-VN")} ₫
            </p>
          )}
        </div>

        {/* Nút Thêm vào giỏ */}
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl 
                     hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 dark:hover:text-white 
                     transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingCartIcon className="w-5 h-5 group-hover/btn:animate-bounce" />
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
}
