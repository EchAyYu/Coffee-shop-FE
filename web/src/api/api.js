// ================================
// ☕ Coffee Shop FE - API Service (PHIÊN BẢN HOÀN CHỈNH)
// ================================
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // gửi cookie refresh_token
  timeout: 10000, // 10 second timeout
});

console.log("🌐 API base:", BASE_URL);

// ===== Token helpers =====
export function setToken(token) {
  if (!token) return;
  localStorage.setItem("access_token", token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearToken() {
  localStorage.removeItem("access_token");
  delete api.defaults.headers.common.Authorization;
}

// ===== Request Interceptor (QUAN TRỌNG) =====
// Đảm bảo mọi request đều đính kèm token nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Auto Refresh on 401 =====
let refreshing = false;
let queue = [];
const flushQueue = (err, token) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/refresh");
      
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (refreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          });
      }
      original._retry = true;
      refreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data?.data?.accessToken || data?.accessToken;
        if (!newToken) throw new Error("No accessToken from refresh");
        setToken(newToken);
        flushQueue(null, newToken);
        return api(original);
      } catch (e) {
        console.error("Token refresh failed:", e);
        flushQueue(e, null);
        clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định";
    console.error("API Error:", errorMessage, { 
      status: error.response?.status, 
      url: error.config?.url 
    });
    // Dòng 81 (lỗi của bạn) là dòng "throw new Error" này
    throw new Error(errorMessage); 
  }
);

// =====================
// 🔹 AUTH
// =====================
export const register = (data) => api.post("/auth/register", data);

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  const token = res?.data?.data?.accessToken || res?.data?.accessToken;
  if (token) setToken(token);
  return res;
};

export const me = () => api.get("/auth/me");

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    clearToken();
  }
};

// =====================
// 🔹 CATEGORIES (Client & Admin)
// =====================
export const getCategories = () => api.get("/categories");
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// =====================
// 🔹 ORDERS (Client)
// =====================
export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders"); 
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// =====================
// 🔹 ADMIN ORDERS (Admin Dashboard)
// =====================
export const getOrdersAdmin = () => api.get("/admin/orders");

// 💡 💡 💡 === SỬA LỖI 500 (THIẾU /status) TẠI ĐÂY === 💡 💡 💡
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { trang_thai: status });
// 💡 💡 💡 ============================================ 💡 💡 💡
  
export const deleteOrderAdmin = (id) => api.delete(`/admin/orders/${id}`);

// =====================
// 🔹 PRODUCTS (Client & Admin)
// =====================
export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data); // (Hàm này đã được thêm lại)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// =====================
// 🔹 BOOKINGS, TABLES, CUSTOMERS, RESERVATIONS
// =====================
export const bookings = {
  list: (params) => api.get("/bookings", { params }),
  create: (data) => api.post("/bookings", data),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
};

export const reservations = {
  create: (data) => api.post("/reservations", data),
  my: () => api.get("/reservations/my"),
  list: () => api.get("/reservations"),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
};

export const tables = {
  list: (params) => api.get("/tables", { params }),
  getById: (id) => api.get(`/tables/${id}`),
  create: (data) => api.post("/tables", data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
  updateStatus: (id, trang_thai) => api.put(`/tables/${id}/status`, { trang_thai }),
};

export const customers = {
  getAll: () => api.get("/admin/customers"), 
  getMyInfo: () => api.get("/customers/me"),
  update: (data) => api.put("/customers/me", data),
};

// =====================
// 🔹 LOYALTY & VOUCHER (Client)
// =====================
export const vouchers = {
  catalog:  () => api.get("/vouchers/catalog"),
  my:       () => api.get("/vouchers/my"),
  redeem:   (voucher_id) => api.post("/vouchers/redeem", { voucher_id }),
  validate: (code, order_total) => api.post("/vouchers/validate", { code, order_total }),
};

export const loyalty = {
  myPoints: () => api.get("/loyalty/me/points"),
};

// =====================
// 🔹 NOTIFICATIONS (Client)
// =====================
export const notifications = {
  my:       (unread_only = false) => api.get(`/notifications/my?unread_only=${unread_only ? 1 : 0}`),
  read:     (id) => api.put(`/notifications/${id}/read`),
  readAll:  () => api.put("/notifications/read-all"),
};
export default api;