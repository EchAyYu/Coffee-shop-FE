// web/src/api/chatbotApi.js
import axios from "axios";

// ⚠️ Đảm bảo đúng port backend của bạn (4000 hoặc 5000...)
// Trong log BE bạn đang dùng 4000 nên mình để 4000:
const chatbotApi = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const sendChatMessage = (message) => {
  return chatbotApi.post("/chatbot", { message });
};
