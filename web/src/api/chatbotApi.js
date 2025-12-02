// src/api/chatbotApi.js
import axios from "axios";

// Dùng chung base URL với backend (ưu tiên từ .env)
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const chatbotApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // nếu backend có dùng cookie / session
});

// ✅ Gửi tin nhắn TEXT cho chatbot
// Hỗ trợ cả 2 cách gọi:
// 1) sendChatbotMessage({ message, history })
// 2) sendChatbotMessage("xin chào", historyArray)
export const sendChatbotMessage = (payload, historyParam) => {
  let message;
  let history = [];

  if (typeof payload === "string") {
    message = payload;
    history = historyParam || [];
  } else if (payload && typeof payload === "object") {
    message = payload.message;
    history = payload.history || [];
  }

  return chatbotApi.post("/chatbot", {
    message,
    history,
  });
};

// 🔁 Giữ lại tên cũ để không phá code chỗ khác (alias)
export const sendChatMessage = (message, history = []) =>
  sendChatbotMessage(message, history);

// ✅ Gửi HÌNH ẢNH cho chatbot
// Hỗ trợ:
// 1) sendImageMessage(file, history)
// 2) sendImageMessage({ file, history })
export const sendImageMessage = (fileOrOptions, historyParam) => {
  let file;
  let history = [];

  if (fileOrOptions instanceof File || fileOrOptions instanceof Blob) {
    file = fileOrOptions;
    history = historyParam || [];
  } else if (fileOrOptions && typeof fileOrOptions === "object") {
    file = fileOrOptions.file;
    history = fileOrOptions.history || [];
  }

  const formData = new FormData();
  if (file) formData.append("image", file);
  if (history && history.length) {
    formData.append("history", JSON.stringify(history));
  }

  return chatbotApi.post("/chatbot/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default {
  sendChatbotMessage,
  sendChatMessage,
  sendImageMessage,
};
