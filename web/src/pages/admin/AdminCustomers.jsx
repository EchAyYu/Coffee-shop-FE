import { useEffect, useState } from "react";
import { customers } from "../../api/api"; // Assuming customers.getAll, deleteCustomer are defined
import Swal from "sweetalert2";
import { Link, useSearchParams } from "react-router-dom";
import { Users, Search, X, ArrowLeft, ArrowRight, Trash2, Edit2, Plus, UserPlus } from "lucide-react"; // Icons

// Component Pagination (Reusable)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (!totalPages || totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Logic to show limited page numbers (e.g., first, last, current +/- 2)
    const MAX_VISIBLE_PAGES = 5;
    let visiblePages = [];
    if (totalPages <= MAX_VISIBLE_PAGES + 2) {
        visiblePages = pages;
    } else {
        visiblePages.push(1); // Always show first page
        const startPage = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES - 2) / 2));
        const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 3);

        if (startPage > 2) visiblePages.push('...'); // Ellipsis if needed

        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }

        if (endPage < totalPages - 1) visiblePages.push('...'); // Ellipsis if needed
        visiblePages.push(totalPages); // Always show last page
    }


    return (
        <nav className="flex items-center justify-center gap-1.5 mt-6 text-xs">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 border rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                aria-label="Previous Page"
            >
                <ArrowLeft size={12} />
            </button>
            {visiblePages.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2.5 py-1.5 text-gray-400">...</span>
                ) : (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-2.5 py-1.5 border rounded-md transition-colors ${currentPage === page ? 'bg-red-600 text-white border-red-600 font-semibold shadow-sm' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                >
                    {page}
                </button>
            ))}
             <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!totalPages || currentPage === totalPages}
                className="px-2.5 py-1.5 border rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                aria-label="Next Page"
            >
                <ArrowRight size={12} />
            </button>
        </nav>
    );
};

export default function AdminCustomers() {
  const [customerList, setCustomerList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, currentQuery]); // Reload when page or query changes

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 15, // Items per page
        ...(currentQuery && { q: currentQuery }),
      };
      // customers.getAll calls GET /api/admin/customers or similar
      const res = await customers.getAll(params);

      // Backend returns { total: count, page: page, limit: limit, data: rows }
      setCustomerList(res.data?.data || []);
      setPagination({
          currentPage: res.data?.page || 1,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || 15)),
          totalItems: res.data?.total || 0,
          limit: res.data?.limit || 15,
      });

    } catch (err) {
      console.error("❌ Fetch customers failed:", err);
      setError(err.message || "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString(), ...(currentQuery && { q: currentQuery }) });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    setSearchParams({ page: '1', ...(query && { q: query }) }); // Reset to page 1 on new search
  };

  // --- Delete Customer ---
  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Xóa khách hàng "${name}"?`,
      text: "Hành động này không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Assuming you have a deleteCustomer function in api.js calling DELETE /api/admin/customers/:id
          // await customers.delete(id); // You might need to add this to api.js
          // For now, let's assume it exists conceptually
          console.log(`Attempting to delete customer with ID: ${id}`); // Placeholder
           // Find the correct API call for deleting
           // Example: await api.delete(`/admin/customers/${id}`);
           // Placeholder success message - replace with actual API call
           Swal.fire("Đã xóa!", `Khách hàng ${name} đã bị xóa.`, "success");
           // Refresh list after delete
           fetchCustomers();
           // setData(data.filter(item => item.id_kh !== id)); // Optimistic update

        } catch (err) {
          console.error("Delete customer failed:", err);
          Swal.fire("Lỗi!", err.response?.data?.message || "Không thể xóa khách hàng.", "error");
        }
      }
    });
  };

  // --- TODO: Add Edit/Create Modals similar to AdminTables ---
  // const handleEdit = (customer) => { ... open modal ... };
  // const handleCreate = () => { ... open modal ... };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users size={20}/> Quản lý Khách hàng
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Xem và quản lý thông tin khách hàng.</p>
        </div>
        {/* Optional: Add "Create Customer" button if needed */}
        {/* <button
          // onClick={handleCreate}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-md hover:shadow-md text-xs font-semibold transition-all duration-200 shadow"
        >
          <UserPlus size={14} />
          Thêm Khách Hàng
        </button> */}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={14} className="text-gray-400"/>
                 </span>
                 <input
                    type="search"
                    name="search"
                    defaultValue={currentQuery}
                    placeholder="Tìm theo tên, email, SĐT..."
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs shadow-sm transition duration-150"
                 />
            </div>
             <button type="submit" className="px-3 py-1.5 bg-gray-700 text-white rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors">Tìm</button>
             {currentQuery && (
                 <button type="button" onClick={() => setSearchParams({ page: '1'})} className="px-2.5 py-1.5 bg-gray-100 text-gray-500 rounded-md text-xs hover:bg-gray-200 transition-colors" title="Xóa tìm kiếm">
                     <X size={14}/>
                 </button>
             )}
         </form>
      </div>

       {/* Loading State */}
      {loading && ( <div className="text-center py-10 text-sm text-gray-500">Đang tải...</div> )}
      {/* Error State */}
      {error && !loading && ( <div className="p-4 text-sm text-red-700 bg-red-50 rounded border border-red-200">{error}</div> )}
      {/* No Data State */}
      {!loading && !error && customerList.length === 0 && (
          <div className="bg-white p-10 text-center rounded-lg shadow-sm border border-gray-100">
              <Users size={32} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-sm text-gray-500">
                  {currentQuery ? `Không tìm thấy khách hàng nào khớp với "${currentQuery}".` : "Chưa có khách hàng nào."}
               </p>
          </div>
      )}

      {/* Customers Table */}
      {!loading && !error && customerList.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5 text-left">ID (KH/TK)</th>
                  <th className="px-4 py-2.5 text-left">Họ tên</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">SĐT</th>
                  <th className="px-4 py-2.5 text-left">Địa chỉ</th>
                  <th className="px-4 py-2.5 text-left">Tên ĐN</th>
                  <th className="px-4 py-2.5 text-center w-20">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customerList.map((customer) => (
                  <tr key={customer.id_kh} className="hover:bg-gray-50/70 transition-colors duration-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                       <span className="font-mono text-gray-600">{customer.id_kh}</span> /
                       <span className="font-mono text-gray-400 ml-1">{customer.id_tk}</span>
                    </td>
                    <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 truncate">{customer.ho_ten || "-"}</p>
                    </td>
                     <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                        {customer.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {customer.sdt || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                        {customer.dia_chi || "-"}
                    </td>
                     <td className="px-4 py-3 text-gray-500 truncate max-w-[100px]">
                        {customer.Account?.ten_dn || "-"} {/* Lấy từ include */}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                        {/* TODO: Add Edit button */}
                        {/* <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 mr-2 p-1 hover:bg-blue-50 rounded-full transition-colors" title="Sửa">
                            <Edit2 size={14} />
                        </button> */}
                        <button
                           onClick={() => handleDelete(customer.id_kh, customer.ho_ten || `ID ${customer.id_kh}`)}
                           className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors" title="Xóa">
                            <Trash2 size={14} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
