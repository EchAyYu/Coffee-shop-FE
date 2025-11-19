import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaCalendarAlt, FaTimes, FaClock } from 'react-icons/fa';
import { reservations } from '../api/api';

// Giả định thời gian ăn là 2 tiếng (để hiển thị khoảng giờ bận)
const DURATION_HOURS = 2;

export default function TableScheduleModal({ isOpen, onClose, table }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset ngày về hôm nay mỗi khi mở modal cho bàn mới
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, table]);

  // Gọi API khi ngày hoặc bàn thay đổi
  useEffect(() => {
    if (isOpen && table && date) {
      const fetchSlots = async () => {
        setLoading(true);
        try {
          const res = await reservations.getBusySlots(table.id_ban, date);
          setBusySlots(res.data?.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    }
  }, [isOpen, table, date]);

  // Helper: Tính giờ kết thúc (Giờ bắt đầu + 2 tiếng)
  const getEndTime = (startTime) => {
    const [h, m] = startTime.split(':').map(Number);
    let endH = h + DURATION_HOURS;
    // Format lại thành HH:mm
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  if (!table) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1E1E1E] p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-white">
                    Lịch bàn: <span className="text-orange-600">{table.ten_ban || `Số ${table.so_ban}`}</span>
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Chọn ngày */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chọn ngày xem:</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400"/>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Danh sách giờ bận */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaClock /> Các khung giờ đã kín:
                  </h4>
                  
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Đang tải dữ liệu...</div>
                  ) : busySlots.length === 0 ? (
                    <div className="text-center py-6 text-green-600 dark:text-green-400 font-medium">
                      🎉 Bàn còn trống cả ngày!
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {busySlots.map((time, index) => (
                        <div key={index} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-center text-sm font-semibold border border-red-100 dark:border-red-800/30">
                          {time} - {getEndTime(time)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-4 italic text-center">
                    *Mỗi lượt đặt bàn kéo dài khoảng 2 giờ.
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
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