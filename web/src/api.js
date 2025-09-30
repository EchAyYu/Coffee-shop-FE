import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // đổi nếu backend chạy port khác
});

//
// 🔹 AUTH
//
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

//
// 🔹 PRODUCTS
//
export const getProducts = (params) => api.get("/products", { params }); // lấy ds sản phẩm, có thể lọc theo category, q
export const getProductById = (id) => api.get(`/products/${id}`);        // lấy 1 sản phẩm
export const createProduct = (data) => api.post("/products", data);      // thêm sản phẩm
export const updateProduct = (id, data) => api.put(`/products/${id}`, data); // cập nhật sản phẩm
export const deleteProduct = (id) => api.delete(`/products/${id}`);      // xóa sản phẩm

//
// 🔹 CATEGORIES
//
export const getCategories = () => api.get("/categories");               // lấy ds danh mục
export const getCategoryById = (id) => api.get(`/categories/${id}`);     // lấy 1 danh mục
export const createCategory = (data) => api.post("/categories", data);   // thêm danh mục
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data); // cập nhật danh mục
export const deleteCategory = (id) => api.delete(`/categories/${id}`);   // xóa danh mục

//
// 🔹 ORDERS
//
export const createOrder = (data) => api.post("/orders", data);          // tạo đơn hàng
export const getOrders = () => api.get("/orders");                       // (sẽ dùng cho Admin)
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

//
// 🔹 CUSTOMERS
//
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const getCustomers = () => api.get("/customers");
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export default api;
