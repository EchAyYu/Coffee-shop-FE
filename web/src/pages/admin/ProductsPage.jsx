import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/api";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    ten_mon:"", 
    gia:"", 
    id_dm:"", 
    anh:"",
    mo_ta: "",
    trang_thai: true,
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await getProducts();
      const list = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setItems(list || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const id = editing?.id ?? editing?.id_mon;
      
      const formData = new FormData();
      formData.append("ten_mon", form.ten_mon);
      formData.append("gia", Number(form.gia));
      formData.append("id_dm", Number(form.id_dm));
      formData.append("mo_ta", form.mo_ta);
      formData.append("trang_thai", form.trang_thai);
      
      if (imageFile) {
        formData.append("anh", imageFile);
      } else if (editing && form.anh) {
        formData.append("anh", form.anh);
      }

      if (editing) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      handleCancel(); // Reset form & state
      await load();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    
    setLoading(true);
    try {
      await deleteProduct(id);
      await load();
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
      anh: product.anh ?? "",
      mo_ta: product.mo_ta ?? "",
      trang_thai: product.trang_thai ?? true,
    });
    setImageFile(null); 
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ 
      ten_mon:"", 
      gia:"", 
      id_dm:"", 
      anh:"",
      mo_ta: "",
      trang_thai: true,
    });
    setImageFile(null); 
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Quản lý sản phẩm</h1>
          <p className="text-gray-600">Thêm, sửa và quản lý các sản phẩm trong cửa hàng</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
            {items.length} sản phẩm
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editing ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên sản phẩm
              </label>
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="Nhập tên sản phẩm"
                value={form.ten_mon} 
                onChange={e=>setForm({...form, ten_mon:e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá (₫)
              </label>
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="0" 
                type="number" 
                min="0"
                value={form.gia} 
                onChange={e=>setForm({...form, gia:e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ID Danh mục
              </label>
              <input 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                placeholder="1"
                value={form.id_dm} 
                onChange={e=>setForm({...form, id_dm:e.target.value})}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh
              </label>
              <input
                type="file"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => setImageFile(e.target.files[0])}
              />
            </div>
            
            <div className="md:col-span-2">
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              )}
              {!imageFile && form.anh && (
                <img src={form.anh} alt="Current" className="h-24 w-24 rounded-lg object-cover" />
              )}
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Mô tả ngắn về sản phẩm..."
                value={form.mo_ta}
                onChange={e => setForm({ ...form, mo_ta: e.target.value })}
                rows="3"
              ></textarea>
            </div>

            <div className="md:col-span-4 flex items-center gap-4">
               <label className="block text-sm font-semibold text-gray-700">
                Trạng thái
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.trang_thai}
                  onChange={e => setForm({ ...form, trang_thai: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900">
                  {form.trang_thai ? "Hiển thị" : "Ẩn"}
                </span>
              </label>
            </div>

            <div className="md:col-span-4 flex gap-3">
              <button 
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editing ? "Đang cập nhật..." : "Đang thêm..."}
                  </div>
                ) : (
                  editing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"
                )}
              </button>
              
              {editing && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Đang tải sản phẩm...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm đầu tiên để bắt đầu</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + Thêm sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên sản phẩm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(product => (
                  <tr key={product.id ?? product.id_mon} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      {(product.anh) ? (
                        <img 
                          src={product.anh} 
                          alt={product.ten_mon}
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200" 
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📦</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{product.ten_mon}</p>
                        <p className="text-sm text-gray-600">Sản phẩm</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {(Number(product.gia) || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        ID: {product.id_dm ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        {product.id ?? product.id_mon}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                          ✏️ Chỉnh sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id ?? product.id_mon)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                        >
                          🗑️ Xóa
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

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{items.length}</div>
              <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {items.reduce((sum, item) => sum + (Number(item.gia) || 0), 0).toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-sm text-gray-600">Tổng giá trị</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(items.reduce((sum, item) => sum + (Number(item.gia) || 0), 0) / items.length).toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-sm text-gray-600">Giá trung bình</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}