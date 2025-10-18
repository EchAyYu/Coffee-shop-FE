import { useEffect, useState } from "react";
import { getProducts, getOrders, customers } from "../../api/api";

export default function AdminDashboard() {
  const [data, setData] = useState({
    customers: [],
    orders: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, ordersRes, customersRes] = await Promise.all([
          getProducts(),
          getOrders().catch(() => ({ data: [] })), // nếu /orders chưa có
          customers.getMyInfo().catch(() => ({ data: [] })), // nếu /customers/all chưa có
        ]);

        setData({
          products: productsRes.data?.data || productsRes.data || [],
          orders: ordersRes.data?.data || ordersRes.data || [],
          customers: Array.isArray(customersRes.data)
            ? customersRes.data
            : [customersRes.data],
        });
      } catch (err) {
        console.error("⚠️ Lỗi tải dữ liệu admin:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-center py-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center text-red-700">
        ☕ Bảng điều khiển quản trị
      </h1>

      {/* Sản phẩm */}
      <section>
        <h2 className="text-xl font-semibold mb-2">📦 Sản phẩm</h2>
        <ul className="list-disc ml-6">
          {data.products.map((p) => (
            <li key={p.id_mon}>
              {p.ten_mon} — {p.gia} ₫
            </li>
          ))}
        </ul>
      </section>

      {/* Đơn hàng */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🧾 Đơn hàng</h2>
        <ul className="list-disc ml-6">
          {data.orders.map((o) => (
            <li key={o.id_don}>
              #{o.id_don} — {o.trang_thai || "Đang xử lý"}
            </li>
          ))}
        </ul>
      </section>

      {/* Khách hàng */}
      <section>
        <h2 className="text-xl font-semibold mb-2">👥 Khách hàng</h2>
        <ul className="list-disc ml-6">
          {data.customers.map((c) => (
            <li key={c.id_kh || c.id_tk}>
              {c.ho_ten || c.ten_dn || "Ẩn danh"} — {c.email || "Không có email"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
