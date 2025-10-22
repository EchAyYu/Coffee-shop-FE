import api from "./api"; // axios instance

export const getHomeContents = () => api.get("/home-content");
export const createHomeContent = (data) => api.post("/home-content", data);
export const updateHomeContent = (id, data) => api.put(`/home-content/${id}`, data);
export const deleteHomeContent = (id) => api.delete(`/home-content/${id}`);
