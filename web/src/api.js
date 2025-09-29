import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // đổi nếu backend chạy port khác
});

// Auth
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

// Products
export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);

// Orders
export const createOrder = (data) => api.post("/orders", data);

// Customers
export const getCustomer = (id) => api.get(`/customers/${id}`);

// Categories 
export const getCategories = () => api.get("/categories");


export default api;
