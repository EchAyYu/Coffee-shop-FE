export default function CustomerInfoPage({ user }) {
  if (!user) {
    return <p className="text-center text-neutral-600 mt-10">Vui lòng đăng nhập để xem thông tin khách hàng.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-semibold text-red-700 mb-6 text-center">Thông tin khách hàng</h2>
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        <div><strong>Họ tên:</strong> {user.ho_ten}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>SĐT:</strong> {user.sdt}</div>
        <div><strong>Địa chỉ:</strong> {user.dia_chi}</div>
      </div>
    </div>
  );
}
