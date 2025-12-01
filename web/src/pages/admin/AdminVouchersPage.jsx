// src/pages/admin/AdminVouchersPage.jsx

import { useEffect, useState } from "react";
import { vouchersAdmin } from "../../api/adminApi";
import { FaTrashAlt, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    code_prefix: "VCH",
    discount_type: "fixed",
    discount_value: "",
    points_cost: "",
    min_order: 0,
    max_discount: "",
    expires_at: "",
    total_quantity: "",
    active: true,
  });

  // ===== FETCH LIST =====
  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await vouchersAdmin.getAll();
      setVouchers(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi tải voucher:", err);
      setError(err.message || "Không thể tải danh sách voucher.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // ===== FORM HANDLERS =====
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Tạo mới voucher
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.discount_value || !form.points_cost) {
    toast.error("Tên, Giá trị giảm và Phí điểm là bắt buộc.");
    return;
  }

  setIsSubmitting(true);
  try {
    const dataToSubmit = {
      ...form,
      // Giữ discount_value là số cho chắc
      discount_value: parseFloat(form.discount_value),
      // ❌ KHÔNG parseInt nữa, để nguyên string
      points_cost: form.points_cost,

      min_order: parseFloat(form.min_order || 0),
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      expires_at: form.expires_at ? new Date(form.expires_at) : null,
      total_quantity: form.total_quantity
        ? parseInt(form.total_quantity)
        : null,
    };

    await vouchersAdmin.create(dataToSubmit);
    toast.success("Tạo voucher thành công!");
    await fetchVouchers();
    setShowForm(false);
    setForm({
      name: "",
      description: "",
      code_prefix: "VCH",
      discount_type: "fixed",
      discount_value: "",
      points_cost: "",
      min_order: 0,
      max_discount: "",
      expires_at: "",
      total_quantity: "",
      active: true,
    });
  } catch (err) {
    console.error("Lỗi tạo voucher:", err);
    toast.error(`Lỗi khi tạo: ${err.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  // Xóa voucher
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa voucher này?")) return;
    try {
      await vouchersAdmin.delete(id);
      toast.success("Xóa voucher thành công!");
      await fetchVouchers();
    } catch (err) {
      console.error("Lỗi xóa voucher:", err);
      toast.error(`Lỗi khi xóa: ${err.message}`);
    }
  };

  // Bật/tắt trạng thái active
  const handleToggleActive = async (voucher) => {
    try {
      await vouchersAdmin.update(voucher.id, {
        active: !voucher.active,
      });
      toast.success(
        !voucher.active
          ? "Đã kích hoạt lại voucher."
          : "Đã vô hiệu hóa voucher."
      );
      await fetchVouchers();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái voucher:", err);
      toast.error("Không thể cập nhật trạng thái: " + err.message);
    }
  };

  const renderDiscount = (v) => {
    if (v.discount_type === "fixed") {
      return `${Number(v.discount_value).toLocaleString("vi-VN")}đ`;
    }
    return `${v.discount_value}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý Voucher Đổi Thưởng
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition-all ${
            showForm ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {showForm ? "Hủy" : "+ Tạo Voucher Mới"}
        </button>
      </div>

      {/* Form tạo mới */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 border rounded-lg bg-white shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Cột 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Voucher (*)
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="VD: Giảm 20K"
                className="p-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại giảm giá (*)
              </label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleFormChange}
                className="p-2 border rounded-md w-full bg-white"
              >
                <option value="fixed">Giảm cố định (VND)</option>
                <option value="percent">Giảm theo (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị giảm (*)
              </label>
              <input
                name="discount_value"
                value={form.discount_value}
                onChange={handleFormChange}
                type="number"
                placeholder="VD: 20000 hoặc 10"
                className="p-2 border rounded-md w-full"
                required
              />
            </div>

            {/* Cột 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phí điểm (*)
              </label>
              <input
                name="points_cost"
                value={form.points_cost}
                onChange={handleFormChange}
                type="number"
                placeholder="VD: 100"
                className="p-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn tối thiểu
              </label>
              <input
                name="min_order"
                value={form.min_order}
                onChange={handleFormChange}
                type="number"
                placeholder="VD: 50000"
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảm tối đa (cho %)
              </label>
              <input
                name="max_discount"
                value={form.max_discount}
                onChange={handleFormChange}
                type="number"
                placeholder="VD: 25000"
                className="p-2 border rounded-md w-full"
              />
            </div>

            {/* Cột 3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiền tố mã
              </label>
              <input
                name="code_prefix"
                value={form.code_prefix}
                onChange={handleFormChange}
                placeholder="VD: VCH"
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày hết hạn
              </label>
              <input
                name="expires_at"
                value={form.expires_at}
                onChange={handleFormChange}
                type="date"
                className="p-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng số lượng
              </label>
              <input
                name="total_quantity"
                value={form.total_quantity}
                onChange={handleFormChange}
                type="number"
                placeholder="Bỏ trống = vô hạn"
                className="p-2 border rounded-md w-full"
              />
            </div>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Mô tả (không bắt buộc)"
            className="p-2 border rounded-md w-full mt-4"
          />

          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Voucher"}
            </button>
            <div className="flex items-center">
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleFormChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Kích hoạt
              </label>
            </div>
          </div>
        </form>
      )}

      {/* LIST */}
      {loading && <div className="text-center py-10">Đang tải...</div>}
      {error && (
        <p className="text-center text-red-600 p-4 bg-red-100 rounded-lg">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Tên Voucher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Phí Điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Hết hạn
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {v.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {renderDiscount(v)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-orange-600">
                      {v.points_cost} điểm
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {v.redeemed_count} / {v.total_quantity || "∞"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(v)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        v.active
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {v.active ? (
                        <>
                          <FaToggleOn /> Kích hoạt
                        </>
                      ) : (
                        <>
                          <FaToggleOff /> Vô hiệu
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {v.expires_at
                      ? new Date(v.expires_at).toLocaleDateString("vi-VN")
                      : "Vĩnh viễn"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa voucher"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {vouchers.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              Chưa có voucher nào được tạo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
