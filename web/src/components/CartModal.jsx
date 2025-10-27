import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function CartModal({ open, onClose, user }) {
  // Bỏ hàm checkout khỏi đây vì nó đã bị xóa khỏi Context
  const { cart, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * item.so_luong,
    0
  );

  // Hàm xử lý khi bấm nút "Đến Thanh toán"
  const handleGoToCheckout = () => {
    // Kiểm tra giỏ hàng có trống không
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Giỏ hàng trống!',
        text: 'Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.',
        confirmButtonColor: "#b91c1c", // Màu đỏ của Highlands
      });
      return; // Dừng lại nếu giỏ hàng trống
    }

    // Đóng modal giỏ hàng
    onClose();
    // Chuyển hướng người dùng đến trang checkout
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"> {/* Thêm padding */}
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl relative max-h-[90vh] flex flex-col"> {/* Giới hạn chiều cao */}
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b"> {/* Thêm border */}
          <h2 className="text-xl font-semibold text-gray-800">🛒 Giỏ hàng của bạn</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
             {/* Icon đóng đẹp hơn */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        {/* Nội dung giỏ hàng */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
             <div className="text-6xl mb-4">🛍️</div>
             <p className="text-neutral-500 font-medium">Giỏ hàng của bạn đang trống.</p>
             <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm bg-red-700 text-white rounded-full hover:bg-red-800"
             >
                Tiếp tục mua sắm
             </button>
          </div>
        ) : (
          <>
            {/* Danh sách sản phẩm */}
            <div className="flex-1 overflow-y-auto pr-2 mb-4"> {/* Cho phép cuộn và thêm padding */}
                <ul className="divide-y divide-gray-100">
                {cart.map((item) => (
                    <li key={item.id_mon || item._id} className="flex items-center justify-between py-4">
                    {/* Ảnh sản phẩm */}
                    <img
                        src={item.anh || item.imageUrl || "https://placehold.co/80x80/F9F5EC/A1887F?text=O"}
                        alt={item.ten_mon || item.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover mr-4 flex-shrink-0" // Kích thước lớn hơn
                    />
                    {/* Thông tin sản phẩm */}
                    <div className="flex-1 mr-4">
                        <div className="font-medium text-gray-800">{item.ten_mon || item.name}</div>
                        <div className="text-sm text-red-600 font-semibold mt-1">
                          {(Number(item.gia) || 0).toLocaleString('vi-VN')} ₫
                        </div>
                    </div>
                    {/* Số lượng & Xóa */}
                    <div className="flex flex-col items-end gap-2">
                        <input
                        type="number"
                        min="1"
                        aria-label={`Số lượng ${item.ten_mon || item.name}`}
                        value={item.so_luong}
                        onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            updateQty(item.id_mon || item._id, newQty > 0 ? newQty : 1);
                        }}
                        className="w-16 border rounded text-center py-1 text-sm focus:ring-red-500 focus:border-red-500"
                        />
                        <button
                        onClick={() => removeFromCart(item.id_mon || item._id)}
                        className="text-gray-500 hover:text-red-600 text-xs font-medium transition-colors"
                        >
                        Xóa
                        </button>
                    </div>
                    </li>
                ))}
                </ul>
            </div>

            {/* Tổng tiền và Nút bấm */}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Tổng cộng:</span>
                  <span className="text-xl font-semibold text-red-700">
                      {total.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={onClose} className="px-4 py-2 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Tiếp tục mua
                  </button>
                  {/* Sửa onClick của nút này */}
                  <button
                    onClick={handleGoToCheckout} // Gọi hàm chuyển hướng
                    disabled={cart.length === 0} // Vô hiệu hóa nếu giỏ trống
                    className="px-6 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Đến Thanh toán
                  </button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

