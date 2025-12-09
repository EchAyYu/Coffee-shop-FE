// src/api/adminApi.js
// ================================
// ☕ Coffee Shop FE - ADMIN API Service (TÁCH BIỆT - PHIÊN BẢN ĐẦY ĐỦ + THỐNG KÊ + EXPORT)
// ================================
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
const ADMIN_TOKEN_KEY = "admin_access_token";

const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

console.log("🔑 ADMIN API base:", BASE_URL);

// ===== Token helpers =====
export function setAdminToken(token) {
  if (!token) return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
}
export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  delete adminApi.defaults.headers.common.Authorization;
}

// ===== Request Interceptor =====
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Auto Refresh on 401 =====
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
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (adminRefreshing) {
        return new Promise((resolve, reject) =>
          adminQueue.push({ resolve, reject })
        ).then((token) => {
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
        if (typeof window !== "undefined") {
          window.location.href = "/admin";
        }
        return Promise.reject(e);
      } finally {
        adminRefreshing = false;
      }
    }
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đã xảy ra lỗi không xác định";
    throw new Error(errorMessage);
  }
);

// =====================
// 🔹 ADMIN AUTH
// =====================
export const adminLogin = async (ten_dn, mat_khau) => {
  const res = await adminApi.post("/auth/login", { ten_dn, mat_khau });
  const token = res?.data?.data?.accessToken || res?.data?.accessToken;
  if (token) setAdminToken(token);
  return res;
};
export const adminMe = () => adminApi.get("/auth/me");
export const adminLogout = async () => {
  try {
    await adminApi.post("/auth/logout");
  } finally {
    clearAdminToken();
  }
};

// =====================
// 🔹 CATEGORIES / PRODUCTS
// =====================
export const getCategories = () => adminApi.get("/categories");
export const createCategory = (data) => adminApi.post("/categories", data);
export const updateCategory = (id, data) =>
  adminApi.put(`/categories/${id}`, data);
export const deleteCategory = (id) => adminApi.delete(`/categories/${id}`);

export const getProducts = (params) =>
  adminApi.get("/products", { params });
export const getProductById = (id) => adminApi.get(`/products/${id}`);
export const createProduct = (data) => adminApi.post("/products", data);
export const updateProduct = (id, data) =>
  adminApi.put(`/products/${id}`, data);
export const deleteProduct = (id) => adminApi.delete(`/products/${id}`);

// =====================
// 🔹 ORDERS (Admin)
// =====================

// Danh sách đơn hàng admin
export const getOrdersAdmin = (params) => adminApi.get("/admin/orders", { params });

// Chi tiết đơn cho admin
export const getOrderDetailAdmin = (id) =>
  adminApi.get(`/admin/orders/${id}`);

// ✅ Cập nhật trạng thái đơn hàng: khớp với BE: PUT /admin/orders/:id/status
export const updateOrderStatus = (id, trang_thai) =>
  adminApi.put(`/admin/orders/${id}/status`, { trang_thai });

// Xóa đơn hàng
export const deleteOrderAdmin = (id) =>
  adminApi.delete(`/admin/orders/${id}`);

// 🔹 Thống kê đơn hàng theo tuần/tháng
// BE: GET /api/admin/orders-stats?period=week|month
export const getAdminOrderStats = (params) =>
  adminApi.get("/admin/orders-stats", { params });

// 🔹 Export đơn hàng (CSV mở bằng Excel)
// BE: GET /api/admin/orders/export?period=week|month
export const exportAdminOrders = ({ period }) =>
  adminApi.get("/admin/orders/export", {
    params: { period },
    responseType: "blob",
  });

