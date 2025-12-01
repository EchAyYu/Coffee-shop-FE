import axios from "axios";

const productsApi = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const getSuggestedProducts = async () => {
  const res = await productsApi.get("/products", {
    params: { limit: 10, page: 1 },
  });

  // Tùy cấu trúc response của BE mà chỉnh dòng này.
  // Nếu BE trả { data: { rows: [...], count: ... } } thì đổi lại cho đúng.
  return res.data?.data || res.data?.products || res.data || [];
};
