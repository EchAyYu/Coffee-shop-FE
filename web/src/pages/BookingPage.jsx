import { useEffect, useState } from "react";
import { tables } from "../api/api";

export default function BookingPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    tables
      .list()
      .then((res) => setData(res.data.data || res.data))
      .catch((err) => console.error("Lỗi lấy danh sách bàn:", err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-10">
        Đặt bàn tại Highlands
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {data.map((t) => (
          <div key={t.id || t._id} className="border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={t.image || "/images/placeholder.png"}
              alt={t.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-neutral-600 mt-1">
                {t.description || "Không có mô tả"}
              </p>
              <p className="mt-2 font-medium">Khu vực: {t.area || "Chưa xác định"}</p>
              <button className="mt-3 px-4 py-2 rounded-xl bg-red-700 text-white">
                Đặt bàn
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-center text-neutral-500 mt-8">Chưa có dữ liệu bàn.</p>
      )}
    </div>
  );
}
