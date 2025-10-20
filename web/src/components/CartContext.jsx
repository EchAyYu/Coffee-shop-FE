// ================================
// ☕ Coffee Shop FE - Cart Context
// ================================
import { createContext, useContext, useState, useEffect } from "react";
import { createOrder } from "../api/api";
// import { toast } from "react-toastify";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Lưu giỏ hàng vào localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Thêm sản phẩm
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id_mon === product.id_mon || p._id === product._id);
      if (exists) {
        return prev.map((p) =>
          p.id_mon === product.id_mon || p._id === product._id
            ? { ...p, so_luong: p.so_luong + 1 }
            : p
        );
      }
      return [...prev, { ...product, so_luong: 1 }];
    });
    console.log("Đã thêm vào giỏ hàng!");
  };

  // Xóa 1 sản phẩm
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id_mon !== id && p._id !== id));
  };

  // Cập nhật số lượng
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id_mon === id || p._id === id ? { ...p, so_luong: qty } : p
      )
    );
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // Gửi đơn hàng đến BE
  const checkout = async (customer) => {
    try {
      const items = cart.map((p) => ({
        id_mon: p.id_mon || p._id,
        so_luong: p.so_luong,
        gia: p.gia || p.price || 0,
      }));

      const payload = {
        items,
        pttt: "COD",
        ho_ten_nhan: customer?.ho_ten || "Khách hàng",
        sdt_nhan: customer?.sdt || "000000000",
        dia_chi_nhan: customer?.dia_chi || "Chưa cập nhật",
      };

      const res = await createOrder(payload);
      console.log("Đặt hàng thành công!");
      clearCart();
      return res.data;
    } catch (err) {
      console.error("Đặt hàng thất bại!");
      console.error("Checkout error:", err);
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
