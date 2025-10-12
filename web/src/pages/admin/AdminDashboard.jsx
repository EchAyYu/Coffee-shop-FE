import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      const c = await api.get("/admin/customers", { headers });
      const o = await api.get("/admin/orders", { headers });
      const p = await api.get("/admin/products", { headers });
      setCustomers(c.data);
      setOrders(o.data);
      setProducts(p.data);
    }
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold">Khách hàng</h2>
        <ul className="list-disc ml-6">
          {customers.map(c => <li key={c.id_kh}>{c.ho_ten} - {c.email}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sản phẩm</h2>
        <ul className="list-disc ml-6">
          {products.map(p => <li key={p.id_mon}>{p.ten_mon} - {p.gia} ₫</li>)}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Đơn hàng</h2>
        <ul className="list-disc ml-6">
          {orders.map(o => <li key={o.id_don}>#{o.id_don} - {o.trang_thai}</li>)}
        </ul>
      </section>
    </div>
  );
}
