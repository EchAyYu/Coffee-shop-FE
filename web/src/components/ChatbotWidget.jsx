import { useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { sendChatMessage } from "../api/chatbotApi";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào, mình là trợ lý quán cà phê ☕. Bạn muốn hỏi gì về menu, khuyến mãi hoặc cách đặt bàn không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Thêm tin nhắn của user vào khung chat
    const newMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(trimmed);
      const reply = res.data?.reply || "Xin lỗi, mình chưa hiểu ý bạn lắm.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Chatbot đang gặp sự cố, bạn thử lại sau nhé." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Nút tròn mở chat */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 z-40 flex items-center justify-center
                   h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg
                   hover:bg-blue-700 focus:outline-none"
      >
        {isOpen ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {/* Khung chat */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-40 w-80 sm:w-96 bg-white rounded-xl shadow-2xl
                     border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-blue-600 text-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Trợ lý quán cà phê</h3>
              <p className="text-xs text-blue-100">
                Hỏi mình về món uống, khuyến mãi, đặt bàn...
              </p>
            </div>
            <button
              onClick={toggleOpen}
              className="text-blue-100 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto max-h-80 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[80%] whitespace-pre-wrap
                    ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-xs bg-white border border-gray-200 text-gray-500">
                  Đang gõ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-2 bg-white">
            <div className="flex items-center gap-2">
              <textarea
                rows={1}
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                           max-h-24"
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-9 w-9 flex items-center justify-center rounded-full
                           bg-blue-600 text-white hover:bg-blue-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
