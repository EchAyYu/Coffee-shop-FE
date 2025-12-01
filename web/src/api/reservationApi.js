import axios from "axios";

const reservationApi = axios.create({
  baseURL: "http://localhost:4000/api",
});

// data: { name, phone, date, time, people, note }
export const createReservationFromChat = (data) => {
  const payload = {
    ngay_dat: data.date,                     // YYYY-MM-DD
    gio_dat: data.time,                      // HH:mm
    so_nguoi: Number(data.people) || 1,
    ho_ten: data.name?.trim() || "Khách đặt qua chatbot",
    sdt: data.phone?.trim() || "",
    ghi_chu: data.note || "Đặt bàn qua chatbot",
  };

  return reservationApi.post("/reservations", payload);
};
