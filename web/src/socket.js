// ================================
// ☕ Coffee Shop FE - Socket.io Client (Sửa lỗi export)
// ================================
import { io } from "socket.io-client";

// URL của máy chủ Backend
const URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// 💡 1. EXPORT CONST (Named export), không dùng default
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true, // Rất quan trọng để gửi cookie (nếu BE cần)
});

// 💡 2. EXPORT HÀM connectSocket (Named export)
export const connectSocket = (id_tk) => {
  if (!socket.connected && id_tk) {
    console.log(`🔌 Đang kết nối socket cho user: ${id_tk}`);
    socket.connect();
    // Sau khi kết nối, gửi sự kiện 'join' để vào "phòng" của riêng mình
    socket.emit("join", id_tk);
  }
};

// 💡 3. EXPORT HÀM disconnectSocket (Named export)
export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("🔌 Ngắt kết nối socket.");
    socket.disconnect();
  }
};

