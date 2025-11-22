import { useEffect, useState } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiCalendar,
  FiShoppingCart,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { sendChatMessage } from "../api/chatbotApi";
import { createReservationFromChat } from "../api/reservationApi";
import { getSuggestedProducts } from "../api/productsApi";
import { useCart } from "./CartContext";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào, mình là trợ lý LO Coffee ☕. Bạn có thể hỏi mình về menu, khuyến mãi, đặt bàn hoặc đặt món nhanh nhé!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Context & điều hướng ---
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // --- Đặt bàn ---
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationDraft, setReservationDraft] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    people: 2,
    note: "",
  });
  const [submittingReservation, setSubmittingReservation] = useState(false);

  // --- Đặt món nhanh ---
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

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

  // --- Form đặt bàn ---
  const openReservationForm = () => setShowReservationForm(true);
  const closeReservationForm = () => setShowReservationForm(false);

  const handleReservationChange = (field, value) => {
    setReservationDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (submittingReservation) return;

    if (
      !reservationDraft.name.trim() ||
      !reservationDraft.phone.trim() ||
      !reservationDraft.date ||
      !reservationDraft.time
    ) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Bạn vui lòng điền đầy đủ Họ tên, Số điện thoại, Ngày và Giờ đặt bàn nhé.",
        },
      ]);
      return;
    }

    try {
      setSubmittingReservation(true);
      await createReservationFromChat(reservationDraft);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Mình đã gửi yêu cầu đặt bàn của bạn cho quán. Nhân viên sẽ kiểm tra và liên hệ xác nhận trong thời gian sớm nhất nhé! 📝",
        },
      ]);

      setReservationDraft({
        name: "",
        phone: "",
        date: "",
        time: "",
        people: 2,
        note: "",
      });
      setShowReservationForm(false);
    } catch (error) {
      console.error("Lỗi gửi yêu cầu đặt bàn:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Hiện mình chưa gửi được yêu cầu đặt bàn, bạn thử lại sau hoặc dùng trang Đặt bàn nhé.",
        },
      ]);
    } finally {
      setSubmittingReservation(false);
    }
  };

  // --- Đặt món nhanh ---
  const toggleQuickOrder = async () => {
    const next = !showQuickOrder;
    setShowQuickOrder(next);

    if (next && suggestedProducts.length === 0 && !loadingProducts) {
      try {
        setLoadingProducts(true);
        const products = await getSuggestedProducts();
        setSuggestedProducts(products);
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm cho quick order:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
  };

  const handleAddProductToCart = (product) => {
    addToCart(product);
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `Mình đã thêm "${product.ten_mon}" vào giỏ hàng cho bạn. Bạn có thể vào trang Thanh toán để hoàn tất đặt món nhé!`,
      },
    ]);
  };

  const goToCheckout = () => {
    navigate("/checkout");
    // Option: đóng chatbot
    // setIsOpen(false);
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
                Hỏi mình về menu, đặt bàn hoặc đặt món nhanh nhé!
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

            {/* Form xác nhận đặt bàn */}
            {showReservationForm && (
              <div className="mt-3 p-3 bg-white border border-blue-100 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    Xác nhận đặt bàn gửi quán
                  </span>
                </div>

                <form onSubmit={handleReservationSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      placeholder="Họ tên"
                      value={reservationDraft.name}
                      onChange={(e) =>
                        handleReservationChange("name", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      placeholder="Số điện thoại"
                      value={reservationDraft.phone}
                      onChange={(e) =>
                        handleReservationChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      value={reservationDraft.date}
                      onChange={(e) =>
                        handleReservationChange("date", e.target.value)
                      }
                    />
                    <input
                      type="time"
                      className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      value={reservationDraft.time}
                      onChange={(e) =>
                        handleReservationChange("time", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-1/3 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      placeholder="Số người"
                      value={reservationDraft.people}
                      onChange={(e) =>
                        handleReservationChange("people", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      placeholder="Ghi chú (nếu có)"
                      value={reservationDraft.note}
                      onChange={(e) =>
                        handleReservationChange("note", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={closeReservationForm}
                      className="px-2 py-1 rounded-md border border-gray-300 text-gray-600 text-xs"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReservation}
                      className="px-2 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold disabled:opacity-60"
                    >
                      {submittingReservation ? "Đang gửi..." : "Xác nhận gửi quán"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Panel đặt món nhanh */}
            {showQuickOrder && (
              <div className="mt-3 p-3 bg-white border border-green-100 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiShoppingCart size={14} className="text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                      Đặt món nhanh
                    </span>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="text-xs text-gray-500">Đang tải menu...</div>
                ) : suggestedProducts.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    Hiện chưa lấy được danh sách món. Bạn thử lại sau hoặc dùng trang Menu nhé.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {suggestedProducts.map((p) => (
                      <div
                        key={p.id_mon || p.id}
                        className="flex items-center justify-between text-xs border-b last:border-none border-gray-100 py-1"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-medium truncate">
                            {p.ten_mon}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {Number(p.gia).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddProductToCart(p)}
                          className="px-2 py-1 rounded-md bg-green-600 text-white text-[11px] hover:bg-green-700"
                        >
                          Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={goToCheckout}
                    className="px-2 py-1 rounded-md border border-green-500 text-green-700 text-[11px] hover:bg-green-50 flex items-center gap-1"
                  >
                    <FiShoppingCart size={11} />
                    <span>Đến trang thanh toán</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input + nút mở form đặt bàn / đặt món nhanh */}
          <div className="border-t border-gray-200 px-3 py-2 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={openReservationForm}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-blue-500 text-blue-600 text-xs hover:bg-blue-50"
              >
                <FiCalendar size={12} />
                <span>Đặt bàn nhanh</span>
              </button>
              <button
                type="button"
                onClick={toggleQuickOrder}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-green-500 text-green-700 text-xs hover:bg-green-50"
              >
                <FiShoppingCart size={12} />
                <span>Đặt món nhanh</span>
              </button>
            </div>

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