// =====================
// 🔹 RESERVATIONS (Admin)
// =====================
export const reservations = {
  create: (data) => adminApi.post("/reservations", data),
  my: () => adminApi.get("/reservations/my"),

  // list/update/delete/getById vẫn dùng /reservations như cũ
  list: (params) => adminApi.get("/reservations", { params }), 
  getById: (id) => adminApi.get(`/reservations/${id}`),
  update: (id, data) => adminApi.put(`/reservations/${id}`, data),
  delete: (id) => adminApi.delete(`/reservations/${id}`),

  // 🔹 Thống kê đặt bàn cho Admin
  stats: (params) => adminApi.get("/admin/reservations/stats", { params }),

  // 🔹 MỚI: Export đặt bàn (CSV)
  export: ({ period }) =>
    adminApi.get("/admin/reservations/export", {
      params: { period },
      responseType: "blob",
    }),
};

// =====================
// 🔹 TABLES / CUSTOMERS / VOUCHERS / etc.
// =====================
export const tables = {
  list: (params) => adminApi.get("/tables", { params }),
  getById: (id) => adminApi.get(`/tables/${id}`),
  create: (data) => adminApi.post("/tables", data),
  update: (id, data) => adminApi.put(`/tables/${id}`, data),
  delete: (id) => adminApi.delete(`/tables/${id}`),
  updateStatus: (id, trang_thai) =>
    adminApi.put(`/tables/${id}/status`, { trang_thai }),
};

export const customers = {
  getAll: (params) => adminApi.get("/admin/customers", { params }),
  getById: (id) => adminApi.get(`/admin/customers/${id}`),
  delete: (id) => adminApi.delete(`/admin/customers/${id}`),
  getMyInfo: () => adminApi.get("/customers/me"),
  update: (data) => adminApi.put("/customers/me", data),
};

export const bookings = {
  list: (params) => adminApi.get("/bookings", { params }),
  create: (data) => adminApi.post("/bookings", data),
  getById: (id) => adminApi.get(`/bookings/${id}`),
  update: (id, data) => adminApi.put(`/bookings/${id}`, data),
};

export const vouchersAdmin = {
  getAll: () => adminApi.get("/admin/vouchers"),
  create: (data) => adminApi.post("/admin/vouchers", data),
  update: (id, data) => adminApi.put(`/admin/vouchers/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/vouchers/${id}`),
};

export const loyalty = {
  myPoints: () => adminApi.get("/loyalty/me/points"),
};

export const notifications = {
  my: (unread_only = false) =>
    adminApi.get(`/notifications/my?unread_only=${unread_only ? 1 : 0}`),
  read: (id) => adminApi.put(`/notifications/${id}/read`),
  readAll: () => adminApi.put("/notifications/read-all"),
};

export const getAllReviews = (params) =>
  adminApi.get("/admin/reviews", { params });
export const replyToReview = (id_danh_gia, noi_dung) =>
  adminApi.post(`/admin/reviews/${id_danh_gia}/reply`, { noi_dung });
export const deleteReview = (id_danh_gia) =>
  adminApi.delete(`/admin/reviews/${id_danh_gia}`);

// =====================
// 🔹 ADMIN DASHBOARD
// =====================
export const getAdminStats = () => adminApi.get("/admin/stats");

export const employees = {
  list: () => adminApi.get("/employees"),
  create: (data) => adminApi.post("/employees", data),
  update: (id, data) => adminApi.put(`/employees/${id}`, data),
  delete: (id) => adminApi.delete(`/employees/${id}`),
};

// =====================
// 🔹 UPLOAD IMAGE
// =====================
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await adminApi.post("/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });
  return res.data;
};

// =====================
// 🔹 PROMOTIONS (Admin)
// =====================
export const adminPromotions = {
  getAll: (params) => adminApi.get("/admin/promotions", { params }),
  create: (data) => adminApi.post("/admin/promotions", data),
  update: (id, data) => adminApi.put(`/admin/promotions/${id}`, data),
  delete: (id) => adminApi.delete(`/admin/promotions/${id}`),
};

export const getAdminPromotions = (params) =>
  adminPromotions.getAll(params);
export const createAdminPromotion = (data) =>
  adminPromotions.create(data);
export const updateAdminPromotion = (id, data) =>
  adminPromotions.update(id, data);
export const deleteAdminPromotion = (id) =>
  adminPromotions.delete(id);

export default adminApi;
