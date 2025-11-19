import { Fragment, useEffect, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FaBell, FaBox, FaCalendarCheck, FaInfoCircle, FaCheckDouble } from 'react-icons/fa';
import { notifications } from '../api/api'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socket } from '../socket'; 
import { toast } from "react-toastify";

// --- 1. HÀM DỊCH TRẠNG THÁI ---
function translateMessage(message) {
  if (!message) return "";
  const statusMap = {
    'pending': 'Đang chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao hàng',
    'shipped': 'Đang vận chuyển',
    'completed': 'Hoàn thành',
    'done': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'canceled': 'Đã hủy',
    'paid': 'Đã thanh toán',
    'unpaid': 'Chưa thanh toán'
  };
  let translatedMsg = message;
  Object.keys(statusMap).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi'); 
    translatedMsg = translatedMsg.replace(regex, statusMap[key]);
  });
  return translatedMsg;
}

// --- 2. HÀM LÀM SẠCH NỘI DUNG (CỰC MẠNH) ---
function cleanContent(text) {
  if (!text) return "";
  return text
    .replace(/\(ID:\s*#?\d+\)/gi, "") // Xóa (ID: #15)
    .replace(/ID:\s*#?\d+/gi, "")      // Xóa ID: #15
    .replace(/#\d+/g, "")              // Xóa #15
    .replace(/\s\s+/g, " ")            // Xóa khoảng trắng thừa
    .trim();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
}

function getIcon(type, title) {
  const t = (type || "").toLowerCase();
  const text = (title || "").toLowerCase();
  if (t === 'order' || text.includes('đơn hàng') || text.includes('đặt hàng')) return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><FaBox /></div>;
  if (t === 'booking' || text.includes('đặt bàn') || text.includes('booking')) return <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><FaCalendarCheck /></div>;
  return <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><FaInfoCircle /></div>;
}

export default function NotificationBell() {
  const { user, fetchPoints } = useAuth();
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notifications.my(); 
      const data = res.data?.data || [];
      setList(data.slice(0, 10)); 
      const count = data.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const onNewNotification = (newNoti) => {
        // 1. Làm sạch và Dịch nội dung
        const finalTitle = cleanContent(newNoti.title);
        const finalMsg = cleanContent(translateMessage(newNoti.message));

        // 2. Hiển thị Toast (Dùng toastId để tránh trùng lặp)
        toast.info(
            <div>
                <p className="font-bold">{finalTitle}</p>
                <p className="text-xs">{finalMsg}</p>
            </div>,
            { 
              toastId: newNoti.id || new Date().getTime(), // Ngăn chặn trùng lặp
              autoClose: 4000
            }
        );

        // 3. Cập nhật danh sách (Sửa nội dung hiển thị trong list luôn)
        const cleanNoti = { ...newNoti, title: finalTitle, message: finalMsg };
        setList(prev => [cleanNoti, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);

        if (newNoti.type === "loyalty") fetchPoints();
      };

      socket.on('new_notification', onNewNotification);
      return () => socket.off('new_notification', onNewNotification);
    }
  }, [user, fetchPoints]);

  const handleMarkRead = async (id) => {
    try {
      await notifications.read(id);
      setList(prev => prev.map(n => (n.id === id || n.id_thong_bao === id) ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifications.readAll();
      setList(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  if (!user) return null;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className={`relative p-2 rounded-full transition-all outline-none ${open ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'}`}>
            <FaBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white dark:border-gray-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-3 w-80 sm:w-96 transform px-4 sm:px-0">
              <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black ring-opacity-5 bg-white dark:bg-[#1E1E1E] dark:ring-gray-700 border border-gray-100 dark:border-gray-700">
                
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#252525]">
                  <h3 className="font-bold text-gray-900 dark:text-white">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                      <FaCheckDouble /> Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {loading && <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>}
                  {!loading && list.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><FaBell /></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Bạn chưa có thông báo nào.</p>
                    </div>
                  )}

                  {!loading && list.map((item) => {
                    // Clean content trước khi render list
                    const displayTitle = cleanContent(item.title);
                    const displayMsg = cleanContent(translateMessage(item.message));

                    return (
                      <div 
                        key={item.id || item.id_thong_bao} 
                        className={`relative p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 group cursor-pointer ${!item.is_read ? 'bg-orange-50/60 dark:bg-orange-900/10' : ''}`}
                        onClick={() => !item.is_read && handleMarkRead(item.id || item.id_thong_bao)}
                      >
                        <div className="flex-shrink-0 pt-1">{getIcon(item.type, item.title)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-bold line-clamp-1 ${!item.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {displayTitle}
                            </p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 mt-0.5">{timeAgo(item.createdAt || item.ngay_tao)}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                            {displayMsg}
                          </p>
                        </div>
                        {!item.is_read && <div className="absolute top-1/2 right-3 transform -translate-y-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm"></div>}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-[#252525] border-t border-gray-100 dark:border-gray-700 text-center">
                  <Link to="/customer" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors block w-full">
                    Xem lịch sử đơn hàng
                  </Link>
                </div>

              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}