// ================================
// ☕ LO COFFEE - Customer Info (Đã thêm Lịch sử Đơn hàng & Đánh giá)
// ================================
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AddressFields from "../components/AddressFields";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";
import api from "../api/api"; // 💡 THÊM: Import API chính
import Swal from "sweetalert2"; // 💡 THÊM: Import thông báo

// 💡=============================================💡
// 💡===== COMPONENT CON 1: STAR RATING (INPUT) =====💡
// 💡=============================================💡
const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-4xl cursor-pointer ${
            star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
          } transition-colors`}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// 💡=============================================💡
// 💡===== COMPONENT CON 2: REVIEW MODAL (POP-UP) =====💡
// 💡=============================================💡
const ReviewModal = ({ product, orderId, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý gửi đánh giá
  const handleSubmitReview = async () => {
    if (rating === 0) {
      Swal.fire("Lỗi", "Vui lòng chọn số sao đánh giá.", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        id_mon: product.id_mon,
        id_don: orderId,
        diem: rating,
        noi_dung: comment,
      };
      // Gọi API POST /api/reviews
      await api.post("/reviews", payload);
      
      Swal.fire("Thành công!", "Cảm ơn bạn đã gửi đánh giá.", "success");
      onReviewSubmitted(product.id_mon); // Báo cho component cha cập nhật UI
      onClose(); // Đóng modal
    } catch (err) {
      Swal.fire(
        "Lỗi",
        err?.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            &times;
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <img
              src={product.anh || "https://placehold.co/100x100/F9F5EC/A1887F?text=O"}
              alt={product.ten_mon}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <p className="text-sm text-gray-500">Đánh giá cho món:</p>
              <p className="font-semibold text-gray-800">{product.ten_mon}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">1. Xếp hạng của bạn (bắt buộc):</label>
            <StarRatingInput rating={rating} setRating={setRating} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2. Viết bình luận (tùy chọn):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={250}
              placeholder="Bạn cảm thấy món ăn này thế nào?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{comment.length} / 250</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={loading}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300"
          >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 💡=============================================💡
// 💡===== COMPONENT CON 3: LỊCH SỬ ĐƠN HÀNG =====💡
// 💡=============================================💡
const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("completed"); // Mặc định xem đơn đã hoàn thành
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewStatusMap, setReviewStatusMap] = useState({});

  // 💡 SỬA LỖI: Yêu cầu cả "completed", "done", và "cancelled"
  const completedStatuses = "completed,done";
  const cancelledStatuses = "cancelled";

  // Lấy danh sách đơn hàng
  useEffect(() => {
    setLoading(true);
    // 💡 GỌI API: Lấy cả 3 trạng thái
    api.get(`/orders/my?status=${completedStatuses},${cancelledStatuses}`)
      .then(res => {
        setOrders(res.data?.data || []);
      })
      .catch(err => {
        console.error("Lỗi tải lịch sử đơn hàng:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Lấy trạng thái đánh giá khi đơn hàng được tải
  useEffect(() => {
    if (orders.length === 0) return;

    const fetchReviewStatuses = async () => {
      const newStatusMap = { ...reviewStatusMap };
      for (const order of orders) {
        const status = (order.trang_thai || '').toLowerCase();
        // Chỉ fetch khi đơn hàng là 'completed' hoặc 'done'
        if (status === 'completed' || status === 'done') {
          try {
            const res = await api.get(`/reviews/order-status/${order.id_don}`);
            newStatusMap[order.id_don] = res.data?.data || {};
          } catch (err) {
            console.warn(`Lỗi tải trạng thái đánh giá cho đơn #${order.id_don}:`, err);
          }
        }
      }
      setReviewStatusMap(newStatusMap);
    };

    fetchReviewStatuses();
  }, [orders]); 

  // ... (Các hàm handleOpen/Close/Submit giữ nguyên) ...
  const handleOpenReviewModal = (product, orderId) => {
    setSelectedProduct({ ...product, orderId });
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };
  const handleReviewSubmitted = (id_mon) => {
    const orderId = selectedProduct?.orderId;
    if (!orderId) return;
    setReviewStatusMap(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [id_mon]: true, 
      }
    }));
  };

  // 💡 SỬA LỖI: Lọc bao gồm cả "done"
  const filteredOrders = orders.filter(o => {
    const status = (o.trang_thai || 'cancelled').toLowerCase();
    if (filter === 'completed') {
      return status === 'completed' || status === 'done';
    }
    return status === 'cancelled';
  });

  return (
    <div className="mt-8">
      {modalOpen && (
        <ReviewModal
          product={selectedProduct}
          orderId={selectedProduct?.orderId}
          onClose={handleCloseModal}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {/* Tabs */}
        <div className="p-4 border-b border-gray-200 flex space-x-2">
          <button
            onClick={() => setFilter('completed')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm ${filter === 'completed' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Đơn hàng đã hoàn thành
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm ${filter === 'cancelled' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Đơn hàng đã hủy
          </button>
        </div>

        {/* Danh sách đơn hàng */}
        {loading && <div className="p-6 text-center text-gray-500">Đang tải lịch sử đơn hàng...</div>}
        
        {!loading && filteredOrders.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Không có đơn hàng nào trong mục này.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <div key={order.id_don} className="p-5">
                {/* Header đơn hàng */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Đơn hàng #{order.id_don}</h4>
                    <p className="text-xs text-gray-500">
                      Ngày đặt: {new Date(order.ngay_dat).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng cộng</p>
                    <p className="font-bold text-lg text-red-700">
                      {Number(order.tong_tien).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
                
                {/* Danh sách món ăn trong đơn hàng */}
                <div className="space-y-4">
                  {order.OrderDetails?.map(detail => {
                    const isReviewed = reviewStatusMap[order.id_don]?.[detail.id_mon] || false;
                    const status = (order.trang_thai || '').toLowerCase();

                    return (
                      <div key={detail.id_ct || detail.id_mon} className="flex items-center gap-4">
                        <img
                          src={detail.Product?.anh || "https://placehold.co/100x100/F9F5EC/A1887F?text=O"}
                          alt={detail.Product?.ten_mon}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{detail.Product?.ten_mon}</p>
                          <p className="text-xs text-gray-500">Số lượng: {detail.so_luong}</p>
                        </div>
                        
                        {/* 💡 SỬA LỖI: Chỉ hiện nút khi là 'completed' hoặc 'done' */}
                        {(status === 'completed' || status === 'done') && (
                          <button
                            onClick={() => handleOpenReviewModal(detail.Product, order.id_don)}
                            disabled={isReviewed}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              isReviewed
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {isReviewed ? '✓ Đã đánh giá' : 'Viết đánh giá'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// 💡=============================================💡
// 💡===== COMPONENT CHÍNH: CUSTOMER INFO PAGE =====💡
// 💡=============================================💡
export default function CustomerInfoPage() {
  const { user, setUser, points } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    sdt: "",
    address: { street: "", ward: "", district: "", province: "Cần Thơ" },
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load hồ sơ chuẩn từ BE
  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await getCheckoutProfile();
        const d = res.data?.data;
        setForm({
          ho_ten: d?.user?.fullName || user.customer?.ho_ten || "",
          email: d?.user?.email || user.customer?.email || "",
          sdt: d?.user?.phone || user.customer?.sdt || "",
          address: {
            street: d?.address?.street || "",
            ward: d?.address?.ward || "",
            district: d?.address?.district || "",
            province: d?.address?.province || "Cần Thơ",
          },
        });
      } catch {
        setForm({
          ho_ten: user?.customer?.ho_ten || "",
          email: user?.customer?.email || "",
          sdt: user?.customer?.sdt || "",
          address: { street: "", ward: "", district: "", province: "Cần Thơ" },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateCheckoutProfile({
        fullName: form.ho_ten,
        phone: form.sdt,
        street: form.address.street,
        ward: form.address.ward,
        district: form.address.district,
        province: form.address.province,
      });

      setUser((cur) => ({
        ...cur,
        customer: {
          ...(cur.customer || {}),
          ho_ten: form.ho_ten,
          email: form.email,
          sdt: form.sdt,
          dia_chi: [form.address.street, form.address.ward, form.address.district, form.address.province]
            .filter(Boolean)
            .join(", "),
        },
      }));

      setSuccess("Cập nhật thông tin thành công!");
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  }

  // --- (Phần render loading và !user giữ nguyên) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa đăng nhập</h2>
        <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin cá nhân</p>
        <a
          href="/login"
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Đăng nhập ngay
        </a>
      </div>
    );
  }

  // --- (Các component con InfoItem, StatCard giữ nguyên) ---
  const InfoItem = ({ icon, label, value, iconBgColor, iconColor }) => (
    <div className="flex items-center p-4 bg-gray-50/70 rounded-xl border border-gray-100">
      <div
        className={`h-10 w-10 ${iconBgColor} rounded-lg grid place-items-center mr-4 flex-shrink-0`}
      >
        <span className={`${iconColor} text-lg`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-gray-800 mt-1 truncate">
          {value || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ label, value, color }) => (
    <div className={`text-center p-4 bg-white/60 rounded-lg border border-${color}-100 shadow-sm`}>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );

  const fullAddress = [form.address.street, form.address.ward, form.address.district, form.address.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* --- (Phần thông báo success/error giữ nguyên) --- */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">👤 Thông tin khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* --- (Phần render thông tin chính giữ nguyên) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div className="lg:col-span-1 lg:sticky top-28">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 grid place-items-center text-white font-bold text-4xl mx-auto mb-4 uppercase shadow-md">
              {(user.customer?.ho_ten || user.ten_dn || "U").charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 truncate">
              {user.customer?.ho_ten || user.ten_dn || "Khách hàng"}
            </h2>
            <p className="text-gray-500 text-sm mb-6 truncate">
              {user.customer?.email || user.email || <span className="italic">Chưa có email</span>}
            </p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-red-700 hover:bg-red-800 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ... (Form chỉnh sửa giữ nguyên) ... */}
                <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">Chỉnh sửa thông tin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="ho_ten"
                      type="text"
                      value={form.ho_ten}
                      onChange={(e) => change("ho_ten", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (không chỉnh tại đây)</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="sdt"
                      type="tel"
                      value={form.sdt}
                      onChange={(e) => change("sdt", e.target.value)}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                    <AddressFields
                      value={form.address}
                      onChange={(addr) => change("address", addr)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSuccess("");
                      setError("");
                    }}
                    className="w-full sm:w-auto flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 order-2 sm:order-1"
                  >
                    ❌ Hủy
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 order-1 sm:order-2"
                  >
                    💾 Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Thông tin chi tiết</h3>
                <div className="space-y-4">
                  <InfoItem icon="👤" label="Họ và tên" value={form.ho_ten} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                  <InfoItem icon="📧" label="Email" value={form.email} iconBgColor="bg-green-100" iconColor="text-green-600" />
                  <InfoItem icon="📱" label="Số điện thoại" value={form.sdt} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
                  <InfoItem icon="📍" label="Địa chỉ" value={fullAddress} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                  <InfoItem icon="🔑" label="Tên đăng nhập" value={user.ten_dn} iconBgColor="bg-red-100" iconColor="text-red-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- (Phần thống kê giữ nguyên) --- */}
      <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Thống kê tài khoản</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Loại tài khoản" value={user.role === "customer" ? "Khách hàng" : user.role} color="blue" />
          <StatCard
            label="Ngày tham gia"
            value={user.customer?.ngay_tao ? new Date(user.customer.ngay_tao).toLocaleDateString("vi-VN") : "—"}
            color="green"
          />
          <StatCard label="Điểm Tích Lũy" value={points || 0} color="orange" />
        </div>
      </div>
      
      {/* 💡=============================================💡 */}
      {/* 💡===== THÊM LỊCH SỬ ĐƠN HÀNG VÀO ĐÂY =====💡 */}
      {/* 💡=============================================💡 */}
      <div className="mt-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 text-center">Lịch sử Đơn hàng</h2>
        <p className="text-gray-600 text-center mb-8">Viết đánh giá cho các đơn hàng đã hoàn thành.</p>
        <MyOrders />
      </div>
    </div>
  );
}