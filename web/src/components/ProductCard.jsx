import { Link } from 'react-router-dom'

export default function ProductCard({ p }){
  const price = p.prices?.M || Object.values(p.prices || {})[0] || 0
  return (
    <div className="card overflow-hidden">
      <img src={p.image} alt={p.name} className="h-44 w-full object-cover" />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{p.name}</h3>
          {p.badges?.includes('signature') && <span className="badge">Signature</span>}
          {p.badges?.includes('bestseller') && <span className="badge">Bestseller</span>}
        </div>
        <div className="mt-1 text-sm opacity-80">{p.category}</div>
        <div className="mt-2 font-semibold">{price.toLocaleString()}đ</div>
        <Link to={`/product/${p.id}`} className="btn mt-3 inline-block">Xem chi tiết</Link>
      </div>
    </div>
  )
}