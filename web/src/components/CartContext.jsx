import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn(
            "Dữ liệu giỏ hàng trong localStorage không hợp lệ, đang xóa."
          );
          localStorage.removeItem("cart");
        }
      } catch (e) {
        console.error("Lỗi parse giỏ hàng từ localStorage:", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem("cart")) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Thêm sản phẩm vào giỏ (ĐÃ SỬA: dùng gia_km nếu có)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product.id_mon || product._id;
      const existingItemIndex = prevCart.findIndex(
        (p) => (p.id_mon || p._id) === productId
      );

      // Xác định giá hiệu lực ngay thời điểm thêm vào giỏ
      const originalPrice = Number(product.gia) || 0;
      const promoPrice =
        product.gia_km != null ? Number(product.gia_km) : originalPrice;
      const effectivePrice = promoPrice; // giá thực sẽ dùng để tính tiền

      if (existingItemIndex > -1) {
        // Nếu sản phẩm đã tồn tại, chỉ tăng số lượng (giữ giá cũ trong giỏ)
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          so_luong: updatedCart[existingItemIndex].so_luong + 1,
        };
        return updatedCart;
      } else {
        // Nếu sản phẩm chưa có, thêm mới với số lượng là 1
        const newItem = {
          id_mon: product.id_mon || product._id,
          ten_mon: product.ten_mon || product.name,
          gia: effectivePrice,          // giá sau khuyến mãi (nếu có)
          gia_goc: originalPrice,       // lưu giá gốc để hiển thị nếu muốn
          anh: product.anh || product.imageUrl,
          so_luong: 1,
        };

        // Loại bỏ các trường undefined
        Object.keys(newItem).forEach(
          (key) => newItem[key] === undefined && delete newItem[key]
        );

        return [...prevCart, newItem];
      }
    });

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
  };

  // Tổng tiền: dùng giá đã lưu (đã khuyến mãi nếu có)
  const totalPrice = cart.reduce(
    (sum, item) => sum + (Number(item.gia) || 0) * item.so_luong,
    0
  );

  // Tổng số lượng sản phẩm
  const totalItems = cart.reduce((sum, item) => sum + item.so_luong, 0);

  const contextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalPrice,
    totalItems,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook tiện ích
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
