// src/pages/admin/AdminOrders.jsx
import { useEffect, useState } from "react";
import { getOrdersAdmin } from "../../api/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
  try {
    const res = await getOrdersAdmin();
    console.log("✅ API /admin/orders result:", res.data);
    setOrders(res.data?.data || []);
  } catch (err) {
    console.error("❌ Fetch orders failed:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
}

    fetchOrders();
  }, []);

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📦 Danh sách đơn hàng</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 italic">Không có đơn hàng nào.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Khách hàng</th>
              <th className="border px-3 py-2">Ngày đặt</th>
              <th className="border px-3 py-2">Trạng thái</th>
              <th className="border px-3 py-2">Sản phẩm</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id_don}>
                <td className="border px-3 py-2 text-center">{o.id_don}</td>
                <td className="border px-3 py-2">{o.ho_ten_nhan}</td>
                <td className="border px-3 py-2">
                  {new Date(o.ngay_dat).toLocaleString("vi-VN")}
                </td>
                <td className="border px-3 py-2 text-center">{o.trang_thai}</td>
                <td className="border px-3 py-2">
                  {o.OrderDetails?.length
                    ? o.OrderDetails.map(
                        (d) =>
                          `${d.Product?.ten_mon || "Không rõ"} (${
                            d.so_luong
                          })`
                      ).join(", ")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
