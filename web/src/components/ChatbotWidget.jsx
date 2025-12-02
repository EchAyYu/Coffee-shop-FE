// src/components/ChatbotWidget.jsx
import { useState } from "react";
import { FiMessageCircle, FiSend, FiX, FiCalendar } from "react-icons/fi";
import { sendChatMessage } from "../api/chatbotApi";
import { createReservationFromChat } from "../api/reservationApi";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Xin chào, mình là trợ lý LO Coffee ☕.\n" +
        "Bạn có thể hỏi mình về menu, khuyến mãi, gợi ý đồ uống hoặc nhờ mình hỗ trợ đặt bàn nhé!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Đặt bàn qua AI (từ reservationData BE trả về)
  const [pendingReservation, setPendingReservation] = useState(null);
  const [confirmingReservation, setConfirmingReservation] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Gửi tin nhắn cho chatbot
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyForApi = newMessages.map((m) => ({
        role: m.sender === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await sendChatMessage(trimmed, historyForApi);

      const reply =
        res.data?.reply ||
        "Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn hỏi lại giúp mình nhé.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);

      // Nếu BE trả kèm dữ liệu đặt bàn, lưu lại để hiển thị panel xác nhận
      if (res.data?.reservationData) {
        console.log("reservationData từ chatbot:", res.data.reservationData);
        setPendingReservation(res.data.reservationData);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Chatbot đang gặp sự cố, bạn thử lại sau nhé.",
        },
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

  // ✅ ĐẶT BÀN NHANH – gọi thẳng API tạo reservation
  const handleQuickReservationFromAI = async () => {
    if (!pendingReservation || confirmingReservation) return;

    try {
      setConfirmingReservation(true);
      console.log("📤 GỬI YÊU CẦU ĐẶT BÀN TỪ CHATBOT:", pendingReservation);

      await createReservationFromChat(pendingReservation);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Mình đã gửi yêu cầu đặt bàn của bạn cho quán. " +
            "Nhân viên sẽ kiểm tra và liên hệ xác nhận trong thời gian sớm nhất nhé! 📝",
        },
      ]);

      setPendingReservation(null);
    } catch (error) {
      console.error("Lỗi gửi yêu cầu đặt bàn từ AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Hiện mình chưa gửi được yêu cầu đặt bàn, " +
            "bạn thử lại sau hoặc dùng trang Đặt bàn giúp mình nhé.",
        },
      ]);
    } finally {
      setConfirmingReservation(false);
    }
  };

  // ✅ ĐI TỚI FORM ĐẶT BÀN – mở trang /booking với query prefill
  const handleGoToBookingForm = () => {
    if (!pendingReservation) return;

    const params = new URLSearchParams({
      fromChatbot: "1",
      name: pendingReservation.name || "",
      phone: pendingReservation.phone || "",
      date: pendingReservation.date || "",
      time: pendingReservation.time || "",
      people: String(pendingReservation.people || 1),
      note: pendingReservation.note || "",
    });

    console.log("➡️ Chuyển sang BookingPage với:", pendingReservation);

    // chỉnh lại path nếu trang đặt bàn của bạn không phải là /booking
    window.location.href = `/booking?${params.toString()}`;
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
              <h3 className="text-sm font-semibold">Trợ lý LO Coffee</h3>
              <p className="text-xs text-blue-100">
                Hỏi mình về menu, gợi ý đồ uống hoặc đặt bàn nhé!
              </p>
            </div>
            <button
              onClick={toggleOpen}
              className="text-blue-100 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Nội dung */}
          <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto max-h-80 bg-gray-50">
            {/* Tin nhắn */}
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

            {/* Trạng thái đang gõ */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-xs bg-white border border-gray-200 text-gray-500">
                  Đang gõ...
                </div>
              </div>
            )}

            {/* Panel xác nhận đặt bàn do AI gợi ý */}
            {pendingReservation && (
              <div className="mt-3 p-3 bg-white border border-blue-100 rounded-lg shadow-sm text-xs space-y-1">
                <div className="flex items-center gap-1 font-semibold text-blue-700">
                  <FiCalendar size={12} />
                  <span>Xác nhận đặt bàn qua chatbot</span>
                </div>
                <div>
                  <span className="font-semibold">Tên: </span>
                  {pendingReservation.name || "Chưa rõ"}
                </div>
                <div>
                  <span className="font-semibold">SĐT: </span>
                  {pendingReservation.phone || "Chưa rõ"}
                </div>
                <div>
                  <span className="font-semibold">Thời gian: </span>
                  {pendingReservation.date} lúc {pendingReservation.time}
                </div>
                <div>
                  <span className="font-semibold">Số người: </span>
                  {pendingReservation.people}
                </div>
                {pendingReservation.note && (
                  <div>
                    <span className="font-semibold">Ghi chú: </span>
                    {pendingReservation.note}
                  </div>
                )}

                <div className="pt-1 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingReservation(null)}
                    className="px-2 py-1 rounded-md border border-gray-300 text-gray-600"
                  >
                    Hủy
                  </button>

                  {/* Đi tới form đặt bàn đầy đủ */}
                  <button
                    type="button"
                    onClick={handleGoToBookingForm}
                    className="px-2 py-1 rounded-md bg-white text-blue-600 border border-blue-400 font-semibold hover:bg-blue-50"
                  >
                    Đi tới form đặt bàn
                  </button>

                  {/* Đặt bàn nhanh – giữ flow cũ */}
                  <button
                    type="button"
                    disabled={confirmingReservation}
                    onClick={handleQuickReservationFromAI}
                    className="px-2 py-1 rounded-md bg-blue-600 text-white font-semibold disabled:opacity-60"
                  >
                    {confirmingReservation
                      ? "Đang gửi..."
                      : "Gửi nhanh cho quán"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input chat */}
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
