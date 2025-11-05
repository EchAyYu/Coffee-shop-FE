import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// 💡 SỬA LỖI IMPORT: Giả sử api.js nằm ở 'src/api/api.js'
import api from '../api/api'; 
import { useCart } from '../components/CartContext'; // 💡 THÊM: Import giỏ hàng

// 💡 HELPER: Component hiển thị sao
const StarRating = ({ rating, size = 'text-xl' }) => {
  const roundedRating = Math.round(rating || 0);
  const starIcons = [];
  for (let i = 1; i <= 5; i++) {
    starIcons.push(
      <span key={i} className={`${i <= roundedRating ? 'text-yellow-400' : 'text-gray-300'} ${size} transition-colors`}>
        ★
      </span>
    );
  }
  return <div className="flex items-center">{starIcons}</div>;
};

// 💡 HELPER: Component hiển thị 1 bình luận
const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-gray-200 py-5">
      <div className="flex items-center mb-2">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-500 font-semibold uppercase mr-3 flex-shrink-0">
          {(review.Customer?.ho_ten || 'Ẩ').charAt(0)}
        </div>
        {/* Tên và Ngày */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{review.Customer?.ho_ten || 'Người dùng ẩn danh'}</h4>
          <p className="text-xs text-gray-500">{new Date(review.ngay_dg).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>
      {/* Sao và Bình luận */}
      <div className="pl-13">
        <StarRating rating={review.diem} size="text-lg" />
        {review.noi_dung && (
          <p className="text-gray-700 mt-2 text-sm whitespace-pre-wrap">{review.noi_dung}</p>
        )}
      </div>
    </div>
  );
};


export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart(); // 💡 THÊM: Lấy hàm addToCart

  const [p, setP] = useState(null); // State cho Món ăn
  const [reviews, setReviews] = useState([]); // 💡 THÊM: State cho Đánh giá
  const [loading, setLoading] = useState(true); // 💡 THÊM: State tải

  const [size, setSize] = useState('M');
  const [qty, setQty] = useState(1);

  // 💡 CẬP NHẬT: Lấy cả thông tin món và đánh giá cùng lúc
  useEffect(() => {
    setLoading(true);
    const fetchProduct = api.get(`/products/${id}`);
    const fetchReviews = api.get(`/reviews/product/${id}`); // 💡 GỌI API ĐÁNH GIÁ MỚI

    Promise.all([fetchProduct, fetchReviews])
      .then(([productRes, reviewsRes]) => {
        // 💡 SỬA LỖI: Dữ liệu nằm trong .data.data (theo controller của chúng ta)
        setP(productRes.data.data); 
        setReviews(reviewsRes.data.data);
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết món ăn hoặc đánh giá:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 💡 THÊM: Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    const price = p.prices?.[size] || 0;
    // Tạo 1 item cho giỏ hàng
    const itemToAdd = {
      ...p,
      id_mon: p.id_mon, // Đảm bảo id_mon tồn tại
      ten_mon: p.ten_mon || p.name,
      gia: price,
      so_luong: qty,
      size: size,
      // Tạo 1 ID duy nhất cho giỏ hàng (nếu cùng món nhưng khác size)
      cartItemId: `${p.id_mon}_${size}`,
    };
    addToCart(itemToAdd);
    // (Bạn có thể thêm thông báo "Đã thêm vào giỏ" ở đây)
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 px-4 text-center">Đang tải...</div>;
  if (!p) return <div className="max-w-4xl mx-auto py-12 px-4 text-center text-red-500">Không tìm thấy món ăn.</div>;

  const price = p.prices?.[size] || 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Phần Chi tiết Món */}
      <section className="grid md:grid-cols-2 gap-8">
        <img src={p.anh || p.image || "https://placehold.co/600x400/F9F5EC/A1887F?text=LO+COFFEE"} alt={p.ten_mon || p.name} className="w-full h-80 object-cover rounded-2xl shadow-lg border border-gray-100"/>
        
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">{p.ten_mon || p.name}</h1>
          
          {/* 💡 THÊM: Hiển thị điểm trung bình */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={p.rating_avg} size="text-xl" />
            <span className="text-sm text-gray-500">
              ({p.rating_avg?.toFixed(1) || 0} / {p.rating_count || 0} đánh giá)
            </span>
          </div>

          <div className="mt-3 text-gray-700">{p.mo_ta || p.description}</div>
          
          <div className="mt-4">
            <label className="mr-3 font-medium text-gray-800">Size:</label>
            {['S','M','L'].map(s => (
              <button 
                key={s} 
                onClick={() => setSize(s)} 
                className={`w-10 h-10 mr-2 rounded-lg border text-sm font-semibold transition-all ${
                  s === size ? "bg-red-700 text-white border-red-700 ring-2 ring-red-300" : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="mt-4">
            <label className="mr-3 font-medium text-gray-800">Số lượng:</label>
            <input 
              type="number" 
              min="1" 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="border border-gray-300 rounded-lg px-3 py-2 w-24 shadow-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="mt-6 text-3xl font-bold text-red-700">{(price * qty).toLocaleString('vi-VN')}đ</div>
          
          <button 
            onClick={handleAddToCart} 
            className="w-full mt-6 bg-red-700 hover:bg-red-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Thêm vào giỏ
          </button>
        </div>
      </section>

      {/* 💡 THÊM: Phần Đánh giá của Khách hàng */}
      <section className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Đánh giá từ khách hàng ({reviews.length})
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard key={review.id_dg} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-600">☕</p>
            <p className="text-gray-600 mt-2">Chưa có đánh giá nào cho món ăn này.</p>
          </div>
        )}
      </section>
    </div>
  )
}