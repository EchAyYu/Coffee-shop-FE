import { useEffect, useState } from "react";
import { getProducts } from "../../api/product";        // dùng module bạn đã tách
import { createProduct, updateProduct, deleteProduct } from "../../api/product";

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name:"", price:"", categoryId:"", imageUrl:"" });
  const [editing, setEditing] = useState(null);

  async function load() {
    const res = await getProducts();
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data;
    setItems(list || []);
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const id = editing?.id ?? editing?.id_mon;
    if (editing) await updateProduct(id, form);
    else await createProduct(form);
    setForm({ name:"", price:"", categoryId:"", imageUrl:"" });
    setEditing(null);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Products</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-4 gap-3 border rounded p-4">
        <input className="border px-2 py-1 col-span-2" placeholder="Name"
               value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="border px-2 py-1" placeholder="Price" type="number" min="0"
               value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <input className="border px-2 py-1" placeholder="Category ID"
               value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})}/>
        <input className="border px-2 py-1 col-span-3" placeholder="Image URL"
               value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})}/>
        <button className="border px-3 py-1 rounded">{editing ? "Update" : "Create"}</button>
        {editing && (
          <button type="button" className="border px-3 py-1 rounded"
                  onClick={()=>{ setEditing(null); setForm({ name:"", price:"", categoryId:"", imageUrl:"" }); }}>
            Cancel
          </button>
        )}
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">ID</th><th>Name</th><th>Price</th><th>Img</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(p=>(
            <tr key={p.id ?? p.id_mon} className="border-t">
              <td className="p-2">{p.id ?? p.id_mon}</td>
              <td>{p.name ?? p.ten_mon}</td>
              <td>{(Number(p.price ?? p.gia)||0).toLocaleString()}</td>
              <td>{(p.imageUrl ?? p.anh) ? <img src={p.imageUrl ?? p.anh} className="h-10" /> : "-"}</td>
              <td className="space-x-2">
                <button className="underline" onClick={()=>{
                  setEditing(p);
                  setForm({
                    name: p.name ?? p.ten_mon ?? "",
                    price: p.price ?? p.gia ?? "",
                    categoryId: p.categoryId ?? p.id_dm ?? "",
                    imageUrl: p.imageUrl ?? p.anh ?? "",
                  });
                }}>Edit</button>
                <button className="underline" onClick={async ()=>{
                  await deleteProduct(p.id ?? p.id_mon);
                  load();
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
