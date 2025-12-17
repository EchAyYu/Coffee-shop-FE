import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaSeedling, FaUserTie, FaHeart } from 'react-icons/fa';

export default function AboutPage() {
  const DEST_ADDRESS = "326A Nguyễn Văn Linh, An Khánh, Ninh Kiều, Cần Thơ Vietnam";

  const [destCoords, setDestCoords] = useState(null); // { lat, lon }
  const [userCoords, setUserCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geocodingError, setGeocodingError] = useState(null);

  // helper to geocode the DEST_ADDRESS and set `destCoords` (returns coords or null)
  const geocodeAddress = async () => {
    try {
      const q = encodeURIComponent(DEST_ADDRESS);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`;
      const r = await fetch(url);
      const arr = await r.json();
      if (Array.isArray(arr) && arr.length > 0) {
        const first = arr[0];
        const coords = { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
        setDestCoords(coords);
        setGeocodingError(null);
        return coords;
      } else {
        setGeocodingError('Không tìm thấy vị trí trên bản đồ.');
        return null;
      }
    } catch (e) {
      console.error('Geocoding failed', e);
      setGeocodingError('Không thể truy vấn dịch vụ địa chỉ.');
      return null;
    }
  };

  useEffect(() => {
    // initial geocode attempt
    geocodeAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const haversineKm = (a, b) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  const locateAndCompute = async () => {
    setGeoError(null);
    setDistanceKm(null);
    if (!navigator.geolocation) {
      setGeoError('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserCoords(uc);
        let dc = destCoords;
        if (!dc) {
          // try to geocode now if not available
          dc = await geocodeAddress();
        }
        if (dc) {
          const d = haversineKm(uc, dc);
          setDistanceKm(d);
        } else {
          setGeoError('Chưa xác định được vị trí đích, vui lòng thử lại sau.');
        }
      },
      (err) => {
        console.error('Geolocation error', err);
        setGeoError(err.message || 'Không thể lấy vị trí người dùng.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const features = [
    {
      icon: <FaSeedling />,
      title: "Nguồn gốc tinh túy",
      description: "Sử dụng 100% hạt cà phê Arabica Cầu Đất và Robusta Buôn Ma Thuột thượng hạng.",
      bgClass: "bg-green-100 dark:bg-green-900/30 text-green-600"
    },
    {
      icon: <FaUserTie />,
      title: "Barista Nghệ sĩ",
      description: "Đội ngũ pha chế được đào tạo bài bản, đặt cả tâm huyết vào từng ly cà phê.",
      bgClass: "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
    },
    {
      icon: <FaHeart />,
      title: "Phục vụ từ tâm",
      description: "Không chỉ bán cà phê, chúng tôi trao gửi sự tận tâm và trải nghiệm hạnh phúc.",
      bgClass: "bg-red-100 dark:bg-red-900/30 text-red-600"
    }
  ];

  const storeInfo = [
    { icon: FaMapMarkerAlt, text: "326A Nguyễn Văn Linh, An Khánh, Ninh Kiều, Cần Thơ Vietnam", label: "Địa chỉ" },
    { icon: FaClock, text: "06:00 - 23:30 (Mở cửa hàng ngày)", label: "Giờ mở cửa" },
    { icon: FaPhoneAlt, text: "0292 3943 516", label: "Hotline" },
    { icon: FaEnvelope, text: "hauhayho2929@gmail.com", label: "Email" },
  ];

  return (
    <div className="pb-16 space-y-20">
      
      {/* =========================================
          🎬 1. HERO SECTION (VIDEO BACKGROUND)
      ========================================= */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl">
        {/* VIDEO NỀN: Hạt cà phê rang xay (Slow motion) */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source 
            src="public/images/coffee-shop-about-page.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70"></div>

        {/* Nội dung */}
        <div className="relative z-10 text-center px-4 text-white animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-4">
            Our Story
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Câu Chuyện <span className="text-orange-500">Cà Phê</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Hành trình mang hương vị cà phê Việt nguyên bản đến với những người sành thưởng thức.
          </p>
        </div>
      </section>


      {/* =========================================
          📖 2. STORY & VALUES
      ========================================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Cột Văn bản */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Đam mê khởi nguồn từ <br />
              <span className="text-orange-600 decoration-4 underline decoration-orange-200 dark:decoration-orange-900">chất lượng hạt</span>.
            </h2>
            
            <div className="text-lg text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed text-justify">
              <p>
                Tại <strong>LO COFFEE</strong>, chúng tôi tin rằng mỗi ly cà phê đều mang một linh hồn riêng. Đó là câu chuyện mồ hôi của người nông dân trên đồi cao nguyên, là sự tỉ mỉ của người thợ rang xay, và là nghệ thuật của những barista tài hoa.
              </p>
              <p>
                Sứ mệnh của chúng tôi không chỉ là bán một thức uống, mà là kết nối những câu chuyện đó để mang đến cho bạn một trải nghiệm trọn vẹn nhất - nơi hương vị đậm đà hòa quyện cùng không gian đầy cảm hứng.
              </p>
            </div>

            {/* Chữ ký hoặc Quote */}
            <div className="border-l-4 border-orange-500 pl-4 italic text-gray-500 dark:text-gray-400">
              "Cà phê không chỉ là thức uống, nó là một phần của cuộc sống."
            </div>
          </div>

          {/* Cột Cards (Features) */}
          <div className="grid gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group flex items-start gap-5 p-6 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-full grid place-items-center text-2xl transition-colors ${feature.bgClass}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================
          📍 3. STORE INFO & MAP
      ========================================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 grid lg:grid-cols-5">
          
          {/* Thông tin liên hệ (Chiếm 2 phần) */}
          <div className="lg:col-span-2 p-10 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white dark:from-[#1a1a1a] dark:to-[#1E1E1E]">
            <span className="text-orange-600 font-bold tracking-widest uppercase text-xs mb-2">Visit Us</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Ghé thăm quán</h2>
            
            <div className="space-y-6">
              {storeInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                    <info.icon />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{info.label}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{info.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
               <button className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30 hover:bg-orange-700 transition-all">
                 Gọi đặt bàn ngay
               </button>
            </div>
          </div>
          
          {/* Bản đồ (Chiếm 3 phần) */}
          <div className="lg:col-span-3 relative min-h-[400px]">
            {/* Đây là ảnh giả lập bản đồ. Bạn có thể thay bằng iframe Google Maps thật */}
            <iframe
              src={
                destCoords
                  ? `https://www.google.com/maps?q=${destCoords.lat},${destCoords.lon}&z=17&output=embed`
                  : `https://www.google.com/maps?q=${encodeURIComponent(DEST_ADDRESS)}&z=15&output=embed`
              }
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(20%) contrast(1.2) opacity(0.9)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            ></iframe>
            
            {/* Độ dài/định vị: overlay control */}
            <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-black/70 p-3 rounded-lg border border-gray-100 shadow-md">
              <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                <strong>Địa chỉ:</strong>
                <div className="text-xs text-gray-500">{DEST_ADDRESS}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={locateAndCompute}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm"
                >
                  Tính khoảng cách
                </button>
                <button
                  onClick={() => { setDistanceKm(null); setUserCoords(null); setGeoError(null); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  Xóa
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {geocodingError && <div className="text-red-500">{geocodingError}</div>}
                {geoError && <div className="text-red-500">{geoError}</div>}
                {distanceKm != null && (
                  <div>Khoảng cách: <strong>{distanceKm < 1 ? `${Math.round(distanceKm*1000)} m` : `${distanceKm.toFixed(2)} km`}</strong></div>
                )}
                {userCoords && (
                  <div className="text-xs text-gray-500">Vị trí bạn: {userCoords.lat.toFixed(5)}, {userCoords.lon.toFixed(5)}</div>
                )}
              </div>
            </div>

            {/* Overlay gradient để map hòa vào nền */}
            <div className="absolute inset-0 pointer-events-none border-l border-gray-200 dark:border-gray-800"></div>
          </div>

        </div>
      </section>

    </div>
  );
}