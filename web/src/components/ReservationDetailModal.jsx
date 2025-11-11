// src/components/admin/ReservationDetailModal.jsx
import { Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';

// --- Helper Functions (Copy từ AdminOrders.jsx) ---
const STATUS_MAP = {
  pending: { label: "Đang chờ", colorClass: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", colorClass: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", colorClass: "bg-red-100 text-red-800" },
  done: { label: "Hoàn thành", colorClass: "bg-blue-100 text-blue-800" },
};

const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.label || "Không rõ";
};

const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.colorClass || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('vi-VN');
}

// --- Component Chính Của Modal ---
export default function ReservationDetailModal({ isOpen, onClose, reservation }) {
  
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-700">Đang tải chi tiết...</span>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6 p-1">
      {/* Phần Header: ID, Trạng thái */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Chi tiết Đặt bàn #{reservation.id_datban}
        </h3>
        <div className="flex items-center gap-4 mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(reservation.trang_thai)}`}>
            {getStatusLabel(reservation.trang_thai)}
          </span>
          <span className="text-sm text-gray-600">
            Đặt ngày: {formatDate(reservation.ngay_dat)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1: Thông tin người đặt */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Thông tin người đặt
          </h4>
          <div className="text-sm space-y-2">
            <p><strong>Tên liên hệ:</strong> {reservation.ho_ten}</p>
            <p><strong>Số điện thoại:</strong> {reservation.sdt}</p>
            <p><strong>Số người:</strong> {reservation.so_nguoi}</p>
            <p><strong>Giờ dự kiến:</strong> {reservation.gio_dat || "Không cụ thể"}</p>
            <p><strong>Ghi chú:</strong> {reservation.ghi_chu || "Không có"}</p>
          </div>
        </div>

        {/* Cột 2: Thông tin tài khoản & Bàn */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Tài khoản & Thông tin bàn
          </h4>
          <div className="text-sm space-y-2">
            {reservation.Customer ? (
              <>
                <p><strong>Tên tài khoản:</strong> {reservation.Customer.ho_ten}</p>
                <p><strong>Email:</strong> {reservation.Customer.email}</p>
                <p><strong>Điểm tích lũy:</strong> {reservation.Customer.diem || 0}</p>
              </>
            ) : (
              <p>Khách vãng lai (hoặc lỗi)</p>
            )}
            
            <div className="border-t pt-2 mt-2">
              {reservation.Table ? (
                <>
                  <p><strong>Bàn đã đặt:</strong> {reservation.Table.ten_ban || reservation.Table.so_ban}</p>
                  <p><strong>Khu vực:</strong> {reservation.Table.khu_vuc}</p>
                  <p><strong>Sức chứa:</strong> {reservation.Table.suc_chua} người</p>
                </>
              ) : (
                <p className="text-red-600"><strong>Chưa gán bàn!</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {!reservation ? renderLoading() : renderContent()}
                
                <div className="mt-6 text-right">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}