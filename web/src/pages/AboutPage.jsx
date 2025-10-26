import { MapPin, Phone, Mail, Clock } from 'lucide-react';

// Đây là trang "Về chúng tôi" đã được thiết kế lại
export default function AboutPage() {
  
  // Nội dung đã được chuyển từ HomePage
  const features = [
    {
      icon: "🌱",
      title: "Cà phê nguyên chất",
      description: "Chúng tôi sử dụng 100% cà phê Arabica và Robusta từ các trang trại uy tín tại Việt Nam.",
      color: "bg-amber-100 text-amber-700"
    },
    {
      icon: "👨‍🍳",
      title: "Barista chuyên nghiệp",
      description: "Đội ngũ barista được đào tạo bài bản, tạo ra những ly cà phê hoàn hảo.",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: "❤️",
      title: "Phục vụ tận tâm",
      description: "Chúng tôi cam kết mang đến trải nghiệm tuyệt vời nhất cho mỗi khách hàng.",
      color: "bg-blue-100 text-blue-700"
    }
  ];

  const storeInfo = [
    { icon: MapPin, text: "123 Đường ABC, Quận XYZ, TP.HCM" },
    { icon: Clock, text: "6:00 - 22:00 (Hàng ngày)" },
    { icon: Phone, text: "0123 456 789" },
    { icon: Mail, text: "info@locoffee.com" },
  ];

  return (
    <div className="space-y-16 py-12">
      
      {/* === Hero Section === */}
      <section className="relative h-[400px] rounded-3xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1511920183273-9218d7b38e78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNTU2fDB8MHwxfGFsbHx8fHx8fHx8fDE3MzAxMjU1NTh8&ixlib=rb-4.0.3&q=80&w=1200"
          alt="Không gian quán LO COFFEE"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-6">
          <span className="text-lg font-semibold text-amber-300">VỀ CHÚNG TÔI</span>
          <h1 className="text-5xl md:text-6xl font-bold mt-4">
            Câu Chuyện Cà Phê
          </h1>
          <p className="text-xl mt-4 max-w-2xl text-gray-200">
            Hành trình mang hương vị cà phê Việt đích thực đến mọi người.
          </p>
        </div>
      </section>

      {/* === Our Story & Values === */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Cột Văn bản */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Đam mê của chúng tôi là <span className="text-amber-600">chất lượng</span>.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tại LO COFFEE, chúng tôi tin rằng mỗi ly cà phê đều mang một câu chuyện. Đó là câu chuyện của người nông dân, của người rang xay, và của những barista tài hoa.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Sứ mệnh của chúng tôi là kết nối những câu chuyện đó và mang đến cho bạn một trải nghiệm cà phê trọn vẹn - từ hương vị nguyên bản đến không gian ấm cúng và dịch vụ tận tình.
            </p>
          </div>

          {/* Cột Cam kết (Features) */}
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 ${feature.color} rounded-2xl grid place-items-center text-2xl`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Store Info & Map === */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden grid lg:grid-cols-2">
          {/* Thông tin liên hệ */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ghé thăm chúng tôi</h2>
            <div className="space-y-4">
              {storeInfo.map((info) => (
                <div key={info.text} className="flex items-center gap-4">
                  <info.icon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{info.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hình ảnh/Bản đồ giả */}
          <div className="bg-gray-100 min-h-[300px] lg:min-h-0">
            <img 
              src="https://placehold.co/600x400/F9F5EC/A1887F?text=B%E1%BA%A3n+%C4%91%E1%BB%93+%E1%BB%9F+%C4%91%C3%A2y"
              alt="Bản đồ đến LO COFFEE"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
}
