// src/socket.js
// --- PHIÊN BẢN SỬA LỖI 'Invalid namespace' ---

import { io } from "socket.io-client";

// 💡 SỬA LỖI TẠI ĐÂY:
// Chúng ta kết nối đến HOST của Backend, KHÔNG phải đường dẫn API.
// Xóa '/api' khỏi URL kết nối.
const URL = (import.meta.env.VITE_API_BASE || "http://localhost:4000/api")
            .replace("/api", ""); // Xóa "/api"

// URL bây giờ sẽ là "http://localhost:4000" (chính xác)

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true, // Rất quan trọng
});

export const connectSocket = (id_tk) => {
  if (!socket.connected && id_tk) {
    console.log(`🔌 Đang kết nối socket đến ${URL} cho user: ${id_tk}`);
    socket.connect();
    
    // Chúng ta sẽ gửi 'join' sau khi 'connect' thành công
    // (Xem file App.jsx tôi gửi trước đó)
    // socket.emit("join", id_tk); // Tạm thời di chuyển logic này
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("🔌 Ngắt kết nối socket.");
    socket.disconnect();
  }
};