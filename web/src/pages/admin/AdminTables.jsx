import { useEffect, useState } from "react";
import { tables } from "../../api/api";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, MoreVertical } from "lucide-react";

// Định nghĩa các khu vực và trạng thái
const AREAS = [
  { value: "indoor", label: "Phòng lạnh" },
  { value: "outside", label: "Ngoài trời" },
  { value: "vip", label: "VIP" },
];

const STATUSES = [
  { value: "available", label: "Còn trống", color: "bg-green-100 text-green-700" },
  { value: "occupied", label: "Đang sử dụng", color: "bg-red-100 text-red-700" },
  { value: "reserved", label: "Đã đặt", color: "bg-yellow-100 text-yellow-700" },
  { value: "maintenance", label: "Bảo trì", color: "bg-gray-100 text-gray-700" },
];

// Helper tìm nhãn
const getLabel = (arr, value) => arr.find(item => item.value === value)?.label || value;
const getStatusColor = (value) => STATUSES.find(item => item.value === value)?.color || "bg-gray-100 text-gray-700";

export default function AdminTables() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await tables.list();
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setData(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tableData, isCreating = false) => {
    try {
      if (isCreating) {
        // Tạo mới
        const res = await tables.create(tableData);
        setData([res.data.data, ...data]); // Thêm vào đầu danh sách
      } else {
        // Cập nhật
        const res = await tables.update(tableData.id_ban, tableData);
        setData(data.map(item => item.id_ban === tableData.id_ban ? res.data.data : item));
      }
      Swal.fire("Thành công!", `Đã ${isCreating ? 'tạo' : 'cập nhật'} bàn thành công.`, "success");
    } catch (err) {
      Swal.fire("Lỗi!", err.response?.data?.message || "Không thể lưu bàn.", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại bàn này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await tables.delete(id);
          setData(data.filter(item => item.id_ban !== id));
          Swal.fire("Đã xóa!", "Bàn đã được xóa.", "success");
        } catch (err) {
          Swal.fire("Lỗi!", err.response?.data?.message || "Không thể xóa bàn.", "error");
        }
      }
    });
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      const res = await tables.updateStatus(id, newStatus);
      setData(data.map(item => item.id_ban === id ? res.data.data : item));
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Đã cập nhật trạng thái',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
       Swal.fire("Lỗi!", err.response?.data?.message || "Không thể cập nhật trạng thái.", "error");
    }
  };

  const openFormModal = (table = null) => {
    const isCreating = table === null;
    const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400";
    
    Swal.fire({
      title: isCreating ? "Tạo bàn mới" : "Cập nhật bàn",
      html: `
        <input id="swal-so_ban" class="swal2-input" placeholder="Số bàn (B01, V02...)" value="${table?.so_ban || ''}">
        <input id="swal-ten_ban" class="swal2-input" placeholder="Tên bàn (Cạnh cửa sổ...)" value="${table?.ten_ban || ''}">
        <select id="swal-khu_vuc" class="swal2-select">
          ${AREAS.map(area => `<option value="${area.value}" ${table?.khu_vuc === area.value ? 'selected' : ''}>${area.label}</option>`).join('')}
        </select>
        <input id="swal-suc_chua" type="number" class="swal2-input" placeholder="Sức chứa (số người)" value="${table?.suc_chua || 4}">
        <input id="swal-hinh_anh" class="swal2-input" placeholder="URL Hình ảnh" value="${table?.hinh_anh || defaultImage}">
        <textarea id="swal-mo_ta" class="swal2-textarea" placeholder="Mô tả (tùy chọn)">${table?.mo_ta || ''}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Lưu lại",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        return {
          id_ban: table?.id_ban,
          so_ban: document.getElementById("swal-so_ban").value,
          ten_ban: document.getElementById("swal-ten_ban").value,
          khu_vuc: document.getElementById("swal-khu_vuc").value,
          suc_chua: parseInt(document.getElementById("swal-suc_chua").value) || 4,
          hinh_anh: document.getElementById("swal-hinh_anh").value || defaultImage,
          mo_ta: document.getElementById("swal-mo_ta").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (!result.value.so_ban) {
          Swal.fire("Lỗi!", "Số bàn là bắt buộc.", "error");
          return;
        }
        handleSave(result.value, isCreating);
      }
    });
  };

  if (loading) return <div className="p-4">Đang tải danh sách bàn...</div>;
  if (error) return <div className="p-4 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Bàn ({data.length})</h1>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Tạo bàn mới
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Hình ảnh</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Số bàn</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Tên bàn</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Khu vực</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Sức chứa</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((table) => (
              <tr key={table.id_ban}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <img src={table.hinh_anh} alt={table.ten_ban} className="w-16 h-16 rounded-lg object-cover" />
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 font-bold">{table.so_ban}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900">{table.ten_ban}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900">{getLabel(AREAS, table.khu_vuc)}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900">{table.suc_chua} người</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <select
                    value={table.trang_thai}
                    onChange={(e) => handleChangeStatus(table.id_ban, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-none outline-none ${getStatusColor(table.trang_thai)}`}
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button onClick={() => openFormModal(table)} className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(table.id_ban)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={18} />
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
