import axios from "axios";

const chatbotApi = axios.create({
  baseURL: "/api", 
});

export const sendChatMessage = (message) => {
  return chatbotApi.post("/chatbot", { message });
};
