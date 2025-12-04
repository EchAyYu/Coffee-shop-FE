// src/pages/admin/AdminPromotions.jsx
import React, { useEffect, useState } from "react";
import {
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
  getCategories,
  getProducts,
} from "../../api/adminApi";

const emptyForm = {
  id_km: null,
  ten_km: "",
  mo_ta: "",
  hinh_anh: "",

  // ----- LOẠI KHUYẾN MÃI / PHẠM VI -----
  loai_km: "PERCENT",       // "PERCENT" | "FIXED_PRICE"
  pt_giam: 10,              // % nếu PERCENT
  gia_dong: "",             // giá đồng nếu FIXED_PRICE

  target_type: "ALL",       // "ALL" | "CATEGORY" | "PRODUCT"
  id_danh_muc: "",
  id_mon: "",

  // ----- THỜI GIAN -----
  ngay_bd: "",
  ngay_kt: "",
  lap_lai_thu: "",          // 1–7 hoặc ""
  gio_bd: "",
  gio_kt: "",

  // ----- HIỂN THỊ / CTA -----
  hien_thi: true,
  button_text: "",
  button_link: "",          // nếu để trống -> FE tự chọn
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
  return d.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
};

// Các đường dẫn CTA phổ biến
const CTA_LINK_OPTIONS = [
  { value: "", label: "Tự động chọn (/menu hoặc /register)" },
  { value: "/menu", label: "Trang Menu (/menu)" },
  { value: "/booking", label: "Đặt bàn (/booking)" },
  { value: "/rewards", label: "Đổi thưởng (/rewards)" },
  { value: "/register", label: "Đăng ký tài khoản (/register)" },
  { value: "__custom__", label: "Nhập đường dẫn khác..." },
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ dữ liệu từ DB
  const [categories, setCategories] = useState([]);
  const [products, setProductsState] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");

  // ========== LOAD PROMOTIONS ==========
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

  // ========== LOAD CATEGORIES + PRODUCTS ==========
  const fetchMeta = async () => {
    setMetaLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        getCategories(),
        getProducts(), // không truyền params -> lấy tất cả
      ]);

      const cats = Array.isArray(catRes.data?.data)
        ? catRes.data.data
        : Array.isArray(catRes.data)
        ? catRes.data
        : [];

      const prods = Array.isArray(prodRes.data?.data)
        ? prodRes.data.data
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : [];

      setCategories(cats);
      setProductsState(prods);
    } catch (err) {
      console.error("Lỗi tải categories/products:", err);
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchMeta();
  }, []);

  // ========== MODAL HANDLERS ==========
  const openCreateModal = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setIsModalOpen(true);
    setError("");
  };

  const openEditModal = (promo) => {
    setForm({
      id_km: promo.id_km,
      ten_km: promo.ten_km || "",
      mo_ta: promo.mo_ta || "",
      hinh_anh: promo.hinh_anh || "",

      loai_km: promo.loai_km || "PERCENT",
      pt_giam: promo.pt_giam ?? 10,
      gia_dong: promo.gia_dong ?? "",

      target_type: promo.target_type || "ALL",
      id_danh_muc: promo.id_danh_muc || "",
      id_mon: promo.id_mon || "",

      ngay_bd: toInputDate(promo.ngay_bd),
      ngay_kt: toInputDate(promo.ngay_kt),
      lap_lai_thu: promo.lap_lai_thu ?? "",
      gio_bd: promo.gio_bd || "",
      gio_kt: promo.gio_kt || "",

      hien_thi: Boolean(promo.hien_thi),
      button_text: promo.button_text || "",
      button_link: promo.button_link || "",
    });
    setIsEdit(true);
    setIsModalOpen(true);
    setError("");
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setForm(emptyForm);
    setError("");
  };

  // ========== FORM CHANGE ==========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "hien_thi") {
      setForm((prev) => ({ ...prev, hien_thi: checked }));
      return;
    }

    if (name === "pt_giam") {
      setForm((prev) => ({ ...prev, pt_giam: Number(value) || 0 }));
      return;
    }

    if (name === "gia_dong") {
      setForm((prev) => ({ ...prev, gia_dong: value === "" ? "" : Number(value) || 0 }));
      return;
    }

    if (name === "lap_lai_thu") {
      setForm((prev) => ({
        ...prev,
        lap_lai_thu: value === "" ? "" : Number(value),
      }));
      return;
    }

    if (name === "id_danh_muc" || name === "id_mon") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }

    if (name === "target_type") {
      // Khi đổi phạm vi -> reset id liên quan
      setForm((prev) => ({
        ...prev,
        target_type: value,
        id_danh_muc: value === "CATEGORY" ? prev.id_danh_muc : "",
        id_mon: value === "PRODUCT" ? prev.id_mon : "",
      }));
      return;
    }

    if (name === "button_link_select") {
      if (value === "__custom__") {
        // Giữ nguyên form.button_link để user tự gõ
        setForm((prev) => ({ ...prev }));
      } else {
        setForm((prev) => ({ ...prev, button_link: value }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // value cho select CTA
  const currentCtaSelectValue = (() => {
    const matchedPreset = CTA_LINK_OPTIONS.find(
      (opt) => opt.value && opt.value === form.button_link
    );
    if (!form.button_link) return "";
    if (matchedPreset) return matchedPreset.value;
    return "__custom__";
  })();

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
    const payload = {
      ten_km: form.ten_km,
      mo_ta: form.mo_ta,
      hinh_anh: form.hinh_anh,

      loai_km: form.loai_km,
      // FIX: nếu là đồng giá thì cho pt_giam = 0 để không vi phạm NOT NULL
      pt_giam: form.loai_km === "PERCENT" ? form.pt_giam : 0,
      gia_dong: form.loai_km === "FIXED_PRICE" ? form.gia_dong : null,

      target_type: form.target_type,
      id_danh_muc:
        form.target_type === "CATEGORY" ? form.id_danh_muc || null : null,
      id_mon: form.target_type === "PRODUCT" ? form.id_mon || null : null,

      ngay_bd: form.ngay_bd,
      ngay_kt: form.ngay_kt,
      lap_lai_thu: form.lap_lai_thu === "" ? null : form.lap_lai_thu,
      gio_bd: form.gio_bd || null,
      gio_kt: form.gio_kt || null,

      hien_thi: form.hien_thi,
      button_text: form.button_text || null,
      button_link: form.button_link || null,
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

  // ================== RENDER ==================
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
            đang hoạt động sẽ hiển thị ở trang chủ và tự động áp dụng vào giá.
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
                  <th className="px-4 py-3 text-left">Loại</th>
                  <th className="px-4 py-3 text-left">Phạm vi</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Lặp lại</th>
                  <th className="px-4 py-3 text-left">Hiển thị</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {promotions.map((promo) => (
                  <tr
                    key={promo.id_km}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40"
                  >
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
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      {promo.loai_km === "FIXED_PRICE"
                        ? `Đồng giá ${promo.gia_dong?.toLocaleString("vi-VN")}₫`
                        : `Giảm ${promo.pt_giam}%`}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      {promo.target_type === "ALL" && "Toàn bộ menu"}
                      {promo.target_type === "CATEGORY" &&
                        `Danh mục #${promo.id_danh_muc}`}
                      {promo.target_type === "PRODUCT" &&
                        `Món #${promo.id_mon}`}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                      {formatDate(promo.ngay_bd)} - {formatDate(promo.ngay_kt)}
                      {(promo.gio_bd || promo.gio_kt) && (
                        <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                          {promo.gio_bd || "--:--"} - {promo.gio_kt || "--:--"}
                        </div>
                      )}
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
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-50">
              {isEdit ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên + Mô tả */}
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
                  placeholder="VD: Thứ 6 đồng giá 20K, Giảm 20% đơn đầu tiên..."
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

              {/* Loại khuyến mãi + Giá / % */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Loại khuyến mãi
                  </label>
                  <select
                    name="loai_km"
                    value={form.loai_km}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  >
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED_PRICE">Đồng giá (VND)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    {form.loai_km === "FIXED_PRICE"
                      ? "Giá đồng (VND) *"
                      : "Phần trăm giảm (%) *"}
                  </label>
                  {form.loai_km === "FIXED_PRICE" ? (
                    <input
                      type="number"
                      name="gia_dong"
                      min={0}
                      value={form.gia_dong}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                      placeholder="VD: 20000"
                    />
                  ) : (
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
                  )}
                </div>
              </div>

              {/* Phạm vi áp dụng + ID danh mục/món (dropdown từ DB) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Phạm vi áp dụng
                  </label>
                  <select
                    name="target_type"
                    value={form.target_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  >
                    <option value="ALL">Tất cả menu</option>
                    <option value="CATEGORY">Theo danh mục</option>
                    <option value="PRODUCT">Theo món cụ thể</option>
                  </select>
                </div>

                {/* ID danh mục / món áp dụng */}
                <div>
                  {form.target_type === "CATEGORY" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Danh mục áp dụng
                      </label>
                     <select
                      name="id_danh_muc"
                      value={form.id_danh_muc || ""}
                      onChange={handleChange}
                      disabled={metaLoading}
                      size={Math.min(categories.length || 1, 6)} // hiện tối đa 6 dòng, có scrollbar
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm max-h-60 overflow-y-auto"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id_dm} value={cat.id_dm}>
                          #{cat.id_dm} — {cat.ten_dm}
                        </option>
                      ))}
                    </select>
                    </>
                  )}

                  {form.target_type === "PRODUCT" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        Món áp dụng
                      </label>
                      <select
                        name="id_mon"
                        value={form.id_mon || ""}
                        onChange={handleChange}
                        disabled={metaLoading}
                        size={Math.min(products.length || 1, 8)} // hiện tối đa 8 món, cuộn được
                        className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm max-h-72 overflow-y-auto"
                      >
                        <option value="">-- Chọn món --</option>
                        {products.map((p) => (
                          <option key={p.id_mon} value={p.id_mon}>
                            #{p.id_mon} — {p.ten_mon}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  {form.target_type === "ALL" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Khuyến mãi áp dụng cho toàn bộ menu.
                    </p>
                  )}
                </div>
              </div>

              {/* Ngày + Lặp lại + Giờ */}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    name="gio_bd"
                    value={form.gio_bd}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    name="gio_kt"
                    value={form.gio_kt}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nếu để trống, khuyến mãi áp dụng cả ngày.
                  </p>
                </div>
              </div>

              {/* Ảnh */}
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

              {/* CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Nhãn nút (CTA)
                  </label>
                  <input
                    type="text"
                    name="button_text"
                    value={form.button_text}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                    placeholder='VD: "Đăng ký ngay", "Xem menu ưu đãi"... (có thể để trống)'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Đường dẫn khi bấm
                  </label>
                  <select
                    name="button_link_select"
                    value={currentCtaSelectValue}
                    onChange={handleChange}
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm mb-2"
                  >
                    {CTA_LINK_OPTIONS.map((opt) => (
                      <option key={opt.value || "auto"} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {currentCtaSelectValue === "__custom__" && (
                    <input
                      type="text"
                      name="button_link"
                      value={form.button_link}
                      onChange={handleChange}
                      className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 text-sm"
                      placeholder="VD: /special-event, /member-only..."
                    />
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nếu để trống, hệ thống sẽ tự chọn /menu hoặc /register tùy
                    loại khuyến mãi.
                  </p>
                </div>
              </div>

              {/* Hiển thị */}
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
