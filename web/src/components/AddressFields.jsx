import { useMemo } from "react";
import data from "../constants/cantho.json";

export default function AddressFields({ value, onChange, disabled = false }) {
  const districts = useMemo(() => Object.keys(data.districts), []);
  const wards = useMemo(() => data.districts[value.district] || [], [value.district]);

  const set = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <Field label="Tỉnh/Thành">
        <input className="border rounded-xl px-3 py-2" value={data.province} disabled />
      </Field>
      <Field label="Quận/Huyện">
        <select className="border rounded-xl px-3 py-2" disabled={disabled} value={value.district || ""} onChange={e=>set("district", e.target.value)}>
          <option value="" disabled>Chọn quận/huyện</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      <Field label="Phường/Xã">
        <select className="border rounded-xl px-3 py-2" disabled={disabled || !value.district} value={value.ward || ""} onChange={e=>set("ward", e.target.value)}>
          <option value="" disabled>Chọn phường/xã</option>
          {wards.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </Field>
      <Field label="Số nhà, Tên đường">
        <input className="border rounded-xl px-3 py-2" disabled={disabled} value={value.street || ""} onChange={e=>set("street", e.target.value)} placeholder="VD: 123 Lý Tự Trọng" />
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </label>
  );
}
