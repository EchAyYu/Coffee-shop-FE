// ================================
// ☕ Coffee Shop FE - Axios Instance (final)
// ================================
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // gửi cookie refresh_token
});

// Gắn token từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===================================
// 🔁 Refresh Token Auto-Handler
// ===================================
let refreshing = false;
let queue = [];

const flushQueue = (err, token) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

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
        const { data } = await api.post("/auth/refresh");
        const newToken = data?.data?.accessToken || data?.accessToken;
        if (!newToken) throw new Error("Không nhận được token mới");

        localStorage.setItem("access_token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        flushQueue(null, newToken);
        return api(original);
      } catch (err) {
        flushQueue(err, null);
        localStorage.removeItem("access_token");
        console.error("[Refresh Token Error]", err);
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
