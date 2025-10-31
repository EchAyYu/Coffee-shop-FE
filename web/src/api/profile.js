import api from "./api";

export const getCheckoutProfile = () => api.get("/profile/me/checkout-profile");
export const updateCheckoutProfile = (payload) => api.put("/profile/me/checkout-profile", payload);

