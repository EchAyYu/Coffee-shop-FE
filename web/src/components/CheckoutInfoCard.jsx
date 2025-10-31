import { useEffect, useState } from "react";
import AddressFields from "./AddressFields";
import { getCheckoutProfile, updateCheckoutProfile } from "../api/profile";

export default function CheckoutInfoCard({ onSubmit }) {
  const [locked, setLocked] = useState(true);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [form, setForm] = useState({
    receiver_name: "", phone: "", emailInvoice: "", note: "",
    address: { street: "", ward: "", district: "", province: "Cần Thơ" }
  });

  useEffect(() => {
    (async () => {
      const { data } = await getCheckoutProfile();
      const d = data.data;
      setForm(f => ({
        ...f,
        receiver_name: d.user.fullName || "",
        phone: d.user.phone || "",
        address: {
          street: d.address.street || "",
          ward: d.address.ward || "",
          district: d.address.district || "",
          province: d.address.province || "Cần Thơ"
        }
      }));
    })();
  }, []);

  const change = (k, v) => setForm(s => ({ ...s, [k]: v }));

  async function submit() {
    if (!locked && saveToProfile) {
      await updateCheckoutProfile({
        fullName: form.receiver_name,
        phone: form.phone,
        street: form.address.street,
        ward: form.address.ward,
        district: form.address.district,
        province: form.address.province
      });
    }
    onSubmit({
      ho_ten_nhan: form.receiver_name,
      sdt_nhan: form.phone,
      dia_chi_nhan: `${form.address.street}, ${form.address.ward}, ${form.address.district}, ${form.address.province}`,
      email_nhan: form.emailInvoice,
      ghi_chu: form.note
    });
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thông tin nhận hàng</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!locked} onChange={e=>setLocked(!e.target.checked)} />
          <span>Thay đổi thông tin</span>
        </label>
      </div>

      <div className="grid gap-3 mt-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Họ tên người nhận</span>
          <input disabled={locked} className="border rounded-xl px-3 py-2" value={form.receiver_name} onChange={e=>change("receiver_name", e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Số điện thoại</span>
          <input disabled={locked} className="border rounded-xl px-3 py-2" value={form.phone} onChange={e=>change("phone", e.target.value)} />
        </label>

        <div>
          <div className="text-sm text-gray-600 mb-1">Địa chỉ nhận hàng</div>
          <AddressFields value={form.address} onChange={(addr)=>change("address", addr)} disabled={locked} />
        </div>

        {!locked && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={saveToProfile} onChange={e=>setSaveToProfile(e.target.checked)} />
            <span>Cập nhật vào hồ sơ</span>
          </label>
        )}

        <button onClick={submit} className="btn btn-primary mt-2">Xác nhận đặt hàng</button>
      </div>
    </div>
  );
}
