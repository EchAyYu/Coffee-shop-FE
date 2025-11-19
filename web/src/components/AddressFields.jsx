import { useMemo } from "react";
import data from "../constants/cantho.json";

export default function AddressFields({ value, onChange, disabled = false }) {
  const districts = useMemo(() => Object.keys(data.districts), []);
  const wards = useMemo(() => data.districts[value.district] || [], [value.district]);

  const set = (k, v) => onChange({ ...value, [k]: v });

  // Style chung cho các ô input/select (Đã thêm Dark Mode & Focus màu Cam)
  const inputClass = "w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500";

  return (
    // 💡 SỬA LỖI: Xóa style cứng, dùng grid-cols-1 để xếp dọc gọn gàng trong sidebar
    <div className="grid grid-cols-1 gap-4">
      
      {/* Hàng 1: Tỉnh/Thành & Quận/Huyện */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tỉnh/Thành">
          <input 
            className={inputClass} 
            value={data.province} 
            disabled 
          />
        </Field>
        <Field label="Quận/Huyện">
          <select 
            className={inputClass} 
            disabled={disabled} 
            value={value.district || ""} 
            onChange={e => set("district", e.target.value)}
          >
            <option value="" disabled>Chọn quận</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      {/* Hàng 2: Phường/Xã (Full width để tên phường dài không bị cắt) */}
      <Field label="Phường/Xã">
        <select 
          className={inputClass} 
          disabled={disabled || !value.district} 
          value={value.ward || ""} 
          onChange={e => set("ward", e.target.value)}
        >
          <option value="" disabled>Chọn phường/xã</option>
          {wards.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </Field>

      {/* Hàng 3: Số nhà (Full width) */}
      <Field label="Số nhà, Tên đường">
        <input 
          className={inputClass} 
          disabled={disabled} 
          value={value.street || ""} 
          onChange={e => set("street", e.target.value)} 
          placeholder="VD: 123 Lý Tự Trọng" 
        />
      </Field>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}