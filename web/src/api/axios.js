// ================================
// ☕ Coffee Shop FE - Axios Instance (final optimized)
// ================================
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// ✅ Tạo instance chính
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // rất quan trọng để gửi cookie refresh_token
});

// Gắn access token vào header trước khi gửi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===================================
// 🔁 Refresh Token Logic
// ===================================
let refreshing = false;
let queue = [];
const flushQueue = (err, token) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

// Intercept response 401 -> tự refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        // Gọi BE đọc cookie httpOnly refresh_token
        const { data } = await api.post("/auth/refresh");

        // ✅ BE trả { success: true, data: { accessToken } }
        const newToken = data?.data?.accessToken || data?.accessToken;
        if (!newToken) throw new Error("No accessToken returned from refresh");

        // Lưu token mới
        localStorage.setItem("access_token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        // Gửi lại các request bị pending
        flushQueue(null, newToken);

        // Retry request cũ
        return api(original);
      } catch (e) {
        console.error("[Axios Refresh Error]", e);
        flushQueue(e, null);
        localStorage.removeItem("access_token");
        // Optional: window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default api;