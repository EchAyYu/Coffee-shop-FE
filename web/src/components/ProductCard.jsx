import { useCart } from "./CartContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; 
// 💡 THÊM: Import icon (tùy chọn, nhưng làm đẹp hơn)
import { EyeIcon } from '@heroicons/react/24/outline';

// --- (Component StarRating giữ nguyên) ---
const StarRating = ({ rating, count }) => {
  const roundedRating = Math.round(rating || 0);
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


// 💡 SỬA: Nhận thêm prop `onQuickViewClick`
export default function ProductCard({ p, onQuickViewClick }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const itemToAdd = {
      ...p,
      id_mon: p.id_mon,
      ten_mon: p.ten_mon || p.name,
      gia: p.gia,
      so_luong: 1,
      size: 'M',
      cartItemId: `${p.id_mon}_M`,
    };

    addToCart(itemToAdd);
    toast.success(`Đã thêm "${itemToAdd.ten_mon}" vào giỏ!`);
  };

  // 💡 THÊM: Hàm xử lý cho nút "Xem nhanh"
  const handleQuickViewClick = (e) => {
    e.preventDefault(); // Ngăn Link (toàn bộ card)
    e.stopPropagation(); // Ngăn Link (toàn bộ card)
    onQuickViewClick(p); // Gọi hàm từ MenuPage
  };

  return (
    <Link
      to={`/product/${p.id_mon}`}
      key={p.id_mon || p._id}
      className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group"
    >
      <div className="w-full h-48 overflow-hidden relative"> {/* 💡 SỬA: Thêm relative */}
        <img
          src={p.anh || p.imageUrl || "https://placehold.co/400x300/F9F5EC/A1887F?text=LO+COFFEE"}
          alt={p.ten_mon || p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* 💡 THÊM: Nút "Xem nhanh" dạng Icon trên ảnh */}
        <button
          onClick={handleQuickViewClick}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-gray-700
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-gray-100 hover:scale-110"
          title="Xem nhanh" // Tooltip
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{p.ten_mon || p.name}</h3>
          
          <div className="mt-1.5 mb-2 h-5 flex justify-center items-center">
            <StarRating rating={p.rating_avg} count={p.rating_count} />
          </div>

          <p className="text-red-700 font-semibold mt-2">
            {(Number(p.gia) || 0).toLocaleString("vi-VN")} ₫
          </p>
        </div>

        {/* 💡 BẠN CÓ THỂ CHỌN 1 TRONG 2 CÁCH ĐẶT NÚT XEM NHANH:
          1. Như code bên trên (icon trên ảnh)
          2. Nút "Xem nhanh" dạng text đặt ở đây (bỏ code nút icon bên trên):
        
          <button
            onClick={handleQuickViewClick}
            className="mt-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            Xem nhanh
          </button>
        */}
        
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