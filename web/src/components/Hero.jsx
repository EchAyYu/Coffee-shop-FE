import { Link } from 'react-router-dom'

export default function Hero(){
  return (
    <section className="relative">
      <img src="/images/hero.jpg" className="w-full h-[340px] object-cover" alt="hero"/>
      <div className="absolute inset-0 bg-black/35"></div>
      <div className="absolute inset-0 flex items-center">
        <div className="container-lg text-cream">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Cà phê đậm vị – Trải nghiệm đậm chất</h1>
          <p className="max-w-xl mb-4">Thức uống signature & bộ sưu tập Freeze – sẵn sàng cho một ngày bùng nổ năng lượng.</p>
          <Link to="/menu" className="btn">Khám phá Menu</Link>
        </div>
      </div>
    </section>
  )
}