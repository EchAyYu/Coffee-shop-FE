// src/components/ChatbotWidget.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiX,
  FiSend,
  FiImage,
  FiTrash2,
  FiEdit2,
  FiMessageCircle,
  FiShoppingCart,
} from "react-icons/fi";
import { reservations } from "../api/api";
import { sendChatbotMessage, sendImageMessage } from "../api/chatbotApi";
import { useCart } from "./CartContext";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "lo_coffee_chatbot_sessions_v3";

function createNewSession(title = "Cuộc trò chuyện mới") {
  const id = `session_${Date.now()}`;
  return {
    id,
    title,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `m_${Date.now()}`,
        sender: "bot",
        type: "text",
        text:
          "Xin chào, mình là trợ lý LO Coffee ☕.\n" +
          "Bạn có thể hỏi mình về menu, khuyến mãi, gợi ý đồ uống, " +
          "gửi hình đồ uống hoặc nhờ mình hỗ trợ đặt bàn nhé!",
      },
    ],
  };
}

function buildHistoryFromMessages(messages = []) {
  return messages
    .filter((m) => m.type === "text" && m.text && m.sender !== "system")
    .slice(-10)
    .map((m) => ({
      role: m.sender === "bot" ? "assistant" : "user",
      content: m.text,
    }));
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl }

  const [pendingReservation, setPendingReservation] = useState(null);
  const [confirmingReservation, setConfirmingReservation] = useState(false);

  const [pendingOrderItems, setPendingOrderItems] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { addToCart } = useCart();
  const { user } = useAuth();

  // ===== Load sessions (kèm migrate bỏ blob: URL cũ) =====
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((s) => ({
            ...s,
            messages: Array.isArray(s.messages)
              ? s.messages.filter(
                  (m) =>
                    !(
                      m.type === "image" &&
                      typeof m.imageUrl === "string" &&
                      m.imageUrl.startsWith("blob:")
                    )
                )
              : [],
          }));
          setSessions(migrated);
          setActiveSessionId(migrated[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn("Không parse được lịch sử chatbot:", e);
    }

    const first = createNewSession("Cuộc trò chuyện 1");
    setSessions([first]);
    setActiveSessionId(first.id);
  }, []);

  // Save sessions
  useEffect(() => {
    if (sessions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  // Auto scroll
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession, isOpen]);

  // Session actions
  const handleNewSession = () => {
    const newIndex = sessions.length + 1;
    const newSession = createNewSession(`Cuộc trò chuyện ${newIndex}`);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setPendingReservation(null);
    setPendingOrderItems(null);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (!filtered.length) {
        const first = createNewSession("Cuộc trò chuyện 1");
        setActiveSessionId(first.id);
        return [first];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
    setPendingReservation(null);
    setPendingOrderItems(null);
  };

  const startEditTitle = () => {
    if (!activeSession) return;
    setEditingTitle(true);
    setEditingTitleValue(activeSession.title || "");
  };

  const applyEditTitle = () => {
    const value = editingTitleValue.trim();
    if (!activeSession || !value) {
      setEditingTitle(false);
      return;
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id ? { ...s, title: value } : s
      )
    );
    setEditingTitle(false);
  };

  // Chat helpers
  const appendMessageToActive = (msg) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...s.messages, msg] }
          : s
      )
    );
  };

  const handleSelectImageClick = () => {
    fileInputRef.current?.click();
  };

  // Dùng FileReader → tạo dataURL (base64) để lưu được qua F5
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setSelectedImage({ file, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (isSending) return;
    const text = input.trim();

    if (!text && !selectedImage) return;
    if (!activeSession) return;

    setIsSending(true);

    try {
      const baseMessages = activeSession.messages;

      // 1. Text user
      if (text) {
        appendMessageToActive({
          id: `m_${Date.now()}_user`,
          sender: "user",
          type: "text",
          text,
        });
      }

      // 2. Có ảnh → gửi ảnh
      if (selectedImage) {
        const thisImage = selectedImage;
        setSelectedImage(null);

        // Hiển thị ảnh (previewUrl là dataURL, lưu được trong localStorage)
        appendMessageToActive({
          id: `m_${Date.now()}_img`,
          sender: "user",
          type: "image",
          imageUrl: thisImage.previewUrl,
          text: "Ảnh bạn vừa gửi",
        });

        const historyForApi = buildHistoryFromMessages([
          ...baseMessages,
          ...(text
            ? [
                {
                  id: "tmp_user",
                  sender: "user",
                  type: "text",
                  text,
                },
              ]
            : []),
        ]);

        const res = await sendImageMessage(thisImage.file, historyForApi);
        const { reply, orderItems } = res.data || {};

        const replyText =
          reply ||
          "Mình chưa đọc được hình này, bạn thử gửi lại giúp mình nhé.";

        appendMessageToActive({
          id: `m_${Date.now()}_bot`,
          sender: "bot",
          type: "text",
          text: replyText,
        });

        if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
          setPendingOrderItems(orderItems);
        } else {
          setPendingOrderItems(null);
        }

        setInput("");
        return;
      }

      // 3. Chỉ text
      const historyForApi = buildHistoryFromMessages(baseMessages);

      const res = await sendChatbotMessage({
        message: text,
        history: historyForApi,
      });

      const replyText =
        res.data?.reply ||
        "Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn hỏi lại giúp mình nhé.";

      appendMessageToActive({
        id: `m_${Date.now()}_bot`,
        sender: "bot",
        type: "text",
        text: replyText,
      });

      // Đặt bàn nhanh
      if (res.data?.reservationData) {
        setPendingReservation(res.data.reservationData);
      } else {
        setPendingReservation(null);
      }

      // Đặt món nhanh
      if (res.data?.orderItems && Array.isArray(res.data.orderItems)) {
        if (res.data.orderItems.length > 0) {
          setPendingOrderItems(res.data.orderItems);
        } else {
          setPendingOrderItems(null);
        }
      } else {
        setPendingOrderItems(null);
      }

      setInput("");
    } catch (err) {
      console.error("Lỗi chatbot:", err);
      const backendMsg = err?.response?.data?.message;
      appendMessageToActive({
        id: `m_${Date.now()}_error`,
        sender: "bot",
        type: "text",
        text:
          backendMsg ||
          "Chatbot đang gặp chút trục trặc, bạn thử lại sau ít phút giúp mình nhé.",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Đặt bàn nhanh từ AI
  const handleQuickReservationFromAI = async () => {
    if (!pendingReservation || confirmingReservation) return;

    const r = pendingReservation;

    // Nếu chưa đăng nhập, backend có thể trả 403 -> không gọi API, yêu cầu người dùng đăng nhập
    if (!user) {
      appendMessageToActive({
        id: `m_${Date.now()}_auth_req`,
        sender: "bot",
        type: "text",
        text:
          "Mình không thể gửi yêu cầu đặt bàn thay bạn khi bạn chưa đăng nhập.\nVui lòng đăng nhập hoặc đi tới trang Đặt bàn để nhập thông tin.",
      });
      return;
    }

    if (!r.date || !r.time) {
      appendMessageToActive({
        id: `m_${Date.now()}_warn`,
        sender: "bot",
        type: "text",
        text:
          "Thông tin ngày/giờ đặt bàn chưa rõ ràng nên mình chưa gửi yêu cầu được. " +
          "Bạn giúp mình nhập lại ngày (YYYY-MM-DD) và giờ (HH:mm) nhé.",
      });
      return;
    }

    setConfirmingReservation(true);
    try {
      const payload = {
        ho_ten: r.name,
        sdt: r.phone,
        ngay_dat: r.date,
        gio_dat: r.time,
        so_nguoi: r.people || 1,
        ghi_chu: r.note || "",
      };

      await reservations.create(payload);

      appendMessageToActive({
        id: `m_${Date.now()}_res_ok`,
        sender: "bot",
        type: "text",
        text:
          "Mình đã gửi yêu cầu đặt bàn của bạn lên hệ thống. " +
          "Nhân viên sẽ kiểm tra và xác nhận lại trong thời gian sớm nhất nhé!",
      });

      setPendingReservation(null);
    } catch (err) {
      console.error("Lỗi gửi yêu cầu đặt bàn từ AI:", err);
      appendMessageToActive({
        id: `m_${Date.now()}_res_err`,
        sender: "bot",
        type: "text",
        text:
          "Hiện mình chưa gửi được yêu cầu đặt bàn, bạn thử lại sau hoặc dùng trang Đặt bàn giúp mình nhé.",
      });
    } finally {
      setConfirmingReservation(false);
    }
  };

  const handleGoToBookingForm = () => {
    window.location.href = "/booking";
  };

  // Thêm món vào giỏ từ AI
  const handleApplyPendingOrder = (goToCheckout = false) => {
    if (!pendingOrderItems || !pendingOrderItems.length || processingOrder)
      return;

    setProcessingOrder(true);
    try {
      pendingOrderItems.forEach((item) => {
        const baseProduct = {
          id_mon: item.id_mon,
          ten_mon: item.ten_mon,
          gia: item.gia,
          anh: item.anh,
        };
        const qty = item.quantity || 1;
        for (let i = 0; i < qty; i += 1) {
          addToCart(baseProduct);
        }
      });

      appendMessageToActive({
        id: `m_${Date.now()}_order_ok`,
        sender: "bot",
        type: "text",
        text:
          "Mình đã thêm các món bạn chọn vào giỏ hàng. " +
          "Bạn có thể tiếp tục hỏi thêm hoặc chuyển sang trang thanh toán bất cứ lúc nào nhé!",
      });

      setPendingOrderItems(null);

      if (goToCheckout) {
        window.location.href = "/checkout";
      }
    } finally {
      setProcessingOrder(false);
    }
  };

  if (!activeSession) return null;

  const quickSuggestions = [
    "Khuyến mãi hôm nay là gì?",
    "Mình có voucher hoặc mã giảm giá nào không?",
    "Làm sao để đổi điểm lấy voucher?",
    "Gợi ý cho mình đồ uống ít cafeine",
  ];


  return (
    <>
      {/* Nút mở chatbot */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white shadow-xl shadow-orange-300/60 flex items-center justify-center border border-white/40"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Widget chính */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 w-[380px] max-w-full h-[75vh]">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-2xl border border-orange-100/70 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                  <span className="text-lg">☕</span>
                  <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-green-400 border border-white"></span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">Trợ lý LO Coffee</span>
                  <span className="text-[11px] opacity-90">
                    Online • Hỏi mình về menu, khuyến mãi, gợi ý đồ uống hoặc gửi hình để tư vấn nhé!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/15"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Chọn session + đổi tên + tạo mới */}
            <div className="px-4 py-2 border-b border-orange-100/70 bg-orange-50/80 flex items-center gap-2 text-[11px]">
              <select
                value={activeSession.id}
                onChange={(e) => {
                  setActiveSessionId(e.target.value);
                  setPendingReservation(null);
                  setPendingOrderItems(null);
                }}
                className="flex-1 text-[11px] rounded-lg border border-orange-200 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title || "Cuộc trò chuyện"}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={startEditTitle}
                className="p-1 rounded-lg border border-orange-200 bg-white text-orange-600 hover:bg-orange-100"
                title="Đổi tên cuộc trò chuyện"
              >
                <FiEdit2 size={14} />
              </button>

              <button
                type="button"
                onClick={handleNewSession}
                className="px-2 py-1 rounded-lg bg-white text-orange-600 text-[11px] font-semibold border border-orange-300 hover:bg-orange-100"
              >
                Chat mới
              </button>

              <button
                type="button"
                onClick={() => handleDeleteSession(activeSession.id)}
                className="p-1 rounded-lg border border-orange-200 bg-white text-red-500 hover:bg-red-50"
                title="Xóa cuộc trò chuyện"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            {/* Ô đổi tên */}
            {editingTitle && (
              <div className="px-4 py-2 border-b border-orange-100 bg-orange-50/80 flex items-center gap-2">
                <input
                  value={editingTitleValue}
                  onChange={(e) => setEditingTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyEditTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  className="flex-1 text-xs rounded-lg border border-orange-200 bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="Nhập tên cuộc trò chuyện"
                />
                <button
                  type="button"
                  onClick={applyEditTitle}
                  className="px-2 py-1 text-[11px] rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTitle(false)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            )}

            {/* Nội dung chat */}
            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gradient-to-b from-[#FFF7ED] via-[#FFF3E0] to-[#FFEBD6] space-y-3 text-xs custom-scrollbar">
              {activeSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                      m.sender === "user"
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-white/95 text-gray-800 rounded-bl-sm border border-orange-100/60"
                    }`}
                  >
                    {m.type === "image" && m.imageUrl && (
                      <div className="mb-1">
                        <img
                          src={m.imageUrl}
                          alt="Ảnh bạn gửi"
                          className="w-full max-w-[220px] rounded-xl object-cover border border-orange-100/70"
                        />
                      </div>
                    )}
                    {m.text && (
                      <div className="whitespace-pre-line leading-relaxed">
                        {m.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Panel đặt bàn nhanh */}
              {pendingReservation && (
                <div className="mt-2 p-3 bg-white/95 border border-orange-200 rounded-lg shadow-sm text-[11px] space-y-2">
                  <div className="font-semibold text-orange-700 flex items-center gap-1">
                    <span role="img" aria-label="calendar">
                      📅
                    </span>
                    <span>Xác nhận đặt bàn qua chatbot</span>
                  </div>
                  <div className="space-y-1 text-gray-800">
                    <div>Tên: {pendingReservation.name || "Không rõ"}</div>
                    <div>SDT: {pendingReservation.phone || "Không rõ"}</div>
                    <div>
                      Thời gian:{" "}
                      {pendingReservation.date && pendingReservation.time
                        ? `${pendingReservation.date} lúc ${pendingReservation.time}`
                        : "Chưa rõ (AI chưa hiểu rõ ngày/giờ)"}
                    </div>
                    <div>Số người: {pendingReservation.people || 1}</div>
                    {pendingReservation.note && (
                      <div>Ghi chú: {pendingReservation.note}</div>
                    )}
                  </div>
                  <div className="pt-1 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingReservation(null)}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToBookingForm}
                      className="px-3 py-1 rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Đi đến form đặt bàn
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickReservationFromAI}
                      disabled={confirmingReservation}
                      className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {confirmingReservation
                        ? "Đang gửi..."
                        : "Xác nhận & gửi yêu cầu"}
                    </button>
                  </div>
                </div>
              )}

              {/* Panel thêm vào giỏ từ AI */}
              {pendingOrderItems && pendingOrderItems.length > 0 && (
                <div className="mt-2 p-3 bg-white/95 border border-orange-200 rounded-lg shadow-sm text-[11px] space-y-2">
                  <div className="font-semibold text-orange-700 flex items-center gap-1">
                    <FiShoppingCart size={12} />
                    <span>Xác nhận thêm vào giỏ hàng</span>
                  </div>

                  <ul className="list-disc pl-4 space-y-1 text-gray-800">
                    {pendingOrderItems.map((item, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">
                          {item.quantity || 1} x {item.ten_mon}
                        </span>{" "}
                        <span className="text-gray-500">
                          ({Number(item.gia || 0).toLocaleString("vi-VN")} ₫)
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-1 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingOrderItems(null)}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPendingOrder(false)}
                      disabled={processingOrder}
                      className="px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                      {processingOrder ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPendingOrder(true)}
                      disabled={processingOrder}
                      className="px-3 py-1 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      {processingOrder ? "Đang xử lý..." : "Thêm & thanh toán"}
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preview ảnh đang chọn */}
            {selectedImage && (
              <div className="px-3 pt-2 pb-2 bg-orange-50 border-t border-orange-100 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={selectedImage.previewUrl}
                        alt="Preview"
                        className="w-11 h-11 rounded-lg object-cover border border-orange-200 shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Ảnh sẽ được gửi kèm tin nhắn tiếp theo
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Bạn có thể mô tả thêm: ví dụ "Gợi ý món giống như ly này" để mình tư vấn chuẩn hơn.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 pt-2 pb-3 border-t border-orange-100 bg-white/95">
              {/* quick suggestions */}
              <div className="flex flex-wrap gap-2 mb-2">
                {quickSuggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="px-2 py-1 rounded-full bg-orange-50 text-[10px] text-orange-700 border border-orange-100 hover:bg-orange-100"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleSelectImageClick}
                  className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                  title="Gửi hình đồ uống hoặc bánh"
                >
                  <FiImage size={18} />
                </button>

                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 max-h-24 rounded-xl border border-gray-200 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 bg-white/90"
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="p-2 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white disabled:opacity-60 shadow-sm shadow-orange-300/60"
                >
                  <FiSend size={18} />
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}