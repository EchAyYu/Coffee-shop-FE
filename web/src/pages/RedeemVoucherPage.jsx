import { useEffect, useState } from "react";
// 1. Import hàm 'vouchers' từ api
import { vouchers } from "../api/api";
// 2. Import AuthContext để lấy điểm và cập nhật điểm
import { useAuth } from "../context/AuthContext";

export default function RedeemVoucherPage() {
  const [voucherList, setVoucherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 3. Lấy state điểm từ context
  const { points, setPoints } = useAuth();

  // 4. State để xử lý loading cho từng nút
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    // 5. Gọi 'vouchers.catalog' (như trong api.js)
    vouchers.catalog()
      .then((res) => {
        // Lọc ra các voucher CÓ TỐN ĐIỂM
        const redeemableVouchers = (res.data.data || res.data || []).filter(
          (v) => v.points_cost > 0
        );
        setVoucherList(redeemableVouchers);
      })
      .catch((err) => {
        console.error("Lỗi lấy voucher catalog:", err);
        setError("Không thể tải danh sách vật phẩm. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 6. Hàm xử lý khi nhấn nút "Đổi"
  const handleRedeem = async (voucher) => {
    if (points < voucher.points_cost) {
      alert("Bạn không đủ điểm để đổi vật phẩm này.");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc muốn dùng ${voucher.points_cost} điểm để đổi "${voucher.name}" không?`)) {
      return;
    }

    setRedeemingId(voucher.id);
    setError(""); // Xóa lỗi cũ

    try {
      // 7. Gọi 'vouchers.redeem' (như trong api.js)
      const res = await vouchers.redeem(voucher.id);
      
      // 8. Đổi thành công, cập nhật lại điểm trên Context
      const newPoints = res.data?.data?.newPoints;
      if (typeof newPoints === 'number') {
        setPoints(newPoints); // Cập nhật state toàn cục
      }
      
      alert("Đổi voucher thành công! Bạn có thể xem voucher trong trang 'Voucher của tôi'.");
      
    } catch (err) {
      console.error("Lỗi khi đổi voucher:", err);
      // Hiển thị lỗi từ BE (ví dụ: "Không đủ điểm")
      alert(`Đổi thất bại: ${err.message || "Có lỗi xảy ra."}`);
    } finally {
      setRedeemingId(null); // Hết loading
    }
  };

  // --- Render components ---

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Đang tải danh sách vật phẩm...
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 mt-8 py-20">{error}</p>;
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-4">
        Đổi Thưởng Tích Điểm
      </h2>
      <p className="text-center text-gray-700 mb-8 text-xl font-medium">
        Điểm hiện tại của bạn: <span className="text-orange-600 font-bold">{points}</span>
      </p>

      {/* Grid danh sách voucher */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {voucherList.map((v) => {
          const canRedeem = points >= v.points_cost;
          const isLoading = redeemingId === v.id;
          
          return (
            <div
              key={v.id}
              className={`border rounded-2xl overflow-hidden bg-white shadow-sm transition ${!canRedeem ? 'opacity-70 bg-gray-50' : 'hover:shadow-md'}`}
            >
              {/* Giả sử voucher không có ảnh, chúng ta dùng icon */}
              <div className="w-full h-40 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                <span className="text-white text-6xl opacity-80">🎁</span>
              </div>
              
              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg text-gray-900">{v.name}</h3>
                <p className="text-sm text-gray-600 h-10 my-2">{v.description || "Voucher giảm giá"}</p>
                
                {/* Hiển thị chi phí điểm */}
                <p className="text-red-700 font-bold text-xl mt-2">
                  {v.points_cost} điểm
                </p>
                
                <button
                  onClick={() => handleRedeem(v)}
                  disabled={!canRedeem || isLoading}
                  className={`
                    mt-4 px-4 py-2 w-full text-white rounded-full font-semibold transition-all
                    ${isLoading ? 'bg-gray-400' : ''}
                    ${!isLoading && canRedeem ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    ${!isLoading && !canRedeem ? 'bg-gray-400 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? "Đang xử lý..." : (canRedeem ? "Đổi ngay" : "Không đủ điểm")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {voucherList.length === 0 && !loading && (
        <p className="text-center text-neutral-500 mt-8 py-20">
          Hiện chưa có vật phẩm nào để đổi.
        </p>
      )}
    </div>
  );
}
