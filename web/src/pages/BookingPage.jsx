export default function BookingPage() {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">Đặt bàn Highlands Style</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-2xl overflow-hidden">
          <img src="/images/room-cold.jpg" alt="Phòng lạnh" className="w-full h-64 object-cover" />
          <div className="p-4 text-center">
            <h3 className="font-semibold text-lg mb-2">Khu phòng lạnh ❄️</h3>
            <button className="px-4 py-2 rounded-xl bg-red-700 text-white">Xem bàn & Đặt ngay</button>
          </div>
        </div>
        <div className="border rounded-2xl overflow-hidden">
          <img src="/images/room-outdoor.jpg" alt="Ngoài trời" className="w-full h-64 object-cover" />
          <div className="p-4 text-center">
            <h3 className="font-semibold text-lg mb-2">Khu ngoài trời 🌿</h3>
            <button className="px-4 py-2 rounded-xl bg-red-700 text-white">Xem bàn & Đặt ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
}
