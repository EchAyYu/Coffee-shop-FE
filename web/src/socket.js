import { io } from "socket.io-client";

// Lấy URL của backend, giống như trong api.js
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// Khởi tạo socket
// autoConnect: false -> chúng ta sẽ kết nối thủ công khi user đăng nhập
const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true, // Gửi cookie (nếu cần cho xác thực)
});

// Gửi token qua auth (nếu middleware socket của bạn cần)
// socket.on("connect", () => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     socket.auth = { token: `Bearer ${token}` };
//   }
// });

export default socket;
