// web/src/api/productsApi.js
import axios from "axios";

const productsApi = axios.create({
  baseURL: "http://localhost:4000/api", // cùng backend với orders
});

// Lấy danh sách 10 món mới nhất để gợi ý đặt nhanh
export const getSuggestedProducts = async () => {
  const res = await productsApi.get("/products", {
    params: { limit: 10, page: 1 },
  });
  // Giả sử backend trả { data: { products, pagination } } hoặc tương tự
  return res.data?.data || res.data?.products || res.data || [];
};
