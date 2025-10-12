import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api",
  withCredentials: true, // rất quan trọng để gửi cookie refresh_token
});

// Gắn access token vào header trước khi gửi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Hàng đợi khi đang refresh
let refreshing = false;
let queue = [];
const flushQueue = (err, token) => {
  queue.forEach(p => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

// Tự refresh khi 401
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
        // Không cần body; BE đọc cookie httpOnly
        const { data } = await api.post("/auth/refresh");
        const newToken = data?.accessToken;
        if (!newToken) throw new Error("No accessToken from refresh");
        localStorage.setItem("access_token", newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        flushQueue(null, newToken);
        return api(original);
      } catch (e) {
        flushQueue(e, null);
        localStorage.removeItem("access_token");
        // Optional: điều hướng về /login
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
