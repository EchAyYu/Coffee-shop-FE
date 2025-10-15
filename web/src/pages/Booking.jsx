import { useEffect, useState } from "react";
import { tables, bookings } from "../services/api";
import BookingArea from "./BookingArea";

export default function Booking() {
  const [areas, setAreas] = useState([
    { id: "aircon", name: "Phòng lạnh", img: "/images/aircon.jpg" },
    { id: "outdoor", name: "Ngoài trời", img: "/images/outdoor.jpg" },
  ]);

  return (
    <div>
      <h1 className="text-3xl mb-4">Đặt bàn</h1>
      <p className="mb-6">Chọn khu vực và bàn phù hợp — xem hình và thông tin xung quanh quán.</p>

      <div className="grid gap-6">
        {areas.map(area => (
          <BookingArea key={area.id} areaId={area.id} area={area} />
        ))}
      </div>
    </div>
  );
}
