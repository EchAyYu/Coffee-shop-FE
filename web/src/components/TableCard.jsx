export default function TableCard({ table, onReserve }) {
  const isFree = !table.status || table.status === "free" || table.TT === "trống";
  return (
    <div className={`p-3 rounded border ${isFree ? "border-green-500" : "border-red-500"} bg-[#2b2b2b]`}>
      <div className="text-lg font-bold">Bàn {table.SO_BAN || table.number}</div>
      <div className="text-sm">Trạng thái: {isFree ? "Trống" : "Đã đặt"}</div>
      <div className="mt-2">
        <button disabled={!isFree} onClick={onReserve} className={`px-3 py-1 rounded ${isFree ? "bg-green-400 text-black" : "bg-gray-600 text-gray-300"}`}>
          {isFree ? "Đặt bàn" : "Không thể đặt"}
        </button>
      </div>
    </div>
  );
}
