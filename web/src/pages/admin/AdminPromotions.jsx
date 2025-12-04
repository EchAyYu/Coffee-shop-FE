import React, { useEffect, useState } from "react";
import {
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
} from "/../../api/adminApi";

const emptyForm = {
  id_km: null,
  ten_km: "",
  mo_ta: "",
  hinh_anh: "",
  pt_giam: 10,
  ngay_bd: "",
  ngay_kt: "",
  lap_lai_thu: "", // 1-7 hoặc ""
  hien_thi: true,
};

const weekdayOptions = [
  { value: "", label: "Áp dụng tất cả các ngày" },
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
];

const weekdayLabel = (value) => {
  const opt = weekdayOptions.find((o) => String(o.value) === String(value));
  return opt ? opt.label : "";
};

const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
};

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const [error, setError] = useState("");

  const fetchPromotions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminPromotions();
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setPromotions(list);
    } catch (err) {
      console.error("Lỗi tải khuyến mãi:", err);
      setError("Không tải được danh sách khuyến mãi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const openCreateModal = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const openEditModal = (promo) => {
    setForm({
      id_km: promo.id_km,
      ten_km: promo.ten_km || "",
      mo_ta: promo.mo_ta || "",
      hinh_anh: promo.hinh_anh || "",
      pt_giam: promo.pt_giam ?? 10,
      ngay_bd: toInputDate(promo.ngay_bd),
      ngay_kt: toInputDate(promo.ngay_kt),
      lap_lai_thu: promo.lap_lai_thu ?? "",
      hien_thi: Boolean(promo.hien_thi),
    });
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "hien_thi") {
      setForm((prev) => ({ ...prev, hien_thi: checked }));
    } else if (name === "pt_giam") {
      setForm((prev) => ({ ...prev, pt_giam: Number(value) || 0 }));
    } else if (name === "lap_lai_thu") {
      setForm((prev) => ({
        ...prev,
        lap_lai_thu: value === "" ? "" : Number(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ten_km: form.ten_km,
        mo_ta: form.mo_ta,
        hinh_anh: form.hinh_anh,
        pt_giam: form.pt_giam,
        ngay_bd: form.ngay_bd,
        ngay_kt: form.ngay_kt,
        lap_lai_thu: form.lap_lai_thu === "" ? null : form.lap_lai_thu,
        hien_thi: form.hien_thi,
      };

      if (isEdit && form.id_km != null) {
        await updateAdminPromotion(form.id_km, payload);
        window.alert("Cập nhật khuyến mãi thành công.");
      } else {
        await createAdminPromotion(payload);
        window.alert("Tạo khuyến mãi thành công.");
      }

      await fetchPromotions();
      closeModal();
    } catch (err) {
      console.error("Lỗi lưu khuyến mãi:", err);
      setError("Không thể lưu khuyến mãi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (promo) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa "${promo.ten_km}"?`)) return;
    try {
      await deleteAdminPromotion(promo.id_km);
      window.alert("Đã xóa khuyến mãi.");
      await fetchPromotions();
    } catch (err) {
      console.error("Lỗi xóa khuyến mãi:", err);
      window.alert("Không thể xóa khuyến mãi.");
    }
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quản lý khuyến mãi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Thêm, chỉnh sửa và xóa các chương trình khuyến mãi. Các khuyến mãi
            đang hoạt động sẽ hiển thị ở trang chủ.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors"
        >
          + Thêm khuyến mãi
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 animate-pulse text-gray-400">
            Đang tải danh sách khuyến mãi...
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-6 text-gray-500 dark:text-gray-400 text-sm">
            Chưa có khuyến mãi nào. Nhấn{" "}
            <span className="font-semibold">“Thêm khuyến mãi”</span> để tạo mới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Tên khuyến mãi</th>
                  <th className="px-4 py-3 text-left">% Giảm</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Lặp lại</th>
                  <th className="px-4 py-3 text-left">Hiển thị</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {promotions.map((promo) => (
                  <tr key={promo.id_km} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {promo.ten_km}
                      </div>
                      {promo.mo_ta && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {promo.mo_ta}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                        {promo.pt_giam}%
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      <div>
                        {formatDate(promo.ngay_bd)} - {formatDate(promo.ngay_kt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      {weekdayLabel(promo.lap_lai_thu)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {promo.hien_thi ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          Đang hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(promo)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(promo)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400 border-t border-red-100 dark:border-red-900/40">
            {error}
          </div>
        )}
      </div>

      {/* Modal tạo/sửa khuyến mãi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl w-full max-w-xl p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-50">
              {isEdit ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Tên khuyến mãi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ten_km"
                  value={form.ten_km}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  placeholder="Ví dụ: Black Friday, Giảm 20% đơn đầu tiên..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="mo_ta"
                  value={form.mo_ta}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm resize-none"
                  placeholder="Thông tin chi tiết về chương trình khuyến mãi..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phần trăm giảm (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="pt_giam"
                    min={1}
                    max={100}
                    value={form.pt_giam}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Lặp lại theo thứ
                  </label>
                  <select
                    name="lap_lai_thu"
                    value={form.lap_lai_thu}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  >
                    {weekdayOptions.map((opt) => (
                      <option key={opt.value ?? "all"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Để trống hoặc chọn “Áp dụng tất cả các ngày” nếu khuyến mãi
                    áp dụng mọi ngày trong khoảng thời gian.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="ngay_bd"
                    value={form.ngay_bd}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="ngay_kt"
                    value={form.ngay_kt}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Ảnh (URL)
                </label>
                <input
                  type="text"
                  name="hinh_anh"
                  value={form.hinh_anh}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  placeholder="Link ảnh từ Cloudinary..."
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    name="hien_thi"
                    checked={form.hien_thi}
                    onChange={handleChange}
                    className="rounded border-gray-300 dark:border-gray-700 text-orange-600"
                  />
                  Hiển thị trên website
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : isEdit
                    ? "Cập nhật"
                    : "Tạo khuyến mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
