import Hero from '../components/Hero'
import { useEffect, useState } from 'react'
import { api } from '../api'
import ProductCard from '../components/ProductCard'

export default function Home(){
  const [data, setData] = useState([])
  useEffect(() => {
    api.get('/products').then(r => setData(r.data))
  }, [])

  return (
    <div>
      <Hero />
      <section className="container-lg py-8">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.slice(0,8).map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  )
}