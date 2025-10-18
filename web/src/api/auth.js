// ================================
// ☕ Coffee Shop FE - Auth API
// ================================
import api from "./axios";

export const login = (payload) => api.post("/auth/login", payload);
export const register = (payload) => api.post("/auth/register", payload);
export const me = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout");
export const refresh = () => api.post("/auth/refresh");
