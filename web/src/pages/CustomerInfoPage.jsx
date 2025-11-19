import { useEffect, useState, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import AddressFields from "../components/AddressFields";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";
import { uploadImage } from "../api/adminApi"; // Sử dụng lại hàm upload ảnh
import api from "../api/api"; 
import Swal from "sweetalert2";
import { Dialog, Transition } from '@headlessui/react';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPen, 
  FaHistory, FaCoins, FaCalendarAlt, FaChevronDown, FaChevronUp,
  FaAngleLeft, FaAngleRight, FaStar, FaTimes, FaCamera, FaSpinner, FaBoxOpen
} from "react-icons/fa";

// --- Helper Components ---
function FormInput({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input id={id} {...props} className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 py-2.5 px-3 transition-colors" />
    </div>
  );
}

// --- Review Modal ---
const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-3xl cursor-pointer transition-colors ${star <= (hoverRating || rating) ? "text-yellow-400 drop-shadow-sm" : "text-gray-300 dark:text-gray-600"}`} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}>★</span>
      ))}
    </div>
  );
};

const ReviewModal = ({ product, orderId, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) { Swal.fire("Lỗi", "Vui lòng chọn số sao.", "error"); return; }
    setLoading(true);
    try {
      await api.post("/reviews", { id_mon: product.id_mon, id_don: orderId, diem: rating, noi_dung: comment });
      Swal.fire({ icon: 'success', title: 'Đánh giá thành công!', confirmButtonColor: '#EA580C', timer: 2000 });
      onReviewSubmitted(product.id_mon); onClose();
    } catch (err) { Swal.fire("Lỗi", err?.response?.data?.message || "Lỗi gửi đánh giá.", "error"); } finally { setLoading(false); }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1E1E1E] p-6 shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between mb-4">
                <Dialog.Title className="text-xl font-bold dark:text-white">Đánh giá món ăn</Dialog.Title>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes/></button>
              </div>
              <div className="flex items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                <img src={product.anh} alt={product.ten_mon} className="w-16 h-16 rounded-lg object-cover"/>
                <div><p className="font-bold dark:text-white">{product.ten_mon}</p></div>
              </div>
              <div className="mb-6 text-center"><StarRatingInput rating={rating} setRating={setRating}/></div>
              <textarea value={comment} onChange={(e)=>setComment(e.target.value)} rows={3} className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Nhập bình luận..."/>
              <button onClick={handleSubmitReview} disabled={loading} className="mt-4 w-full py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-400">Gửi đánh giá</button>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- THẺ ĐƠN HÀNG RÚT GỌN (ACCORDION) ---
const OrderItem = ({ order, filter, onReview, reviewStatusMap }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
      {/* Header rút gọn: Ngày - Số món - Tổng tiền */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer bg-gray-50/50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-white/10 transition-colors gap-3"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Icon trạng thái */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filter === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
             {filter === 'completed' ? <FaHistory/> : <FaTimes/>}
          </div>
          <div>
            <p className="font-bold text-gray-800 dark:text-white text-lg">
              {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {order.OrderDetails?.length} món • {new Date(order.ngay_dat).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-14 sm:pl-0">
          <span className="font-bold text-orange-600 dark:text-orange-500 text-lg">
            {Number(order.tong_tien).toLocaleString('vi-VN')}đ
          </span>
          {isExpanded ? <FaChevronUp className="text-gray-400"/> : <FaChevronDown className="text-gray-400"/>}
        </div>
      </div>

      {/* Chi tiết (Ẩn/Hiện) */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] animate-fade-in">
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">
            Mã đơn: #{order.id_don}
          </p>

          <div className="space-y-3">
            {order.OrderDetails?.map(detail => {
               const isReviewed = reviewStatusMap[order.id_don]?.[detail.id_mon];
               return (
                <div key={detail.id_ct || detail.id_mon} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <img
                    src={detail.Product?.anh || "https://placehold.co/100"}
                    alt={detail.Product?.ten_mon}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {detail.Product?.ten_mon}
                    </p>
                    <p className="text-xs text-gray-500">x{detail.so_luong}</p>
                  </div>
                  
                  {filter === 'completed' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onReview(detail.Product, order.id_don); }}
                      disabled={isReviewed}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                        isReviewed 
                        ? "bg-gray-100 text-gray-400 border-transparent cursor-default"
                        : "bg-white dark:bg-transparent text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900/20"
                      }`}
                    >
                      {isReviewed ? "Đã đánh giá" : "Đánh giá"}
                    </button>
                  )}
                </div>
               );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Component: MyOrders (Có Phân trang) ---
