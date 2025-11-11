// src/components/admin/OrderDetailModal.jsx
import { Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';

// --- Helper Functions (Copy từ AdminOrders.jsx) ---
const STATUS_MAP = {
  pending: { label: "Đang xử lý", colorClass: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", colorClass: "bg-blue-100 text-blue-800" },
  paid: { label: "Đã thanh toán", colorClass: "bg-cyan-100 text-cyan-800" },
  shipped: { label: "Đang giao", colorClass: "bg-purple-100 text-purple-800" },
  done: { label: "Hoàn thành", colorClass: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", colorClass: "bg-red-100 text-red-800" },
};

const getStatusLabel = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.label || "Không rõ";
};

const getStatusStyles = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'pending';
  return STATUS_MAP[key]?.colorClass || "bg-gray-100 text-gray-800";
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' && typeof amount !== 'string') return "0 ₫";
  // Chuyển đổi sang số để đảm bảo tính toán đúng
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "0 ₫";
  return numAmount.toLocaleString('vi-VN') + ' ₫';
};

// --- Component Chính Của Modal ---
export default function OrderDetailModal({ isOpen, onClose, order }) {
  
  // Hiển thị loading (khi 'order' chưa được load)
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-700">Đang tải chi tiết đơn hàng...</span>
    </div>
  );

  // Hiển thị nội dung chi tiết
  const renderContent = () => (
    <div className="space-y-6 p-1">
      {/* Phần Header: ID, Trạng thái */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Chi tiết Đơn hàng #{order.id_don}
        </h3>
        <div className="flex items-center gap-4 mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(order.trang_thai)}`}>
            {getStatusLabel(order.trang_thai)}
          </span>
          <span className="text-sm text-gray-600">
            Ngày đặt: {new Date(order.ngay_dat).toLocaleString('vi-VN')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1: Thông tin người nhận */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Thông tin người nhận
          </h4>
          <div className="text-sm space-y-2">
            <p><strong>Khách hàng:</strong> {order.ho_ten_nhan}</p>
            <p><strong>Số điện thoại:</strong> {order.sdt_nhan}</p>
            <p><strong>Email:</strong> {order.email_nhan || "Không cung cấp"}</p>
            <p><strong>Địa chỉ nhận:</strong> {order.dia_chi_nhan}</p>
            <p><strong>Ghi chú:</strong> {order.ghi_chu || "Không có"}</p>
          </div>
        </div>

        {/* Cột 2: Thông tin thanh toán & Khách hàng (nếu có) */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Thanh toán & Tài khoản
          </h4>
          <div className="text-sm space-y-2">
            <p><strong>Hình thức:</strong> {order.pttt === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
            <p><strong>Tổng tiền:</strong> <span className="text-lg font-bold text-red-600">{formatCurrency(order.tong_tien)}</span></p>
            
            {order.Customer && (
              <>
                <p className="border-t pt-2 mt-2 font-medium">Thông tin tài khoản (nếu có):</p>
                <p><strong>Tên tài khoản:</strong> {order.Customer.ho_ten}</p>
                <p><strong>Email tài khoản:</strong> {order.Customer.email}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Phần 3: Danh sách sản phẩm */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
          Danh sách sản phẩm
        </h4>
        <div className="overflow-x-auto max-h-60 border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-2 text-center font-medium">Số lượng</th>
                <th className="px-4 py-2 text-right font-medium">Đơn giá</th>
                <th className="px-4 py-2 text-right font-medium">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.OrderDetails?.map((item) => (
                <tr key={item.id_ct}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.Product?.anh || 'https://via.placeholder.com/50'} 
                        alt={item.Product?.ten_mon}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="font-medium">{item.Product?.ten_mon || "Không rõ"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">x{item.so_luong}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.gia)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.gia * item.so_luong)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                
                {/* Nội dung sẽ render ở đây */}
                {/* Nếu 'order' có dữ liệu, hiển thị nội dung. Nếu không, hiển thị loading. */}
                {!order ? renderLoading() : renderContent()}
                
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