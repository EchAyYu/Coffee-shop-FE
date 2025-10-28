import { useState, useEffect } from "react";
import { customers } from "../api/api";
import { useAuth } from "../context/AuthContext"; // Sử dụng context để lấy/cập nhật user

export default function CustomerInfoPage() {
  // Lấy user và hàm setUser từ context AuthProvider
  const { user, setUser } = useAuth();
  // State loading: bắt đầu true nếu chưa có user từ context (có thể đang load)
  const [loading, setLoading] = useState(!user);
  const [editing, setEditing] = useState(false); // State để bật/tắt chế độ sửa
  // State cho form chỉnh sửa, khởi tạo rỗng
  const [form, setForm] = useState({
    ho_ten: "",
    email: "",
    sdt: "", // Sử dụng 'sdt' cho khớp với model và logic cập nhật
    dia_chi: "",
  });
  const [error, setError] = useState(""); // State lưu thông báo lỗi
  const [success, setSuccess] = useState(""); // State lưu thông báo thành công

  // Hàm helper để cập nhật state 'form' từ dữ liệu 'user' trong context
  const updateFormFromUser = (currentUser) => {
    // Kiểm tra xem user có tồn tại và có object 'customer' lồng bên trong không
    if (currentUser?.customer) {
      setForm({
        ho_ten: currentUser.customer.ho_ten || "",
        email: currentUser.customer.email || "",
        sdt: currentUser.customer.sdt || "", // Đọc từ user.customer.sdt
        dia_chi: currentUser.customer.dia_chi || "",
      });
    } else {
      // Fallback: Nếu user.customer chưa có (ví dụ user mới đăng ký chưa có đủ data từ API /me)
      // Thử lấy thông tin cơ bản từ cấp ngoài của user object
      setForm({
        ho_ten: currentUser?.ho_ten || "", // Thường thì tên sẽ có ở ngoài
        email: currentUser?.email || "", // Email cũng có thể có ở ngoài
        sdt: currentUser?.sdt || "",
        dia_chi: currentUser?.dia_chi || "",
      });
    }
    // Dừng loading khi đã có dữ liệu để điền form (hoặc biết là không có)
    setLoading(false);
  };

  // Effect chạy khi component mount hoặc khi 'user' từ context thay đổi
  useEffect(() => {
    if (user) {
      // Nếu đã có user từ context, cập nhật form và dừng loading
      updateFormFromUser(user);
    } else {
      // Nếu chưa có user (có thể context đang load), đặt state loading thành true
      // Không cần gọi API /customers/me ở đây vì AuthContext đã xử lý việc fetch user
      setLoading(true);
    }
    // Dependency array chỉ cần 'user' vì mọi thứ khác phụ thuộc vào nó
  }, [user]);

  // Handler cho việc thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Cập nhật state 'form'
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler cho việc submit form cập nhật thông tin
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload
    setError(""); // Reset lỗi cũ
    setSuccess(""); // Reset thành công cũ
    setLoading(true); // Bắt đầu loading

    try {
      // Dữ liệu gửi lên API chính là state 'form' hiện tại
      const payload = { ...form };
      // Gọi API customers.update (thực chất là PUT /api/customers/me)
      // Lưu ý: response.data.customer có thể chưa phải là dữ liệu mới nhất HOẶC cấu trúc khác
      await customers.update(payload);
      // const updatedCustomerData = response.data.customer; // Không cần dùng trực tiếp nữa

      setSuccess("Cập nhật thông tin thành công!"); // Set thông báo thành công
      setEditing(false); // Tắt chế độ chỉnh sửa

      // --- SỬA LỖI CẬP NHẬT CONTEXT ---
      // Cập nhật context bằng dữ liệu TỪ FORM người dùng vừa submit
      setUser((currentUser) => {
        // Tạo object customer mới, giữ lại các trường không thay đổi
        // và ghi đè bằng dữ liệu MỚI NHẤT TỪ FORM
        const newCustomer = {
            ...(currentUser.customer || {}), // Giữ lại id_kh, diem,... nếu có
            ho_ten: form.ho_ten, // Lấy từ state form
            email: form.email,   // Lấy từ state form
            sdt: form.sdt,       // Lấy từ state form
            dia_chi: form.dia_chi // Lấy từ state form
        };
        // Trả về user object mới cho context
        return {
          ...currentUser, // Giữ lại id_tk, ten_dn, role
          customer: newCustomer // Thay thế object customer cũ bằng object mới đã merge
        };
      });
      // --- KẾT THÚC SỬA LỖI ---

    } catch (err) {
      // Xử lý lỗi từ API
      console.error("Error updating customer info:", err);
      // Hiển thị thông báo lỗi cho người dùng
      setError(err?.response?.data?.message || err.message || "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };

  // Handler cho nút Hủy (khi đang sửa)
  const handleCancel = () => {
    setEditing(false); // Tắt chế độ sửa
    updateFormFromUser(user); // Reset form về dữ liệu hiện tại trong context
    setError(""); // Xóa thông báo lỗi/thành công
    setSuccess("");
  };

  // == Render Loading ==
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

  // == Render Chưa đăng nhập ==
  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa đăng nhập</h2>
        <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin cá nhân</p>
        <a href="/login" className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          Đăng nhập ngay
        </a>
      </div>
    );
  }

  // == Render Trang Thông Tin Khách Hàng ==
  // Component InfoItem được định nghĩa bên trong để có thể truy cập user context
  const InfoItem = ({ icon, label, value, iconBgColor, iconColor }) => (
      <div className="flex items-center p-4 bg-gray-50/70 rounded-xl border border-gray-100">
         <div className={`h-10 w-10 ${iconBgColor} rounded-lg grid place-items-center mr-4 flex-shrink-0`}><span className={`${iconColor} text-lg`}>{icon}</span></div>
         <div className="flex-1 min-w-0"> {/* Thêm min-w-0 */}
           <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
           <p className="font-semibold text-gray-800 mt-1 truncate"> {/* Thêm truncate */}
             {value || <span className="text-gray-400 italic font-normal">Chưa cập nhật</span>}
           </p>
         </div>
      </div>
    );

   // Component StatCard được định nghĩa bên trong
   const StatCard = ({ label, value, color }) => (
      <div className={`text-center p-4 bg-white/60 rounded-lg border border-${color}-100 shadow-sm`}>
          <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
          <div className="text-xs text-gray-600 mt-1">{label}</div>
      </div>
    );


  return (
    <div className="max-w-4xl mx-auto py-8 px-4"> {/* Thêm padding ngang */}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">👤 Thông tin khách hàng</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {/* Thông báo Thành công/Lỗi */}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm"> ✅ {success} </div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"> ⚠️ {error} </div>}

      {/* Layout chính: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"> {/* Thêm items-start */}

        {/* Cột Trái: Profile Card */}
        <div className="lg:col-span-1 lg:sticky top-28"> {/* Làm sticky cột trái */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 grid place-items-center text-white font-bold text-4xl mx-auto mb-4 uppercase shadow-md">
              {(user.customer?.ho_ten || user.ten_dn || "U").charAt(0)}
            </div>
            {/* Tên hiển thị */}
            <h2 className="text-xl font-bold text-gray-900 mb-1 truncate"> {/* Thêm truncate */}
              {user.customer?.ho_ten || user.ten_dn || "Khách hàng"}
            </h2>
            {/* Email */}
            <p className="text-gray-500 text-sm mb-6 truncate">{/* Thêm truncate */}
              {user.customer?.email || user.email || <span className="italic">Chưa có email</span>}
            </p>
            {/* Nút Chỉnh sửa (chỉ hiện khi không editing) */}
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

        {/* Cột Phải: Information Card (Hiển thị hoặc Form Sửa) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"> {/* Tăng padding */}
            {editing ? (
              /* ===== FORM CHỈNH SỬA ===== */
              <form onSubmit={handleSubmit} className="space-y-5"> {/* Giảm space y */}
                <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-3">Chỉnh sửa thông tin</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Tăng gap x */}
                  {/* Input Họ tên */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                    <input name="ho_ten" type="text" value={form.ho_ten} onChange={handleInputChange} required
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"/>
                  </div>
                  {/* Input Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" value={form.email} onChange={handleInputChange} required
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"/>
                  </div>
                  {/* Input Số điện thoại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                    <input name="sdt" type="tel" value={form.sdt} onChange={handleInputChange} required
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"/>
                  </div>
                   {/* Input Địa chỉ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
                    <input name="dia_chi" type="text" value={form.dia_chi} onChange={handleInputChange} required
                           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 transition shadow-sm"/>
                  </div>
                </div>
                {/* Nút bấm */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4"> {/* Đổi thành flex-col trên mobile */}
                  <button type="submit" disabled={loading}
                          className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 order-1 sm:order-2">
                    {loading ? "Đang cập nhật..." : "💾 Lưu thay đổi"}
                  </button>
                  <button type="button" onClick={handleCancel}
                          className="w-full sm:w-auto flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 order-2 sm:order-1">
                    ❌ Hủy
                  </button>
                </div>
              </form>
            ) : (
              /* ===== HIỂN THỊ THÔNG TIN ===== */
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Thông tin chi tiết</h3>
                <div className="space-y-4">
                      <InfoItem icon="👤" label="Họ và tên" value={user.customer?.ho_ten} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
                      <InfoItem icon="📧" label="Email" value={user.customer?.email} iconBgColor="bg-green-100" iconColor="text-green-600" />
                      <InfoItem icon="📱" label="Số điện thoại" value={user.customer?.sdt} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
                      <InfoItem icon="📍" label="Địa chỉ" value={user.customer?.dia_chi} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
                      <InfoItem icon="🔑" label="Tên đăng nhập" value={user.ten_dn} iconBgColor="bg-red-100" iconColor="text-red-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info (Thống kê - Layout đẹp hơn) */}
       <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Thống kê tài khoản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <>
                    <StatCard label="Loại tài khoản" value={user.role === 'customer' ? 'Khách hàng' : user.role} color="blue"/>
                    {/* 💡 Sửa lỗi: Cần kiểm tra user.customer tồn tại trước khi truy cập ngay_tao */}
                    <StatCard label="Ngày tham gia" value={user.customer?.ngay_tao ? new Date(user.customer.ngay_tao).toLocaleDateString('vi-VN') : "—"} color="green"/>
                    <StatCard label="Trạng thái" value="Active" color="purple"/>
                  </>
            </div>
       </div>
    </div>
  );
}

