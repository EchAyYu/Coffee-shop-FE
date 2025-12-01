import { useEffect, useState } from "react";
import { vouchers } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FaTicketAlt, FaGift, FaCoins } from "react-icons/fa";

// Helper định dạng tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function RedeemVoucherPage() {
  const [catalogList, setCatalogList] = useState([]);
  const [myVoucherList, setMyVoucherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);
  const [activeTab, setActiveTab] = useState("redeem");

  const { points, setPoints } = useAuth();

  const fetchData = () => {
    setLoading(true);
    setError("");
    Promise.all([vouchers.catalog(), vouchers.my()])
      .then(([catalogRes, myVouchersRes]) => {
        // ✅ KHÔNG lọc points_cost > 0 nữa – backend đã lọc active + còn số lượng
        const redeemableVouchers =
          catalogRes.data?.data || catalogRes.data || [];
        setCatalogList(redeemableVouchers);
        setMyVoucherList(myVouchersRes.data?.data || myVouchersRes.data || []);
      })
      .catch((err) => {
        console.error("Lỗi tải voucher:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (voucher) => {
    if (points < voucher.points_cost) {
      alert("Bạn không đủ điểm để đổi vật phẩm này.");
      return;
    }
    if (
      !window.confirm(
        `Xác nhận dùng ${voucher.points_cost} điểm để đổi "${voucher.name}"?`
      )
    ) {
      return;
    }

    setRedeemingId(voucher.id);
    setError("");

    try {
      const res = await vouchers.redeem(voucher.id);
      const newPoints = res.data?.data?.newPoints;
      if (typeof newPoints === "number") {
        setPoints(newPoints);
      }

      alert("🎉 Đổi voucher thành công!");
      fetchData();
      setActiveTab("my");
    } catch (err) {
      alert(`Đổi thất bại: ${err.message || "Có lỗi xảy ra."}`);
    } finally {
      setRedeemingId(null);
    }
  };

  // --- Render ---
  return (
    <div className="py-12 max-w-6xl mx-auto px-4 min-h-screen">
      {/* 1. Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
          Thành viên thân thiết
        </span>
        <h2 className="text-4xl font-extrabold mt-3 mb-4 text-gray-800 dark:text-white">
          Voucher & Quà tặng
        </h2>
        <div className="inline-flex items-center gap-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 grid place-items-center">
            <FaCoins />
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
              Điểm tích lũy
            </p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-500">
              {points}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("redeem")}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === "redeem"
              ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          🎁 Đổi Thưởng
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            activeTab === "my"
              ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          🎟️ Voucher Của Tôi ({myVoucherList.length})
        </button>
      </div>

      {/* 3. Loading & Error */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 4. Tab Đổi Thưởng */}
      {activeTab === "redeem" && !loading && (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {catalogList.map((v) => {
              const canRedeem = points >= v.points_cost;
              const isLoadingItem = redeemingId === v.id;

              return (
                <div
                  key={v.id}
                  className={`group bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                    !canRedeem ? "opacity-70" : ""
                  }`}
                >
                  {/* Header ảnh */}
                  <div className="h-32 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative overflow-hidden">
                    <FaGift className="text-white/30 text-8xl absolute -bottom-4 -right-4 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    <FaGift className="text-white text-4xl relative z-10 drop-shadow-md" />
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col text-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                      {v.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                      {v.description ||
                        "Voucher ưu đãi đặc biệt dành cho thành viên."}
                    </p>

                    <div className="mt-auto">
                      <div className="flex justify-center items-center gap-1 text-orange-600 dark:text-orange-500 font-bold text-xl mb-4">
                        <FaCoins className="text-yellow-500" />
                        {v.points_cost}
                      </div>

                      <button
                        onClick={() => handleRedeem(v)}
                        disabled={!canRedeem || isLoadingItem}
                        className={`
                          w-full py-2.5 rounded-xl font-bold transition-all shadow-md
                          ${
                            isLoadingItem
                              ? "bg-gray-400"
                              : canRedeem
                              ? "bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-600/40"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                          }
                        `}
                      >
                        {isLoadingItem
                          ? "Đang xử lý..."
                          : canRedeem
                          ? "Đổi ngay"
                          : "Thiếu điểm"}
                      </button>

                      {v.total_quantity !== null && (
                        <p className="text-xs text-gray-400 mt-2">
                          Còn lại: {v.total_quantity - v.redeemed_count}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {catalogList.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FaGift className="mx-auto text-4xl mb-3 opacity-30" />
              Hiện chưa có vật phẩm nào để đổi.
            </div>
          )}
        </>
      )}

      {/* 5. Tab Voucher Của Tôi */}
      {activeTab === "my" && !loading && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {myVoucherList.map((r) => (
            <MyVoucherCard key={r.id} redemption={r} />
          ))}
          {myVoucherList.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FaTicketAlt className="mx-auto text-4xl mb-3 opacity-30" />
              Bạn chưa có voucher nào. Hãy tích điểm đổi quà nhé!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Component Card Voucher Của Tôi ---
function MyVoucherCard({ redemption }) {
  const { Voucher: v, code, status, expires_at } = redemption;

  const isExpired =
    status === "expired" || (expires_at && new Date(expires_at) < new Date());
  const isUsed = status === "used";
  const isActive = status === "active" && !isExpired;

  let statusInfo = {
    text: "Khả dụng",
    bg: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  if (isUsed) {
    statusInfo = {
      text: "Đã dùng",
      bg: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    };
  } else if (isExpired) {
    statusInfo = {
      text: "Hết hạn",
      bg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  if (!v) return null;

  const discountText =
    v.discount_type === "fixed"
      ? `Giảm ${formatCurrency(v.discount_value)}`
      : `Giảm ${v.discount_value}%`;

  return (
    <div
      className={`group relative flex flex-col md:flex-row rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 overflow-hidden ${
        !isActive ? "opacity-60 grayscale" : ""
      }`}
    >
      {/* Trái */}
      <div className="md:w-32 bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center relative overflow-hidden p-6">
        <div className="absolute w-3 h-3 bg-[#fdfaf3] dark:bg-[#0a0a0a] rounded-full -top-1.5 -right-1.5"></div>
        <div className="absolute w-3 h-3 bg-[#fdfaf3] dark:bg-[#0a0a0a] rounded-full -bottom-1.5 -right-1.5"></div>
        <FaTicketAlt className="text-white text-4xl drop-shadow-md transform group-hover:rotate-12 transition-transform" />
      </div>

      {/* Giữa */}
      <div className="flex-1 p-5 border-r border-gray-100 dark:border-gray-700 border-dashed relative">
        <div className="absolute w-3 h-3 bg-[#fdfaf3] dark:bg-[#0a0a0a] rounded-full -top-1.5 -left-1.5 md:block hidden"></div>
        <div className="absolute w-3 h-3 bg-[#fdfaf3] dark:bg-[#0a0a0a] rounded-full -bottom-1.5 -left-1.5 md:block hidden"></div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {v.name}
        </h3>
        <p className="text-orange-600 font-medium mt-1">
          {discountText}{" "}
          {v.max_discount
            ? `(tối đa ${formatCurrency(v.max_discount)})`
            : ""}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          • Đơn tối thiểu: {formatCurrency(v.min_order)} <br />
          • HSD:{" "}
          {expires_at
            ? new Date(expires_at).toLocaleDateString("vi-VN")
            : "Vĩnh viễn"}
        </p>
      </div>

      {/* Phải */}
      <div className="md:w-48 p-5 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          Mã voucher
        </p>
        <div className="px-4 py-1.5 bg-white dark:bg-gray-900 border-2 border-dashed border-orange-300 dark:border-orange-800 rounded-lg w-full text-center mb-3">
          <span className="font-mono font-bold text-lg text-gray-800 dark:text-orange-500 tracking-widest select-all cursor-pointer">
            {code}
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusInfo.bg}`}
        >
          {statusInfo.text}
        </span>
      </div>
    </div>
  );
}
