// ================================
// ☕ Coffee Shop FE - Cart Modal (v2 đẹp hơn)
// ================================
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CartModal({ open, onClose, user }) {
  const { cart, removeFromCart, updateQty, checkout } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * item.so_luong,
    0
  );

  const handleOrder = async () => {
    // ✅ Nếu chưa đăng nhập → popup thông báo đẹp
    if (!user) {
      Swal.fire({
        icon: "info",
        title: "Vui lòng đăng nhập",
        text: "Bạn cần đăng nhập để đặt hàng nhé ☕",
        confirmButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#b91c1c",
        showCancelButton: true,
        cancelButtonText: "Để sau",
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
          navigate("/login");
        }
      });
      return;
    }

    try {
      await checkout(user);
      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công!",
        text: "Cảm ơn bạn đã đặt hàng tại LO Coffee ☕",
        confirmButtonColor: "#b91c1c",
      });
      onClose();
    } catch (err) {
      console.error("Checkout error:", err);
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại!",
        text: "Vui lòng thử lại sau.",
        confirmButtonColor: "#b91c1c",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🛒 Giỏ hàng</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-neutral-500 text-center">Chưa có sản phẩm nào.</p>
        ) : (
          <>
            <ul className="divide-y max-h-72 overflow-y-auto">
              {cart.map((item) => (
                <li key={item.id_mon || item._id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{item.ten_mon || item.name}</div>
                    <div className="text-sm text-neutral-500">
                      {(Number(item.gia) || 0).toLocaleString()} ₫
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.so_luong}
                      onChange={(e) =>
                        updateQty(item.id_mon || item._id, Number(e.target.value))
                      }
                      className="w-14 border rounded text-center"
                    />
                    <button
                      onClick={() => removeFromCart(item.id_mon || item._id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right font-semibold">
              Tổng: {total.toLocaleString("vi-VN")} ₫
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-3 py-2 border rounded-xl">
                Đóng
              </button>
              <button
                onClick={handleOrder}
                className="px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800"
              >
                Đặt hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
