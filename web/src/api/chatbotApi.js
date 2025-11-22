import axios from "axios";

const chatbotApi = axios.create({
  baseURL: "http://localhost:4000/api", // giữ như bạn đang dùng
});

// message: string
// history: [{ role: "user" | "assistant", content: "..." }, ...]
export const sendChatMessage = (message, history = []) => {
  return chatbotApi.post("/chatbot", { message, history });
};
