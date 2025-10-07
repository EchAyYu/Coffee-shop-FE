import { useEffect, useState } from 'react'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

export default function Menu() {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

 useEffect(() => {
    api.get("/products", { params: { category, q } })
       .then(r => setData(r.data))
       .catch(() => setData([]));
  }, [category, q]);

  return (
    <section className="container-lg py-8">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <div className="flex gap-3 mb-4">
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Tất cả</option>
          <option>Cà phê</option>
          <option>Trà</option>
          <option>Freeze</option>
        </select>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm đồ uống..." className="border rounded px-3 py-2 flex-1"/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}