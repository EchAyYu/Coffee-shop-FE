// src/pages/admin/ProductsPage.jsx
// PHIÊN BẢN HOÀN CHỈNH (QUẢN LÝ DANH MỤC + URL ẢNH)

import { useEffect, useState } from "react";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory 
} from "../../api/adminApi"; 
import { FaTrashAlt, FaPencilAlt, FaTimes } from "react-icons/fa";

// Helper định dạng tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

// ===============================
// 🔹 COMPONENT MODAL QUẢN LÝ DANH MỤC (MỚI)
// ===============================
function CategoryManagerModal({ onClose, categories, refreshCategories }) {
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null); // { id_dm: 1, ten_dm: 'Cà phê' }

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.ten_dm);
    } else {
      setName("");
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id_dm, { ten_dm: name });
      } else {
        await createCategory({ ten_dm: name });
      }
      setName("");
      setEditingCategory(null);
      refreshCategories(); // Tải lại danh sách
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này? Mọi sản phẩm thuộc danh mục này có thể bị lỗi.")) return;
    try {
      await deleteCategory(id);
      refreshCategories(); // Tải lại danh sách
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Quản lý Danh mục</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Thêm/Sửa */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {editingCategory ? "Đang sửa danh mục" : "Thêm danh mục mới"}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập tên danh mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              {editingCategory ? "Lưu" : "Thêm"}
            </button>
            {editingCategory && (
              <button type="button" onClick={() => setEditingCategory(null)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
                Hủy
              </button>
            )}
          </div>
        </form>

        {/* Danh sách */}
        <div className="p-5 border-t border-gray-200 max-h-80 overflow-y-auto">
          <h4 className="font-semibold text-gray-700 mb-3">Danh sách hiện có</h4>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id_dm} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">{cat.ten_dm}</span>
                  <span className="ml-2 text-sm text-gray-500">(ID: {cat.id_dm})</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setEditingCategory(cat)} className="text-blue-600 hover:text-blue-800" title="Sửa">
                    <FaPencilAlt />
                  </button>
                  <button onClick={() => handleDelete(cat.id_dm)} className="text-red-600 hover:text-red-800" title="Xóa">
                    <FaTrashAlt />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


