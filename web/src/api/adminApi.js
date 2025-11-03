// ================================
// ☕ Coffee Shop FE - ADMIN API Service (TÁCH BIỆT - PHIÊN BẢN ĐẦY ĐỦ)
// ================================
import axios from "axios";

// Vẫn dùng chung BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const ADMIN_TOKEN_KEY = "admin_access_token"; // Key LƯU TRỮ MỚI

const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

console.log("🔑 ADMIN API base:", BASE_URL);

// ===== Token helpers (RIÊNG BIỆT) =====
export function setAdminToken(token) {
  if (!token) return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  delete adminApi.defaults.headers.common.Authorization;
}

// ===== Request Interceptor (RIÊNG BIỆT) =====
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY); // Lấy token của admin
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Auto Refresh on 401 (RIÊNG BIỆT) =====
let adminRefreshing = false;
let adminQueue = [];
const flushAdminQueue = (err, token) => {
  adminQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  adminQueue = [];
};

adminApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const isAuthEndpoint = original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh");
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (adminRefreshing) {
        return new Promise((resolve, reject) => adminQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
            return adminApi(original);
          });
      }
      original._retry = true;
      adminRefreshing = true;
      try {
        const { data } = await adminApi.post("/auth/refresh"); 
        const newToken = data?.data?.accessToken || data?.accessToken;
        if (!newToken) throw new Error("No accessToken from refresh");
        setAdminToken(newToken); 
        flushAdminQueue(null, newToken);
        return adminApi(original);
      } catch (e) {
        console.error("Admin Token refresh failed:", e);
        flushAdminQueue(e, null);
        clearAdminToken(); 
        if (typeof window !== 'undefined') {
          window.location.href = "/admin"; // Redirect về trang login admin
        }
        return Promise.reject(e);
      } finally {
        adminRefreshing = false;
      }
    }
    const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi không xác định";
    throw new Error(errorMessage);
  }
);

// =====================
// 🔹 ADMIN AUTH (Sử dụng adminApi)
// =====================
export const adminLogin = async (data) => {
  const res = await adminApi.post("/auth/login", data);
  const token = res?.data?.data?.accessToken || res?.data?.accessToken;
  if (token) setAdminToken(token); // Dùng hàm set token của Admin
  return res;
};
export const adminMe = () => adminApi.get("/auth/me");
export const adminLogout = async () => {
  try {
    await adminApi.post("/auth/logout");
  } finally {
    clearAdminToken(); // Dùng hàm clear token của Admin
  }
};

// =====================
// 🔹 CÁC API KHÁC (Sử dụng adminApi)
// =====================

// (Các hàm này không cần export object)
export const getCategories = () => adminApi.get("/categories");
export const createCategory = (data) => adminApi.post("/categories", data);
export const updateCategory = (id, data) => adminApi.put(`/categories/${id}`, data);
export const deleteCategory = (id) => adminApi.delete(`/categories/${id}`);

export const getProducts = (params) => adminApi.get("/products", { params });
export const getProductById = (id) => adminApi.get(`/products/${id}`);
export const createProduct = (data) => adminApi.post("/products", data);
export const updateProduct = (id, data) => adminApi.put(`/products/${id}`, data);
export const deleteProduct = (id) => adminApi.delete(`/products/${id}`);

// (Các hàm này cho AdminOrders.jsx)
export const getOrdersAdmin = () => adminApi.get("/admin/orders");
export const updateOrderStatus = (id, status) =>
  adminApi.put(`/admin/orders/${id}/status`, { trang_thai: status });
export const deleteOrderAdmin = (id) => adminApi.delete(`/admin/orders/${id}`);

// 💡 EXPORT OBJECTS (Giống như api.js gốc của bạn)

export const reservations = {
  create: (data) => adminApi.post("/reservations", data),
  my: () => adminApi.get("/reservations/my"),
  list: () => adminApi.get("/reservations"), // <- AdminReservations dùng cái này
  update: (id, data) => adminApi.put(`/reservations/${id}`, data), // <- AdminReservations dùng cái này
  delete: (id) => adminApi.delete(`/reservations/${id}`),
};

export const tables = {
  list: (params) => adminApi.get("/tables", { params }),
  getById: (id) => adminApi.get(`/tables/${id}`),
  create: (data) => adminApi.post("/tables", data),
  update: (id, data) => adminApi.put(`/tables/${id}`, data),
  delete: (id) => adminApi.delete(`/tables/${id}`),
  updateStatus: (id, trang_thai) => adminApi.put(`/tables/${id}/status`, { trang_thai }),
};

export const customers = {
  getAll: (params) => adminApi.get("/admin/customers", { params }), // <- AdminCustomers dùng cái này
  getMyInfo: () => adminApi.get("/customers/me"),
  update: (data) => adminApi.put("/customers/me", data),
  // (Thêm hàm delete nếu bạn cần)
  // delete: (id) => adminApi.delete(`/admin/customers/${id}`), 
};

// (Các API khác giữ nguyên)
export const bookings = {
  list: (params) => adminApi.get("/bookings", { params }),
  create: (data) => adminApi.post("/bookings", data),
  getById: (id) => adminApi.get(`/bookings/${id}`),
  update: (id, data) => adminApi.put(`/bookings/${id}`, data),
};

export const vouchers = {
  catalog:  () => adminApi.get("/vouchers/catalog"),
  my:       () => adminApi.get("/vouchers/my"),
  redeem:   (voucher_id) => adminApi.post("/vouchers/redeem", { voucher_id }),
  validate: (code, order_total) => adminApi.post("/vouchers/validate", { code, order_total }),
};

export const loyalty = {
  myPoints: () => adminApi.get("/loyalty/me/points"),
};

export const notifications = {
  my:       (unread_only = false) => adminApi.get(`/notifications/my?unread_only=${unread_only ? 1 : 0}`),
  read:     (id) => adminApi.put(`/notifications/${id}/read`),
  readAll:  () => adminApi.put("/notifications/read-all"),
};

export default adminApi;

