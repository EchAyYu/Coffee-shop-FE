import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function ProductDetail(){
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [size, setSize] = useState('M')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setP(r.data))
  }, [id])

  if (!p) return <div className="container-lg py-8">Đang tải...</div>

  const price = p.prices?.[size] || 0

  return (
    <section className="container-lg py-8 grid md:grid-cols-2 gap-6">
      <img src={p.image} alt={p.name} className="w-full h-80 object-cover rounded-2xl"/>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <div className="mt-2 opacity-80">{p.description}</div>
        <div className="mt-4">
          <label className="mr-3">Size:</label>
          {['S','M','L'].map(s => (
            <button key={s} onClick={()=>setSize(s)} className={"px-3 py-1 mr-2 rounded border " + (s===size ? "bg-gold/20 border-gold" : "border-cream")}>{s}</button>
          ))}
        </div>
        <div className="mt-3">
          <label className="mr-3">Số lượng:</label>
          <input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} className="border rounded px-3 py-1 w-24"/>
        </div>
        <div className="mt-4 text-xl font-semibold">{(price * qty).toLocaleString()}đ</div>
        <button className="btn mt-3">Thêm vào giỏ</button>
      </div>
    </section>
  )
}