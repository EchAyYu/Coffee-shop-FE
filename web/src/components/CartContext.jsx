import { createContext, useContext, useState, useEffect } from "react";
// Bỏ import createOrder vì không còn dùng ở đây
// import { createOrder } from "../api/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Kiểm tra xem có phải là mảng không trước khi setState
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn("Dữ liệu giỏ hàng trong localStorage không hợp lệ, đang xóa.");
          localStorage.removeItem("cart");
        }
      } catch (e) {
        console.error("Lỗi parse giỏ hàng từ localStorage:", e);
        localStorage.removeItem("cart"); // Xóa nếu parse lỗi
      }
    }
  }, []); // Chỉ chạy một lần khi mount

  // Lưu giỏ hàng vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    // Chỉ lưu nếu cart là một mảng (đã được khởi tạo)
    if (cart.length > 0 || localStorage.getItem("cart")) { // Chỉ lưu nếu có thay đổi hoặc đã từng có
        localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product.id_mon || product._id; // Lấy ID chuẩn
      const existingItemIndex = prevCart.findIndex(
        (p) => (p.id_mon || p._id) === productId
      );

      if (existingItemIndex > -1) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          so_luong: updatedCart[existingItemIndex].so_luong + 1,
        };
        return updatedCart;
      } else {
        // Nếu sản phẩm chưa có, thêm mới với số lượng là 1
        // Chỉ nên lưu các trường cần thiết vào giỏ hàng
        const newItem = {
            id_mon: product.id_mon,
            ten_mon: product.ten_mon,
            gia: product.gia,
            anh: product.anh, // Lưu ảnh để hiển thị trong giỏ
            so_luong: 1,
            // Thêm các trường khác nếu cần (ví dụ: size, topping...)
        };
        // Loại bỏ các trường không xác định (undefined) nếu có
        Object.keys(newItem).forEach(key => newItem[key] === undefined && delete newItem[key]);
        return [...prevCart, newItem];
      }
    });
    // Cân nhắc dùng react-toastify để thông báo ở đây
    // toast.success(`Đã thêm ${product.ten_mon || product.name} vào giỏ!`);
    console.log(`Đã thêm ${product.ten_mon || product.name} vào giỏ!`);
  };

  // Xóa một sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((p) => (p.id_mon || p._id) !== productId)
    );
  };

  // Cập nhật số lượng của một sản phẩm
  const updateQty = (productId, quantity) => {
    // Đảm bảo số lượng là số nguyên dương
    const validQuantity = Math.max(1, parseInt(quantity) || 1);
    setCart((prevCart) =>
      prevCart.map((p) =>
        (p.id_mon || p._id) === productId
          ? { ...p, so_luong: validQuantity }
          : p
      )
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
    // localStorage sẽ tự động được cập nhật bởi useEffect
  };

  // Hàm tính tổng tiền (chuyển vào đây cho tiện)
  const totalPrice = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * item.so_luong,
    0
  );

  // Hàm tính tổng số lượng sản phẩm (tiện ích)
  const totalItems = cart.reduce((sum, item) => sum + item.so_luong, 0);


  // Hàm checkout đã được xóa khỏi Context
  // const checkout = async (...) => { ... }


  // Giá trị cung cấp bởi Context
  const contextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalPrice, // Thêm tổng tiền
    totalItems, // Thêm tổng số lượng
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook tiện ích để sử dụng CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

