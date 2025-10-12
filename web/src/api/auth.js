import { api } from "./axios";

export const login = (payload) => api.post("/auth/login", payload);
export const me = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout"); // BE sẽ xoá cookie refresh
