import { useEffect, useState } from "react";
import { tables, bookings } from "../services/api";
import TableCard from "../components/TableCard";
import Modal from "../components/Modal";

export default function BookingArea({ areaId, area }) {
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // fetch tables by area
    tables.list({ area: areaId })
      .then(res => setTablesList(res.data))
      .catch(()=>setTablesList([]));
  }, [areaId]);

  function openBooking(table) {
    setSelectedTable(table);
    setShowModal(true);
  }

  async function submitBooking(formData) {
    // formData: { name, email, phone, date, time, people, tableId }
    try {
      await bookings.create(formData);
      alert("Đặt bàn thành công! Kiểm tra email để xác nhận.");
      setShowModal(false);
      // refresh list
      const res = await tables.list({ area: areaId });
      setTablesList(res.data);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi đặt bàn.");
    }
  }

  return (
    <section className="bg-surface p-4 rounded-md">
      <div className="flex gap-4 items-center mb-4">
        <img src={area.img} alt={area.name} className="w-40 h-28 object-cover rounded" />
        <div>
          <h2 className="text-xl font-semibold">{area.name}</h2>
          <p className="text-sm">Hình ảnh khu vực để khách dễ chọn chỗ.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tablesList.map(tb => (
          <TableCard key={tb.ID_BAN || tb.id} table={tb} onReserve={() => openBooking(tb)} />
        ))}
      </div>

      {showModal && selectedTable && (
        <Modal onClose={() => setShowModal(false)}>
          <BookingForm table={selectedTable} onSubmit={submitBooking} />
        </Modal>
      )}
    </section>
  );
}

function BookingForm({ table, onSubmit }) {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    people: 2,
    tableId: table.ID_BAN || table.id,
  });

  function handleChange(e) {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(data); }}>
      <h3 className="text-lg mb-2">Đặt bàn: {table.SO_BAN || table.number}</h3>
      <input name="name" placeholder="Họ tên" value={data.name} onChange={handleChange} className="block w-full mb-2 p-2 rounded bg-[#333]" required />
      <input name="email" type="email" placeholder="Email" value={data.email} onChange={handleChange} className="block w-full mb-2 p-2 rounded bg-[#333]" required />
      <input name="phone" placeholder="Số điện thoại" value={data.phone} onChange={handleChange} className="block w-full mb-2 p-2 rounded bg-[#333]" required />
      <div className="flex gap-2 mb-2">
        <input name="date" type="date" value={data.date} onChange={handleChange} className="p-2 rounded bg-[#333]" required />
        <input name="time" type="time" value={data.time} onChange={handleChange} className="p-2 rounded bg-[#333]" required />
      </div>
      <input name="people" type="number" value={data.people} onChange={handleChange} min="1" className="block w-32 mb-4 p-2 rounded bg-[#333]" />
      <button className="px-4 py-2 rounded bg-[#1E90FF] text-black">Xác nhận đặt</button>
    </form>
  );
}
