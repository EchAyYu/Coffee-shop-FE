import { useEffect, useState } from "react";
import { reservations } from "../../api/api";
import Swal from "sweetalert2";

export default function AdminReservations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await reservations.list();
      setData(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    Swal.fire({
      title: `Cập nhật trạng thái?`,
      text: `Bạn có chắc muốn đổi trạng thái đơn đặt bàn này thành "${status}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await reservations.update(id, { status: status });
          Swal.fire("Thành công!", "Đã cập nhật trạng thái.", "success");
          loadReservations(); // Tải lại danh sách
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
        }
      }
    });
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Đặt bàn</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bàn
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id_datban}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{item.ho_ten}</p>
                  <p className="text-gray-600 whitespace-no-wrap">{item.sdt}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(item.ngay_dat).toLocaleDateString("vi-VN")}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{item.id_ban}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span
                    className={`relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-0 ${
                        item.trang_thai === "confirmed"
                          ? "bg-green-200"
                          : "bg-yellow-200"
                      } opacity-50 rounded-full`}
                    ></span>
                    <span className="relative">{item.trang_thai}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button
                    onClick={() => handleUpdateStatus(item.id_datban, "CONFIRMED")}
                    className="text-green-600 hover:text-green-900 mr-2"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(item.id_datban, "CANCELLED")}
                    className="text-red-600 hover:text-red-900"
                  >
                    Hủy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
