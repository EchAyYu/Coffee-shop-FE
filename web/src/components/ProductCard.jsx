import { useCart } from "./CartContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // 💡 THÊM: Để nhấn vào card đi đến chi tiết

// 💡 HELPER: Component hiển thị sao (chỉ để xem)
const StarRating = ({ rating, count }) => {
  const roundedRating = Math.round(rating || 0);
  
  // Ẩn đi nếu chưa có đánh giá
  if (count === 0) {
    return (
      <div className="text-xs text-gray-400 h-5">
        Chưa có đánh giá
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 h-5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
      <span className="text-xs text-gray-500">({count})</span>
    </div>
  );
};


export default function ProductCard({ p }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    // 💡 NGĂN: Không cho link của thẻ card chạy khi nhấn nút
    e.preventDefault(); 
    e.stopPropagation(); 
    
    // 💡 SỬA: Thêm các trường cho giỏ hàng
    const itemToAdd = {
      ...p,
      id_mon: p.id_mon,
      ten_mon: p.ten_mon || p.name,
      gia: p.gia,
      so_luong: 1, // Mặc định thêm 1
      size: 'M', // Mặc định size M khi thêm từ Menu
      cartItemId: `${p.id_mon}_M`,
    };

    addToCart(itemToAdd);
    toast.success(`Đã thêm "${itemToAdd.ten_mon}" vào giỏ!`);
  };

  return (
    // 💡 THÊM: Biến toàn bộ thẻ thành một đường link
    <Link
      to={`/product/${p.id_mon}`} // 💡 THÊM: Link đến trang chi tiết
      key={p.id_mon || p._id}
      className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group"
    >
      <div className="w-full h-48 overflow-hidden">
        <img
          src={p.anh || p.imageUrl || "https://placehold.co/400x300/F9F5EC/A1887F?text=LO+COFFEE"}
          alt={p.ten_mon || p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{p.ten_mon || p.name}</h3>
          
          {/* 💡 ======================================== 💡 */}
          {/* 💡 ===== THÊM PHẦN HIỂN THỊ ĐÁNH GIÁ ===== 💡 */}
          {/* 💡 ======================================== 💡 */}
          <div className="mt-1.5 mb-2 h-5 flex justify-center items-center">
            <StarRating rating={p.rating_avg} count={p.rating_count} />
          </div>

          <p className="text-red-700 font-semibold mt-2">
            {(Number(p.gia) || 0).toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
        >
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
}