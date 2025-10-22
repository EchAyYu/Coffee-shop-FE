// ================================
// ☕ Coffee Shop FE - API Service
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

// ===== Request Interceptor =====
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
    
    // Log error for debugging
    console.error("API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !original._retry) {
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
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || "Không có quyền truy cập tài nguyên này";
      console.error("403 Forbidden:", errorMessage);
      throw new Error(errorMessage);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const errorMessage = error.response?.data?.message || "Không tìm thấy tài nguyên";
      console.error("404 Not Found:", errorMessage);
      throw new Error(errorMessage);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      const errorMessage = error.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại sau";
      console.error("Server Error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Handle network errors
    if (!error.response) {
      const errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      console.error("Network Error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định";
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
// 🔹 CATEGORIES
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
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status });
export const deleteOrderAdmin = (id) => api.delete(`/admin/orders/${id}`);

// =====================
// 🔹 PRODUCTS (from product.js)
// =====================
export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);
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
};

export const customers = {
  getAll: () => api.get("/admin/customers"), // Thêm hàm lấy tất cả khách hàng cho admin
  getMyInfo: () => api.get("/customers/me"),
  update: (data) => api.put("/customers/me", data),
};

// =====================
// 🔹 CONTENT MANAGEMENT
// =====================
export const getHomepageContent = () => api.get("/content/homepage");
export const updateHomepageContent = (data) => api.put("/content/homepage", data);


export default api;
