// src/pages/RedeemVoucherPage.jsx

import { useEffect, useState } from "react";
import { vouchers } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FaTicketAlt } from "react-icons/fa"; // Thêm icon

export default function RedeemVoucherPage() {
  const [catalogList, setCatalogList] = useState([]); // Danh sách để đổi
  const [myVoucherList, setMyVoucherList] = useState([]); // Danh sách đã sở hữu
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);
  
  // 💡 Thêm state cho Tab
  const [activeTab, setActiveTab] = useState("redeem"); // 'redeem' | 'my'

  const { points, setPoints } = useAuth();

  // 💡 Hàm tải TẤT CẢ dữ liệu
  const fetchData = () => {
    setLoading(true);
    setError("");
    Promise.all([
      vouchers.catalog(), // API (1): Lấy danh sách đổi
      vouchers.my(),      // API (2): Lấy voucher của tôi
    ])
    .then(([catalogRes, myVouchersRes]) => {
      // Lọc voucher có phí điểm
      const redeemableVouchers = (catalogRes.data.data || []).filter(
        (v) => v.points_cost > 0
      );
      setCatalogList(redeemableVouchers);
      
      // Set voucher của tôi
      setMyVoucherList(myVouchersRes.data.data || []);
    })
    .catch((err) => {
      console.error("Lỗi tải dữ liệu voucher:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  // Tải dữ liệu khi mount
  useEffect(() => {
    fetchData();
  }, []);

  // Hàm xử lý khi nhấn nút "Đổi"
  const handleRedeem = async (voucher) => {
    if (points < voucher.points_cost) {
      alert("Bạn không đủ điểm để đổi vật phẩm này.");
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn dùng ${voucher.points_cost} điểm để đổi "${voucher.name}" không?`)) {
      return;
    }

    setRedeemingId(voucher.id);
    setError(""); 

    try {
      const res = await vouchers.redeem(voucher.id);
      
      const newPoints = res.data?.data?.newPoints;
      if (typeof newPoints === 'number') {
        setPoints(newPoints); // Cập nhật điểm
      }
      
      alert("Đổi voucher thành công!");
      
      // 💡 Tải lại cả 2 danh sách
      fetchData(); 
      setActiveTab('my'); // Chuyển sang tab "Voucher của tôi"
      
    } catch (err) {
      console.error("Lỗi khi đổi voucher:", err);
      alert(`Đổi thất bại: ${err.message || "Có lỗi xảy ra (có thể đã hết số lượng)."}`);
    } finally {
      setRedeemingId(null);
    }
  };

  // --- Render components ---
  if (loading && myVoucherList.length === 0 && catalogList.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Đang tải...
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 mt-8 py-20">{error}</p>;
  }

  return (
    <div className="py-12 max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-4">
        Voucher & Đổi Thưởng
      </h2>
      <p className="text-center text-gray-700 mb-8 text-xl font-medium">
        Điểm hiện tại của bạn: <span className="text-orange-600 font-bold">{points}</span>
      </p>

      {/* 💡 THANH TABS */}
      <div className="flex justify-center border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('redeem')}
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === 'redeem'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đổi Thưởng
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-3 text-lg font-medium ${
            activeTab === 'my'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Voucher Của Tôi ({myVoucherList.length})
        </button>
      </div>

      {/* 💡 NỘI DUNG TAB ĐỔI THƯỞNG */}
      {activeTab === 'redeem' && (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {catalogList.map((v) => {
              const canRedeem = points >= v.points_cost;
              const isLoading = redeemingId === v.id;
              
              return (
                <div key={v.id} /* ... (Card đổi thưởng như cũ) ... */ >
                  {/* ... (Giữ nguyên code card đổi thưởng của bạn) ... */}
                   <div
                    key={v.id}
                    className={`border rounded-2xl overflow-hidden bg-white shadow-sm transition ${!canRedeem ? 'opacity-70 bg-gray-50' : 'hover:shadow-md'}`}
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                      <span className="text-white text-6xl opacity-80">🎁</span>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-lg text-gray-900">{v.name}</h3>
                      <p className="text-sm text-gray-600 h-10 my-2">{v.description || "Voucher giảm giá"}</p>
                      <p className="text-red-700 font-bold text-xl mt-2">
                        {v.points_cost} điểm
                      </p>
                       {/* 💡 Hiển thị số lượng còn lại */}
                       {v.total_quantity !== null && (
                        <p className="text-xs text-gray-500 mt-1">
                          Còn lại: {v.total_quantity - v.redeemed_count}
                        </p>
                      )}
                      <button
                        onClick={() => handleRedeem(v)}
                        disabled={!canRedeem || isLoading}
                        className={`mt-4 px-4 py-2 w-full text-white rounded-full font-semibold transition-all ${isLoading ? 'bg-gray-400' : ''} ${!isLoading && canRedeem ? 'bg-amber-600 hover:bg-amber-700' : ''} ${!isLoading && !canRedeem ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? "Đang xử lý..." : (canRedeem ? "Đổi ngay" : "Không đủ điểm")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {catalogList.length === 0 && !loading && (
            <p className="text-center text-neutral-500 mt-8 py-20">
              Hiện chưa có vật phẩm nào để đổi.
            </p>
          )}
        </>
      )}
      
      {/* 💡 NỘI DUNG TAB VOUCHER CỦA TÔI */}
      {activeTab === 'my' && (
        <div className="space-y-4">
          {myVoucherList.map((r) => (
            <MyVoucherCard key={r.id} redemption={r} />
          ))}
          {myVoucherList.length === 0 && !loading && (
            <p className="text-center text-neutral-500 mt-8 py-20">
              Bạn chưa có voucher nào.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// 💡 Component Card Voucher Của Tôi
function MyVoucherCard({ redemption }) {
  const { Voucher: v, code, status, expires_at } = redemption;
  
  const isExpired = status === 'expired' || (expires_at && new Date(expires_at) < new Date());
  const isUsed = status === 'used';
  const isActive = status === 'active' && !isExpired;

  let statusText = "Khả dụng";
  let statusColor = "text-green-600 bg-green-100";
  if (isUsed) {
    statusText = "Đã sử dụng";
    statusColor = "text-gray-600 bg-gray-100";
  } else if (isExpired) {
    statusText = "Đã hết hạn";
    statusColor = "text-red-600 bg-red-100";
  }

  if (!v) return null; // Trường hợp voucher gốc đã bị xóa

  const discountText = v.discount_type === 'fixed'
    ? `Giảm ${Number(v.discount_value).toLocaleString('vi-VN')}đ`
    : `Giảm ${v.discount_value}%`;

  return (
    <div className={`flex flex-col md:flex-row rounded-lg bg-white shadow-sm border ${isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
      <div className="flex-shrink-0 flex items-center justify-center p-6 md:w-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-lg md:rounded-l-lg md:rounded-r-none">
        <FaTicketAlt className="text-white text-6xl" />
      </div>
      <div className="flex-grow p-5">
        <h3 className="text-xl font-semibold text-gray-900">{v.name}</h3>
        <p className="text-gray-600 mt-1">{discountText} {v.max_discount ? `(tối đa ${Number(v.max_discount).toLocaleString('vi-VN')}đ)` : ''}</p>
        <p className="text-sm text-gray-500 mt-1">Đơn tối thiểu: {Number(v.min_order).toLocaleString('vi-VN')}đ</p>
        <p className="text-sm text-gray-500">HSD: {expires_at ? new Date(expires_at).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center justify-center p-5 border-t md:border-t-0 md:border-l border-gray-100 md:w-64">
        <p className="text-sm text-gray-600 mb-2">Mã của bạn:</p>
        <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <span className="font-bold text-lg text-indigo-700 tracking-wider">{code}</span>
        </div>
        <span className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}