// ===============================
// 🔹 COMPONENT TRANG SẢN PHẨM CHÍNH
// ===============================
export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 💡 GỠ BỎ state file, QUAY LẠI "anh" (URL)
  const [form, setForm] = useState({ 
    ten_mon:"", 
    gia:"", 
    id_dm:"", 
    anh: "", // <-- Quay lại dùng ô "anh"
    mo_ta: "",
    trang_thai: true,
  });

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Tải cả sản phẩm và danh mục
  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      const productList = Array.isArray(productsRes.data?.data) ? productsRes.data.data : Array.isArray(productsRes.data) ? productsRes.data : [];
      setItems(productList);
      
      const categoryList = Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data : Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      setCategories(categoryList);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { loadData(); }, []);

  // Hàm tải lại danh mục (cho modal)
  async function refreshCategories() {
    try {
      const res = await getCategories();
      const categoryList = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setCategories(categoryList);
    } catch (error) {
      console.error("Lỗi tải lại danh mục:", error);
    }
  }

  // 💡 HÀM SUBMIT (GỬI JSON)
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    // Gửi object JSON đơn giản
    const submissionData = {
      ...form,
      gia: Number(form.gia),
      id_dm: Number(form.id_dm),
      trang_thai: Boolean(form.trang_thai),
    };

    try {
      const id = editing?.id ?? editing?.id_mon;
      if (editing) {
        await updateProduct(id, submissionData);
      } else {
        await createProduct(submissionData);
      }
      handleCancel();
      await loadData();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      alert(`Lỗi: ${error.message || "Không thể lưu sản phẩm"}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (product) => {
    setEditing(product);
    setForm({
      ten_mon: product.ten_mon ?? "",
      gia: product.gia ?? "",
      id_dm: product.id_dm ?? "",
      anh: product.anh ?? "", // <-- Set URL ảnh cũ
      mo_ta: product.mo_ta ?? "",
      trang_thai: product.trang_thai ?? true,
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      ten_mon:"", gia:"", id_dm:"", anh: "", mo_ta: "", trang_thai: true,
    });
    setShowForm(false);
  };

  // Helper tìm tên danh mục
  const getCategoryName = (id_dm) => {
    return categories.find(c => c.id_dm === id_dm)?.ten_dm || `ID: ${id_dm}`;
  };

  return (
    <div className="space-y-6">
      {/* Modal Quản lý Danh mục */}
      {showCategoryModal && (
        <CategoryManagerModal 
          onClose={() => setShowCategoryModal(false)}
          categories={categories}
          refreshCategories={refreshCategories}
        />
      )}

      {/* Header (đã thêm nút QL Danh mục) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Quản lý sản phẩm</h1>
          <p className="text-gray-600">Thêm, sửa và quản lý các sản phẩm trong cửa hàng</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
            {items.length} sản phẩm
          </div>
          
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-white hover:bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all duration-200 border border-gray-300"
          >
            Quản lý danh mục
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Form Thêm/Sửa */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editing ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
            </h2>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl"> × </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Hàng 1: Tên, Giá, Danh mục */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sản phẩm (*)</label>
                <input 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="VD: Trà Đào Cam Sả"
                  value={form.ten_mon} 
                  onChange={e=>setForm({...form, ten_mon:e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giá (₫) (*)</label>
                <input 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                  placeholder="0" 
                  type="number" 
                  min="0"
                  value={form.gia} 
                  onChange={e=>setForm({...form, gia:e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục (*)</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  value={form.id_dm}
                  onChange={e => setForm({...form, id_dm: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id_dm} value={cat.id_dm}>
                      {cat.ten_dm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hàng 2: URL Ảnh và Mô tả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 💡 QUAY LẠI Ô NHẬP URL */}
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">URL Hình ảnh</label>
                 <input 
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
                   placeholder="https://example.com/image.jpg"
                   value={form.anh} 
                   onChange={e=>setForm({...form, anh:e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                 <textarea
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                   placeholder="Mô tả ngắn về sản phẩm..."
                   value={form.mo_ta}
                   onChange={e => setForm({ ...form, mo_ta: e.target.value })}
                   rows="3"
                 ></textarea>
               </div>
            </div>

            {/* Hàng 3: Trạng thái và Nút Bấm */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-semibold text-gray-700">Trạng thái</label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.trang_thai}
                    onChange={e => setForm({ ...form, trang_thai: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">
                    {form.trang_thai ? "Hiển thị" : "Ẩn"}
                  </span>
                </label>
              </div>
              <div className="flex gap-3">
                {editing && (
                  <button type="button" onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold">
                    Hủy
                  </button>
                )}
                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold shadow">
                  {loading ? (editing ? "Đang cập nhật..." : "Đang thêm...") : (editing ? "Lưu thay đổi" : "Thêm sản phẩm")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Bảng sản phẩm */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading && items.length === 0 ? (
          <div className="text-center p-12 text-gray-500">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-center p-12 text-gray-500">Chưa có sản phẩm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên sản phẩm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(product => (
                  <tr key={product.id ?? product.id_mon} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img 
                        src={product.anh || "https://placehold.co/100x100/F9F5EC/A1887F?text=O"} 
                        alt={product.ten_mon}
                        className="h-14 w-14 rounded-lg object-cover border border-gray-200" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{product.ten_mon}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600 text-sm">
                        {formatCurrency(product.gia)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* HIỂN THỊ TÊN DANH MỤC */}
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {getCategoryName(product.id_dm)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.trang_thai ? (
                         <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Hiển thị</span>
                      ) : (
                         <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">Ẩn</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <FaPencilAlt className="inline -mt-1 mr-1" /> Sửa
                        </button>
                        <button onClick={() => handleDelete(product.id ?? product.id_mon)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                          <FaTrashAlt className="inline -mt-1 mr-1" /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}