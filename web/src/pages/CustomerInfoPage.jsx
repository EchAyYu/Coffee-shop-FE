export default function CustomerInfoPage({ user }) {
  if (!user)
    return (
      <div className="text-center py-20 text-neutral-500">
        Bạn cần đăng nhập để xem thông tin cá nhân.
      </div>
    );

  return (
    <div className="max-w-lg mx-auto py-12 bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
      <p><strong>Họ tên:</strong> {user.ho_ten || user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Địa chỉ:</strong> {user.dia_chi || user.address}</p>
      <p><strong>SĐT:</strong> {user.sdt || user.phone}</p>
    </div>
  );
}
