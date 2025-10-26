import { useCart } from "./CartContext";
import { toast } from "react-toastify";

// Đây là component ProductCard bị thiếu
// Tôi đã tạo nó dựa trên code của MenuPage.jsx
export default function ProductCard({ p }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(p);
    toast.success(`Đã thêm "${p.ten_mon || p.name}" vào giỏ!`);
  };

  return (
    <div
      key={p.id_mon || p._id}
      className="border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <img
        src={p.anh || p.imageUrl || "https://placehold.co/400x300/F9F5EC/A1887F?text=LO+COFFEE"}
        alt={p.ten_mon || p.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg">{p.ten_mon || p.name}</h3>
          <p className="text-red-700 font-semibold mt-2">
            {(Number(p.gia) || 0).toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
