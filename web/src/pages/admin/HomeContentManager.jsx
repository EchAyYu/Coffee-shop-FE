import { useEffect, useState } from "react";
import { getHomeContents, createHomeContent, updateHomeContent, deleteHomeContent } from "../../api/homeContentApi";

function HomeContentManager() {
  const [contents, setContents] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", imageUrl: "", order: 0 });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getHomeContents();
    setContents(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateHomeContent(editId, formData);
    } else {
      await createHomeContent(formData);
    }
    setFormData({ title: "", description: "", imageUrl: "", order: 0 });
    setEditId(null);
    loadData();
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (confirm("Xóa nội dung này?")) {
      await deleteHomeContent(id);
      loadData();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Quản lý nội dung trang chủ</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className="form-control mb-2"
          placeholder="Tiêu đề"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Mô tả"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Link ảnh"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Thứ tự"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">
          {editId ? "Cập nhật" : "Thêm mới"}
        </button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
            <th>Thứ tự</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((item) => (
            <tr key={item.id}>
              <td><img src={item.imageUrl} width="80" /></td>
              <td>{item.title}</td>
              <td>{item.description}</td>
              <td>{item.order}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(item)}>Sửa</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HomeContentManager;
