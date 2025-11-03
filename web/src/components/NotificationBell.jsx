import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { notifications as notiApi } from "../api/api";
import { socket } from "../socket.js"; // Chỉ import {socket}, không import connect/disconnect
import { toast } from "react-toastify";

// Hàm helper để định dạng thời gian (ví dụ: "5 phút trước")
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
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


export default function NotificationBell() {
  const { user, fetchPoints } = useAuth(); // Lấy user và hàm fetchPoints
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Fetch thông báo ban đầu và đếm số thông báo chưa đọc
  const fetchNotifications = async (showUnreadCount = true) => {
    if (!user) return;
    try {
      const res = await notiApi.my(false); // Lấy tất cả (đã đọc và chưa đọc)
      const data = res.data?.data || [];
      setNotifications(data.slice(0, 10)); // Chỉ hiển thị 10
      
      if (showUnreadCount) {
        // Sửa logic đếm: 'is_read' thay vì 'read_at' (dựa theo model BE)
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Lỗi fetch thông báo:", err);
    }
  };

  // 2. Lắng nghe Socket.IO
  useEffect(() => {
    // 💡 ĐÃ XÓA LOGIC socket.connect() VÀ socket.emit()
    // 💡 App.jsx đã xử lý việc kết nối này

    // Lắng nghe event 'new_notification'
    function onNewNotification(newNoti) {
      console.log("SOCKET: Nhận được thông báo mới!", newNoti);
      
      // Cập nhật state
      setNotifications(prev => [newNoti, ...prev.slice(0, 9)]); // Thêm vào đầu, giữ 10
      setUnreadCount(prev => prev + 1);
      
      // Hiển thị toast
      toast.info(<span>🔔 <b>{newNoti.title}</b><br/>{newNoti.message}</span>);
      
      // 🌟 QUAN TRỌNG: CẬP NHẬT ĐIỂM NẾU LÀ NOTI TÍCH ĐIỂM 🌟
      if (newNoti.type === "loyalty") {
        fetchPoints(); // Gọi hàm từ AuthContext
      }
    }

    // Chỉ lắng nghe khi có user
    if (user?.id_tk) {
      socket.on("new_notification", onNewNotification);
      
      // Lấy thông báo ban đầu
      fetchNotifications();
    }

    // Cleanup:
    return () => {
      socket.off("new_notification", onNewNotification);
      // 💡 KHÔNG ngắt kết nối ở đây, App.jsx sẽ xử lý
    };
  }, [user, fetchPoints]); // Thêm fetchPoints vào dependency array

  // 3. Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  // 4. Xử lý khi nhấn nút "Đánh dấu đã đọc"
  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notiApi.readAll(); // API này sẽ set is_read = true cho tất cả
      setUnreadCount(0);
      // Cập nhật UI
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  if (!user) return null; // Không hiển thị gì nếu chưa đăng nhập

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút chuông */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative px-3 py-2 border rounded-xl hover:bg-neutral-50"
      >
        🔔
        {/* Chấm đỏ thông báo mới */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">
                Không có thông báo nào.
              </p>
            )}
            {notifications.map((noti) => (
              <div
                // 💡 Sửa: Dùng (noti.id || noti.id_thong_bao) làm key
                key={noti.id || noti.id_thong_bao}
                // 💡 Sửa: Dùng !noti.is_read
                className={`p-3 border-b hover:bg-gray-50 ${!noti.is_read ? 'bg-blue-50' : ''}`}
              >
                <p className="font-semibold text-gray-800 text-sm">{noti.title}</p>
                <p className="text-gray-600 text-sm mb-1">{noti.message}</p>
                <p className="text-gray-400 text-xs">{timeAgo(noti.createdAt || noti.created_at)}</p>
              </div>
            ))}
          </div>
          
          <div className="p-2 bg-gray-50 rounded-b-lg text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Xem tất cả
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

