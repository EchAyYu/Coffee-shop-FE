// web/src/api/reservationApi.js
import axios from "axios";

const reservationApi = axios.create({
  baseURL: "http://localhost:4000/api", // ⚠️ đổi port nếu backend khác
});

/**
 * Tạo đặt bàn từ chatbot.
 * data: { name, phone, date, time, people, note }
 *
 * TODO: Bạn cần map sang đúng field backend đang dùng.
 * Ở đây mình giả sử backend có route POST /api/reservations
 * và controller nhận: { ho_ten, sdt, ngay_dat, gio_dat, so_nguoi, ghi_chu }.
 */
export const createReservationFromChat = (data) => {
  const payload = {
    ho_ten: data.name,
    sdt: data.phone,
    ngay_dat: data.date,   // "2025-11-21"
    gio_dat: data.time,    // "19:00"
    so_nguoi: Number(data.people) || 1,
    ghi_chu: data.note || "Đặt bàn qua chatbot",
  };

  return reservationApi.post("/reservations", payload);
  // 🔁 Nếu API đặt bàn của bạn là /api/booking hoặc /api/table-reservations
  // thì sửa "/reservations" thành đúng path.
};
