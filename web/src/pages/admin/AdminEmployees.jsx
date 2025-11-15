import React, { useState, useEffect } from 'react';
import { employees } from "../../api/adminApi"; 
import AddEmployeeModal from "../../components/AddEmployeeModal"; 
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function AdminEmployees() {
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 STATE MỚI CHO MODAL
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [currentEmployee, setCurrentEmployee] = useState(null); // Dùng cho việc "Sửa"

  // Hàm tải danh sách nhân viên
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await employees.list();
      setEmployeeList(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Lỗi tải danh sách nhân viên:", err);
      setError(err.message || "Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách khi component được render
  useEffect(() => {
    loadEmployees();
  }, []);

  // --- XỬ LÝ THÊM MỚI ---
  const handleSubmitNewEmployee = async (formData) => {
    // (Copy payload từ bước trước)
    const payload = {
      ten_nv: formData.ten_nv,
      ten_dn: formData.ten_dn,
      mat_khau: formData.mat_khau,
    };
    if (formData.email) payload.email = formData.email;
    if (formData.sdt) payload.sdt = formData.sdt;
    if (formData.ngay_sinh) payload.ngay_sinh = formData.ngay_sinh;
    const dia_chi_full = [formData.street, formData.selectedWard, formData.selectedDistrict, "Cần Thơ"].filter(Boolean).join(", ");
    if (dia_chi_full) payload.dia_chi = dia_chi_full;

    try {
      const res = await employees.create(payload); // 💡 1. Chờ phản hồi
      const newEmployee = res.data?.data; // 💡 2. Lấy data nhân viên mới

      setModalMode(null); // Đóng modal
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã tạo tài khoản nhân viên mới thành công.',
        timer: 2000,
        showConfirmButton: false
      });
      
      // 💡 3. FIX LỖI HIỂN THỊ: Cập nhật state (Optimistic Update)
      if (newEmployee) {
        setEmployeeList(currentList => [newEmployee, ...currentList]);
      } else {
        loadEmployees(); // Fallback nếu API không trả về data
      }

    } catch (err) {
      console.error("Lỗi tạo nhân viên:", err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: err.response?.data?.message || err.message || "Tạo tài khoản thất bại."
      });
      throw err; // Ném lỗi để modal biết là đã thất bại
    }
  };

  // --- XỬ LÝ SỬA ---
  const handleOpenEditModal = (employee) => {
    setCurrentEmployee(employee);
    setModalMode('edit');
  };

  const handleSubmitEditEmployee = async (formData) => {
    if (!currentEmployee) return;

    // (Tạo payload cho việc SỬA - không bao gồm ten_dn, mat_khau)
    const payload = {
      ten_nv: formData.ten_nv,
      email: formData.email || null,
      sdt: formData.sdt || null,
      ngay_sinh: formData.ngay_sinh || null,
      // (Ghép địa chỉ)
      dia_chi: [formData.street, formData.selectedWard, formData.selectedDistrict, "Cần Thơ"].filter(Boolean).join(", ") || null,
    };

    try {
      const res = await employees.update(currentEmployee.id_nv, payload);
      const updatedEmployee = res.data?.data;

      setModalMode(null); // Đóng modal
      Swal.fire("Thành công!", "Cập nhật thông tin nhân viên thành công.", "success");

      // Cập nhật lại danh sách
      setEmployeeList(list => list.map(emp => 
        emp.id_nv === updatedEmployee.id_nv ? updatedEmployee : emp
      ));
      
    } catch (err) {
      console.error("Lỗi cập nhật nhân viên:", err);
      Swal.fire("Lỗi!", err.response?.data?.message || "Cập nhật thất bại.", "error");
      throw err;
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDeleteEmployee = (employee) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn sắp xóa nhân viên "${employee.ten_nv}" (Tên ĐN: ${employee.Account.ten_dn}). Tài khoản này sẽ bị xóa vĩnh viễn!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận xóa!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await employees.delete(employee.id_nv);
          Swal.fire("Đã xóa!", "Tài khoản nhân viên đã được xóa.", "success");
          // Lọc ra khỏi danh sách
          setEmployeeList(list => list.filter(emp => emp.id_nv !== employee.id_nv));
        } catch (err) {
          console.error("Lỗi xóa nhân viên:", err);
          Swal.fire("Lỗi!", err.response?.data?.message || "Xóa thất bại.", "error");
        }
      }
    });
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Nhân viên
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tài khoản và thông tin nhân viên trong hệ thống.
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentEmployee(null); // Đảm bảo không có data cũ
              setModalMode('add'); // Mở modal ở chế độ "Thêm"
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> Thêm nhân viên
          </button>
        </div>

        {/* Bảng dữ liệu */}
        {loading && (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full min-w-max">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Họ và Tên</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên đăng nhập</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số điện thoại</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-5 text-center text-gray-500">
                      Chưa có tài khoản nhân viên nào.
                    </td>
                  </tr>
                ) : (
                  employeeList.map((emp) => (
                    <tr key={emp.id_nv} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{emp.ten_nv}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">{emp.Account?.ten_dn}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">{emp.email || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-700">{emp.sdt || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* 💡 THÊM ONCLICK CHO NÚT SỬA */}
                          <button 
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-2 text-blue-600 hover:text-blue-800" 
                            title="Sửa"
                          >
                            <FaEdit />
                          </button>
                          {/* 💡 THÊM ONCLICK CHO NÚT XÓA */}
                          <button 
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-2 text-red-600 hover:text-red-800" 
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Render Modal (DÙNG CHUNG) */}
      <AddEmployeeModal
        isOpen={modalMode === 'add' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        onSubmit={modalMode === 'add' ? handleSubmitNewEmployee : handleSubmitEditEmployee}
        employeeData={currentEmployee} // Sẽ là null (cho "Thêm") hoặc object (cho "Sửa")
      />
    </>
  );
}