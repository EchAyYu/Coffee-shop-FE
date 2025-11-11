// src/components/admin/CustomerDetailModal.jsx
import { Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { User, Mail, Phone, MapPin, Key, Star } from 'lucide-react';

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-1 text-gray-500">{icon}</span>
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || "Chưa cung cấp"}</dd>
    </div>
  </div>
);

export default function CustomerDetailModal({ isOpen, onClose, customer }) {
  
  const renderLoading = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-700">Đang tải chi tiết...</span>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <img 
            className="h-16 w-16 rounded-full object-cover" 
            src={customer.anh || `https://ui-avatars.com/api/?name=${customer.ho_ten}&background=random`} 
            alt={customer.ho_ten} 
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {customer.ho_ten || "Khách hàng"}
          </h3>
          <p className="text-sm text-gray-600">ID Khách hàng: <span className="font-mono">#{customer.id_kh}</span></p>
        </div>
      </div>

      {/* Grid thông tin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Cột 1: Thông tin cá nhân */}
        <dl className="space-y-4">
          <DetailItem icon={<Mail size={16}/>} label="Email" value={customer.email} />
          <DetailItem icon={<Phone size={16}/>} label="Số điện thoại" value={customer.sdt} />
          <DetailItem icon={<MapPin size={16}/>} label="Địa chỉ" value={customer.dia_chi} />
          <DetailItem icon={<MapPin size={16}/>} label="Tỉnh/Thành" value={customer.province} />
        </dl>
        
        {/* Cột 2: Thông tin tài khoản */}
        <dl className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <DetailItem icon={<Key size={16}/>} label="Tên đăng nhập" value={customer.Account?.ten_dn} />
          <DetailItem icon={<User size={16}/>} label="ID Tài khoản" value={`#${customer.Account?.id_tk}`} />
          <DetailItem icon={<Star size={16}/>} label="Điểm tích lũy" value={customer.diem || 0} />
          <DetailItem 
            icon={<User size={16}/>} 
            label="Vai trò" 
            value={customer.Account?.role.toUpperCase()} 
          />
        </dl>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {!customer ? renderLoading() : renderContent()}
                
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