const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("completed");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewStatusMap, setReviewStatusMap] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/my?status=completed,done,cancelled`)
      .then(res => setOrders(res.data?.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch review status
  useEffect(() => {
    if (orders.length === 0) return;
    const fetchReviewStatuses = async () => {
      const newStatusMap = { ...reviewStatusMap };
      for (const order of orders) {
        const status = (order.trang_thai || '').toLowerCase();
        if (status === 'completed' || status === 'done') {
          try {
            const res = await api.get(`/reviews/order-status/${order.id_don}`);
            newStatusMap[order.id_don] = res.data?.data || {};
          } catch (e) {}
        }
      }
      setReviewStatusMap(newStatusMap);
    };
    fetchReviewStatuses();
  }, [orders]);

  const filteredOrders = orders.filter(o => {
    const status = (o.trang_thai || 'cancelled').toLowerCase();
    return filter === 'completed' ? (status === 'completed' || status === 'done') : status === 'cancelled';
  });

  useEffect(() => setCurrentPage(1), [filter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReview = (product, orderId) => {
    if (reviewStatusMap[orderId]?.[product.id_mon]) return;
    setSelectedProduct({ ...product, orderId });
  };

  const handleReviewSubmitted = (id_mon) => {
    if (!selectedProduct?.orderId) return;
    setReviewStatusMap(prev => ({
      ...prev,
      [selectedProduct.orderId]: { ...prev[selectedProduct.orderId], [id_mon]: true }
    }));
  };

  return (
    <div className="mt-8">
      {selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          orderId={selectedProduct?.orderId}
          onClose={() => setSelectedProduct(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaHistory className="text-orange-600" /> Lịch sử đơn hàng
        </h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button onClick={() => setFilter('completed')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'completed' ? 'bg-white dark:bg-gray-600 text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Hoàn thành</button>
          <button onClick={() => setFilter('cancelled')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'cancelled' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đã hủy</button>
        </div>
      </div>

      {loading && <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>}
      
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có đơn hàng nào.</p>
        </div>
      )}

      <div className="space-y-3">
        {currentOrders.map(order => (
          <OrderItem 
            key={order.id_don} 
            order={order} 
            filter={filter}
            onReview={handleReview}
            reviewStatusMap={reviewStatusMap}
          />
        ))}
      </div>

      {/* Phân trang */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaAngleLeft/>
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaAngleRight/>
          </button>
        </div>
      )}
    </div>
  );
};


// --- Component Chính: CustomerInfoPage ---
export default function CustomerInfoPage() {
  const { user, setUser, points } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({ ho_ten: "", email: "", sdt: "", avatar: "", address: { street: "", ward: "", district: "", province: "Cần Thơ" } });

  // Thêm state hiển thị ngày tham gia
  const [joinDate, setJoinDate] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return setLoading(false);
      try {
        const res = await getCheckoutProfile();
        const d = res.data?.data;
        
        // Set ngày tham gia từ API hoặc user context
        const dateStr = d?.ngay_tham_gia || user.customer?.ngay_tao;
        setJoinDate(dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "Mới tham gia");

        setForm({
          ho_ten: d?.ho_ten || user.customer?.ho_ten || "",
          email: d?.email || user.customer?.email || "",
          sdt: d?.sdt || user.customer?.sdt || "",
          avatar: d?.avatar || user.avatar || "", 
          address: {
            street: d?.dia_chi?.split(", ")[0] || "", // Logic tách địa chỉ đơn giản (có thể cần cải thiện nếu format chặt chẽ hơn)
            ward: "", // Cần tách đúng nếu chuỗi địa chỉ gộp. Tạm thời để trống nếu API không trả về object address
            district: "", 
            province: "Cần Thơ",
          },
        });
        
        // Nếu API trả về địa chỉ dạng chuỗi "123, P.An Khánh, Q.Ninh Kiều, Cần Thơ"
        if(d?.dia_chi) {
             const parts = d.dia_chi.split(", ").reverse();
             // parts[0] = Province, parts[1] = District, parts[2] = Ward, còn lại là street
             if(parts.length >= 3) {
                 setForm(prev => ({
                     ...prev,
                     address: {
                         province: parts[0] || "Cần Thơ",
                         district: parts[1] || "",
                         ward: parts[2] || "",
                         street: parts.slice(3).reverse().join(", ") || ""
                     }
                 }));
             }
        }

      } catch {
        // Fallback
        setForm({
          ho_ten: user?.customer?.ho_ten || "", email: user?.customer?.email || "",
          sdt: user?.customer?.sdt || "", avatar: user.avatar || "",
          address: { street: "", ward: "", district: "", province: "Cần Thơ" },
        });
      } finally { setLoading(false); }
    })();
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadImage(file); 
      if (res && res.url) {
        setForm(prev => ({ ...prev, avatar: res.url }));
        setEditing(true); // Bật chế độ edit để user bấm lưu
      }
    } catch (err) { Swal.fire("Lỗi", "Không thể tải ảnh lên.", "error"); } finally { setAvatarUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await updateCheckoutProfile({
        fullName: form.ho_ten, phone: form.sdt,
        street: form.address.street, ward: form.address.ward,
        district: form.address.district, province: form.address.province,
        avatar: form.avatar,
      });
      // Cập nhật Context
      setUser((cur) => ({ 
          ...cur, 
          avatar: form.avatar, 
          customer: { ...cur.customer, ho_ten: form.ho_ten, sdt: form.sdt } 
      }));
      Swal.fire("Thành công", "Đã lưu thông tin!", "success"); setEditing(false);
    } catch (err) { Swal.fire("Lỗi", "Cập nhật thất bại", "error"); } finally { setLoading(false); }
  };

  if (!user) return <div className="text-center py-20 dark:text-white">Vui lòng đăng nhập.</div>;
  if (loading) return <div className="text-center py-20 dark:text-white">Đang tải hồ sơ...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 min-h-screen">
      {/* Header Card */}
      <div className="relative bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 mb-10 shadow-xl text-white flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        {/* Avatar Section */}
        <div className="relative group z-10">
          <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
            <img 
              src={form.avatar || "https://placehold.co/200x200?text=User"} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-4 border-white/50"
            />
          </div>
          {/* Nút Camera upload */}
          <label className={`absolute bottom-1 right-1 bg-white text-orange-600 p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-all ${avatarUploading ? 'cursor-wait' : ''}`}>
             {avatarUploading ? <FaSpinner className="animate-spin text-lg" /> : <FaCamera className="text-lg" />}
             <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={avatarUploading} />
          </label>
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1">{user.customer?.ho_ten || user.ten_dn}</h1>
          <p className="opacity-90 flex items-center justify-center md:justify-start gap-2 text-sm">
            <FaEnvelope/> {user.customer?.email || user.email}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
             <div className="bg-black/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10">
               <FaUser/> {user.role === "customer" ? "Thành viên" : user.role}
             </div>
             <div className="bg-black/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10">
               <FaCalendarAlt/> Tham gia: {joinDate}
             </div>
          </div>
        </div>

        <div className="relative z-10 bg-white/20 backdrop-blur-md p-4 rounded-2xl text-center min-w-[140px] border border-white/20">
           <p className="text-xs uppercase opacity-90 font-bold mb-1 tracking-wider">Điểm tích lũy</p>
           <p className="text-4xl font-extrabold flex items-center justify-center gap-1 text-yellow-300 drop-shadow-sm">
             <FaCoins/> {points || 0}
           </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Cột trái: Form Thông tin */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FaUser className="text-orange-500"/> Thông tin cá nhân
              </h3>
              <button onClick={() => setEditing(!editing)} className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                {editing ? "Hủy bỏ" : <><FaPen/> Chỉnh sửa</>}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput label="Họ tên" id="ho_ten" value={form.ho_ten} onChange={e => setForm({...form, ho_ten: e.target.value})} disabled={!editing} required />
              <FormInput label="Số điện thoại" id="sdt" type="tel" value={form.sdt} onChange={e => setForm({...form, sdt: e.target.value})} disabled={!editing} required />
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                 <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">Địa chỉ giao hàng</p>
                 {/* 💡 Bọc div để disable nếu không edit */}
                 <div className={!editing ? "opacity-70 pointer-events-none" : ""}>
                    <AddressFields value={form.address} onChange={addr => setForm({...form, address: addr})} />
                 </div>
              </div>

              {editing && (
                <button className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all">
                  Lưu thay đổi
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Cột phải: Lịch sử đơn hàng (Mới) */}
        <div className="lg:col-span-8">
          <MyOrders />
        </div>
      </div>
    </div>
  );
}