import { Link } from 'react-router-dom'

export default function Hero(){
  return (
    <section className="relative">
      <img src="/images/hero.jpg" className="w-full h-[340px] object-cover" alt="hero"/>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/60 to-orange-900/60"></div>
      <div className="absolute inset-0 flex items-center">
        <div className="container-lg text-white">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full grid place-items-center text-xs">
                ☕
              </div>
              <span className="text-sm font-semibold">LO COFFEE</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Cà phê đậm vị – 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                Trải nghiệm đậm chất
              </span>
            </h1>
            
            <p className="text-lg text-gray-200 mb-6 leading-relaxed">
              Thức uống signature & bộ sưu tập Freeze – sẵn sàng cho một ngày bùng nổ năng lượng.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/menu" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🍽️ Khám phá Menu
              </Link>
              <Link 
                to="/booking" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 border border-white/30"
              >
                📅 Đặt bàn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}