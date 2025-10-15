import { useState, useEffect } from "react";
import { me } from "../api/api";

export default function CustomerInfo({ user }) {
  const [info, setInfo] = useState(user || null);

  useEffect(() => {
    if (!user) {
      me()
        .then((res) => setInfo(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  if (!info)
    return (
      <div className="text-center mt-10">
        <p>Bạn cần đăng nhập để xem thông tin cá nhân.</p>
      </div>
    );

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow">
      <h2 className="text-2xl font-semibold mb-4">Thông tin khách hàng</h2>
      <div className="space-y-3 text-sm">
        <div><strong>Họ tên:</strong> {info.ho_ten || info.fullName}</div>
        <div><strong>Email:</strong> {info.email}</div>
        <div><strong>SĐT:</strong> {info.sdt || info.phone}</div>
        <div><strong>Địa chỉ:</strong> {info.dia_chi || info.address}</div>
        <div><strong>Tài khoản:</strong> {info.ten_dn || info.username}</div>
      </div>
    </div>
  );
}
