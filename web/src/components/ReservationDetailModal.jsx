import { Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

// --- Helper Functions ---

// 1. MAP CHO TRẠNG THÁI ĐẶT BÀN (Reservation)
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

// 💡💡💡 2. MAP MỚI CHO TRẠNG THÁI ĐƠN HÀNG (Order) 💡💡💡
const ORDER_STATUS_MAP = {
  pending: { label: "Đang chờ (món)", color: "bg-yellow-100 text-yellow-800" },
  pending_payment: { label: "Chờ thanh toán", color: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Đã xác nhận (món)", color: "bg-green-100 text-green-800" },
  completed: { label: "Hoàn thành (món)", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy (món)", color: "bg-red-100 text-red-800" },
  done: { label: "Hoàn thành (món)", color: "bg-green-100 text-green-800" },
  paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
  shipped: { label: "Đang giao", color: "bg-blue-100 text-blue-800" },
  preorder: { label: "Chờ xử lý (đặt trước)", color: "bg-purple-100 text-purple-800" },
  default: { label: "Không rõ", color: "bg-gray-100 text-gray-800" }
};

// 💡 Hàm helper mới cho trạng thái đơn hàng
const getOrderStatusDisplay = (statusKey) => {
  const key = statusKey?.toLowerCase() || 'default';
  return ORDER_STATUS_MAP[key] || ORDER_STATUS_MAP.default;
};
// 💡💡💡 KẾT THÚC KHU VỰC MỚI 💡💡💡

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('vi-VN');
}

const formatCurrency = (amount) => {
  if (typeof amount === 'undefined' || amount === null) return "N/A";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// --- Component Chính Của Modal ---
export default function ReservationDetailModal({ isOpen, onClose, reservation }) {
  
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-700">Đang tải chi tiết...</span>
    </div>
  );

  // 💡 TÁCH PHẦN NỘI DUNG ĐẶT MÓN RA RIÊNG
  const renderPreOrderItems = () => {
    // Dữ liệu sẽ nằm trong reservation.PreOrder (khớp với 'as' ở BE)
    const order = reservation.PreOrder;

    if (!order || !order.OrderDetails || order.OrderDetails.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          Khách không đặt món trước.
        </div>
      );
    }

    // 💡 SỬ DỤNG HÀM HELPER MỚI
    const orderStatus = getOrderStatusDisplay(order.trang_thai);

    return (
      <div className="space-y-3">
        <ul className="divide-y divide-gray-200">
          {order.OrderDetails.map((item) => (
            <li key={item.id_ct} className="flex py-3">
              <img 
                // Sử dụng ảnh placeholder nếu không có ảnh (vì chúng ta đã bỏ hinh_anh)
                src={item.Product?.hinh_anh || 'https://via.placeholder.com/50'} 
                alt={item.Product?.ten_mon}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.Product?.ten_mon || 'Sản phẩm không rõ'}</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(item.gia)} x {item.so_luong}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(item.gia * item.so_luong)}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 text-right">
          <p className="text-sm text-gray-600">Tổng tiền hàng:</p>
          <p className="text-lg font-bold text-red-700">
            {formatCurrency(order.tong_tien)}
          </p>
          
          {/* 💡💡💡 ĐÂY LÀ DÒNG ĐÃ ĐƯỢC VIỆT HÓA 💡💡💡 */}
          <span className={`text-xs px-2 py-0.5 ${orderStatus.color} rounded-full font-medium`}>
            Trạng thái đơn: {orderStatus.label}
          </span>
          {/* 💡💡💡 KẾT THÚC SỬA 💡💡💡 */}

        </div>
      </div>
    );
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Thông tin người đặt & Bàn */}
        <div className="lg:col-span-1 space-y-6">
          {/* Thông tin người đặt */}
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
        
          {/* Thông tin tài khoản & Bàn */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Tài khoản & Bàn
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

  	 	 {/* CỘT 2: MÓN ĂN ĐẶT TRƯỚC */}
  	 	 <div className="lg:col-span-2 space-y-4">
  	 	   <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5 text-gray-600"/>
  	 	 	 Món ăn đặt trước
  	 	   </h4>
  	 	   <div className="text-sm space-y-2">
            {renderPreOrderItems()}
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
  			   {/* SỬ DỤNG MAX-W-4XL ĐỂ MODAL RỘNG HƠN */}
  			   <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
  				 
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