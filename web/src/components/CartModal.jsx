// ================================
// ☕ Coffee Shop FE - Cart Modal
// ================================
import { useCart } from "./CartContext";

export default function CartModal({ open, onClose, user }) {
  const { cart, removeFromCart, updateQty, checkout } = useCart();

  if (!open) return null;

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * item.so_luong,
    0
  );

  const handleOrder = async () => {
    try {
      await checkout(user);
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative">
        <h2 className="text-xl font-semibold mb-4">🛒 Giỏ hàng</h2>

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
