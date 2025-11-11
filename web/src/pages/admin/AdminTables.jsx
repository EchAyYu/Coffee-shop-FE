// src/pages/admin/AdminTablesPage.jsx
// --- PHIÊN BẢN NÂNG CẤP (V2.1) - SỬA LỖI SYNTAX ---

import { useEffect, useState } from "react";
import { tables } from "../../api/adminApi"; 
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2 } from "lucide-react";
import TableFormModal from "../../components/TableFormModal"; 

// Định nghĩa các khu vực và trạng thái (Giữ nguyên)
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

// Helper tìm nhãn (Giữ nguyên)
const getLabel = (arr, value) => arr.find(item => item.value === value)?.label || value;
const getStatusColor = (value) => STATUSES.find(item => item.value === value)?.color || "bg-gray-100 text-gray-700";

export default function AdminTables() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // STATE MỚI ĐỂ QUẢN LÝ MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null); 
  
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null); 
      const res = await tables.list();
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setData(list);
    } catch (err) {
      setError(err.message);
      Swal.fire("Lỗi", "Không thể tải danh sách bàn.", "error");
  } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tableData, isCreating = false) => {
    try {
      if (isCreating) {
        const res = await tables.create(tableData);
        const newTable = res.data?.data || res.data; 
        setData([newTable, ...data]); 
      } else {
        const res = await tables.update(tableData.id_ban, tableData);
        const updatedTable = res.data?.data || res.data;
        setData(data.map(item => item.id_ban === tableData.id_ban ? updatedTable : item));
      }
      Swal.fire("Thành công!", `Đã ${isCreating ? 'tạo' : 'cập nhật'} bàn thành công.`, "success");
    } catch (err) {
      const apiError = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Không thể lưu bàn.";
      Swal.fire("Lỗi!", apiError, "error");
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
      const updatedTable = res.data?.data || res.data;
      setData(data.map(item => item.id_ban === id ? updatedTable : item));
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

  const handleOpenCreateModal = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (table) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null); 
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium text-lg">Đang tải danh sách bàn...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Lỗi: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🪑 Quản lý Bàn ({data.length})
          </h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, xóa và cập nhật trạng thái các bàn.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo bàn mới
        </button>
      </div>

      {/* 2. Bảng Dữ Liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hình ảnh</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số bàn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên bàn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khu vực</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sức chứa</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((table) => (
              <tr key={table.id_ban} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <img 
                    src={table.hinh_anh} 
                    alt={table.ten_ban} 
                    className="w-16 h-16 rounded-lg object-cover" 
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/f1f1f1/b5b5b5?text=Lỗi ảnh'; }} 
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{table.so_ban}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{table.ten_ban}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{table.mo_ta}</div>
            _   </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{getLabel(AREAS, table.khu_vuc)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{table.suc_chua} người</div>
                </td>
                <td className="px-6 py-4">
                  {/* 💡 Nâng cấp Dropdown Trạng thái (ĐÃ SỬA LỖI) */}
                  <select
                    value={table.trang_thai}
                    onChange={(e) => handleChangeStatus(table.id_ban, e.target.value)}
                    className={`text-xs font-medium rounded-lg border focus:ring-2 focus:ring-blue-500 ${getStatusColor(table.trang_thai)}`}
                    style={{ 
                      appearance: 'none', 
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2rem',
                      paddingLeft: '0.75rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                    }}
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleOpenEditModal(table)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(table.id_ban)} 
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* 3. Render MODAL MỚI (ở cuối file) */}
      <TableFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingTable}
      />
    </div>
  );
}