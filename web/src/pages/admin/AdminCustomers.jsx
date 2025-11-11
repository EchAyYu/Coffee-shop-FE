// src/pages/admin/AdminCustomersPage.jsx
// --- PHIÊN BẢN NÂNG CẤP (V2.1) - LỌC THEO QUẬN/HUYỆN ---

import { useEffect, useState } from "react";
import { customers } from "../../api/adminApi";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import { Users, Search, X, ArrowLeft, ArrowRight, Trash2, Eye, Filter } from "lucide-react";
import useDebounce from "../../hooks/useDebounce"; 
import CustomerDetailModal from "../../components/CustomerDetailModal"; 

// (Component Pagination giữ nguyên)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // ... (Code component Pagination của bạn giữ nguyên)
    if (!totalPages || totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const MAX_VISIBLE_PAGES = 5;
    let visiblePages = [];
    if (totalPages <= MAX_VISIBLE_PAGES + 2) {
        visiblePages = pages;
    } else {
        visiblePages.push(1);
        const startPage = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 2) / 2));
        const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 3);
        if (startPage > 2) visiblePages.push('...');
        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }
        if (endPage < totalPages - 1) visiblePages.push('...');
        visiblePages.push(totalPages);
    }

    return (
        <nav className="flex items-center justify-center gap-1.5 mt-6 text-sm">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
            >
                <ArrowLeft size={16} />
            </button>
            {visiblePages.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                ) : (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 border rounded-lg transition-colors text-sm ${currentPage === page ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
        _         >
                    {page}
                </button>
            ))}
             <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!totalPages || currentPage === totalPages}
                className="px-3 py-2 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600"
            >
                <ArrowRight size={16} />
            </button>
        </nav>
    );
};

// 💡 SỬA ĐỔI: Dùng danh sách Quận/Huyện từ file cantho.json của bạn
const DISTRICTS = [
  "Ninh Kiều", "Bình Thuỷ", "Cái Răng", "Ô Môn", "Thốt Nốt", 
  "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
];

export default function AdminCustomers() {
  const [customerList, setCustomerList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // State cho Search (dùng Debounce)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // 💡 SỬA ĐỔI: State cho Filter Quận/Huyện
  const [district, setDistrict] = useState(searchParams.get('district') || '');

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const newParams = {};
    if (currentPage > 1) newParams.page = currentPage.toString();
    if (debouncedSearch) newParams.q = debouncedSearch;
    if (district) newParams.district = district; // 💡 Sửa: district
    
    setSearchParams(newParams, { replace: true });
    
    fetchCustomers(currentPage, debouncedSearch, district); // 💡 Sửa: district
  }, [currentPage, debouncedSearch, district]); // 💡 Sửa: district

  const fetchCustomers = async (page, q, district) => { // 💡 Sửa: district
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        ...(q && { q }),
        ...(district && { district }), // 💡 Sửa: gửi 'district' lên BE
      };
      const res = await customers.getAll(params);

      setCustomerList(res.data?.data || []);
      setPagination({
          currentPage: res.data?.page || 1,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || 10)),
          totalItems: res.data?.total || 0,
      });

    } catch (err) {
      console.error("❌ Fetch customers failed:", err);
      setError(err.message || "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDistrict(''); // 💡 Sửa: district
    setSearchParams({ page: '1' });
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Xóa khách hàng "${name}"?`,
      text: "Hành động này sẽ xóa vĩnh viễn khách hàng! Không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await customers.delete(id); 
          Swal.fire("Đã xóa!", `Khách hàng ${name} đã bị xóa.`, "success");
          fetchCustomers(currentPage, debouncedSearch, district); // 💡 Sửa: district
        } catch (err) {
          console.error("Delete customer failed:", err);
          Swal.fire("Lỗi!", err.response?.data?.message || "Không thể xóa khách hàng.", "error");
        }
      }
    });
  };

  const handleViewDetails = async (id) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await customers.getById(id); 
      setSelectedCustomer(res.data || null);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết khách hàng:", err);
      Swal.fire("Lỗi", "Không thể tải chi tiết khách hàng.", "error");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users size={30}/> Quản lý Khách hàng
        </h1>
        <p className="text-gray-600 mt-1">Xem, tìm kiếm, và quản lý thông tin khách hàng.</p>
      </div>

      {/* 2. Thanh Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
            {/* Search (Dùng Debounce) */}
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={16} className="text-gray-400"/>
                 </span>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSearchParams(prev => {
                        prev.set('page', '1');
                        return prev;
                      });
                    }}
                    placeholder="Tìm theo tên, email, SĐT..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                 />
            </div>
            
            {/* 💡 SỬA ĐỔI: Filter Quận/Huyện */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Filter size={16} className="text-gray-400"/>
               </span>
              <select 
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setSearchParams(prev => {
                    prev.set('page', '1');
                    return prev;
                  });
                }}
                className="w-full md:w-auto pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm appearance-none"
              >
                <option value="">Tất cả Quận/Huyện</option>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Nút Xóa Filter */}
            {(searchTerm || district) && ( // 💡 Sửa: district
              <button 
                type="button" 
                onClick={handleClearFilters} 
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors" 
                title="Xóa tìm kiếm"
              >
                <X size={16}/>
              </button>
            )}
        </div>
      </div>

       {/* Loading State */}
      {loading && ( <div className="text-center py-20 text-sm text-gray-500">Đang tải dữ liệu khách hàng...</div> )}
      {/* Error State */}
      {error && !loading && ( <div className="p-6 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">{error}</div> )}
      
      {/* 3. Bảng Khách hàng */}
      {!loading && !error && (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase">
                <tr>
                  {/* 💡 SỬA CỘT ID */}
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Họ tên</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Quận/Huyện</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Tên ĐN</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <Users size={32} className="mx-auto text-gray-300 mb-3"/>
                      {searchTerm || district ? `Không tìm thấy khách hàng nào.` : "Chưa có khách hàng nào."}
                    </td>
                  </tr>
                )}
                {customerList.map((customer) => (
                  <tr key={customer.id_kh} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="font-mono font-semibold text-blue-600">#{customer.id_kh}</span>
                    </td>
                    <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate">{customer.ho_ten || "-"}</p>
                    </td>
                     <td className="px-6 py-4 text-gray-700">
                      <div>{customer.email || "-"}</div>
                        <div className="text-xs text-gray-500">{customer.sdt || "-"}</div>
                    </td>
                   <td className="px-6 py-4 text-gray-700 truncate max-w-xs">
                        {customer.dia_chi || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                        {customer.district || <span className="text-gray-400">-</span>}
                    </td>
                     <td className="px-6 py-4 text-gray-600">
                        {customer.Account?.ten_dn || <span className="text-gray-400">Không có</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewDetails(customer.id_kh)}
                            className="text-blue-600 hover:text-blue-800" title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id_kh, customer.ho_ten || `ID ${customer.id_kh}`)}
                            className="text-red-500 hover:text-red-700" title="Xóa"
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
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
          )}
        </div>
      )}

      {/* 4. Render Modal (ở cuối) */}
      <CustomerDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={isModalLoading ? null : selectedCustomer}
      />
    </div>
  );
}