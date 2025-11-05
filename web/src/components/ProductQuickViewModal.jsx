import React, { useState, useEffect } from 'react';
// 💡 SỬA ĐỔI: Thêm 2 hàm API mới
import { getReviewsByProductId, likeReviewById, dislikeReviewById } from '../api/api'; 
import { XMarkIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
// 💡 THÊM: Import toast để thông báo
import { toast } from 'react-toastify';

// --- Component StarRating (Giữ nguyên) ---
const StarRating = ({ rating, count }) => {
  const roundedRating = Math.round(rating || 0);
  if (count === 0 || !count) {
    return (
      <div className="text-sm text-gray-400 h-5">
        Chưa có đánh giá
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 h-5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-lg ${star <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
      {count > 1 && (
        <span className="text-sm text-gray-500">({count} đánh giá)</span>
      )}
    </div>
  );
};


export default function ProductQuickViewModal({ product, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 💡 THÊM: State để theo dõi ID đang được like/dislike
  // Giúp ngăn người dùng click nhiều lần
  const [likingReviewId, setLikingReviewId] = useState(null);

  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await getReviewsByProductId(product.id_mon);
        setReviews(res.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy reviews:", error);
        setReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [product]);

  
  // 💡 NÂNG CẤP: Hàm xử lý Like
  const handleLikeReview = async (reviewId) => {
    if (likingReviewId) return; // Đang xử lý, không cho click
    setLikingReviewId(reviewId);

    try {
      // 1. Cập nhật giao diện trước (Optimistic Update)
      setReviews(currentReviews =>
        currentReviews.map(r =>
          r.id_dg === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
        )
      );
      
      // 2. Gọi API
      await likeReviewById(reviewId);
      // (Không cần toast success vì giao diện đã cập nhật)

    } catch (error) {
      console.error("Lỗi khi like:", error);
      toast.error("Bạn cần đăng nhập để thực hiện việc này!");
      
      // 3. Rollback (Trả lại giao diện cũ nếu lỗi)
      setReviews(currentReviews =>
        currentReviews.map(r =>
          r.id_dg === reviewId ? { ...r, likes: (r.likes || 0) - 1 } : r
        )
      );
    } finally {
      setLikingReviewId(null); // Cho phép click lại
    }
  };

  // 💡 NÂNG CẤP: Hàm xử lý Dislike
  const handleDislikeReview = async (reviewId) => {
    if (likingReviewId) return; // Đang xử lý, không cho click
    setLikingReviewId(reviewId);

    try {
      // 1. Cập nhật giao diện trước
      setReviews(currentReviews =>
        currentReviews.map(r =>
          r.id_dg === reviewId ? { ...r, dislikes: (r.dislikes || 0) + 1 } : r
        )
      );

      // 2. Gọi API
      await dislikeReviewById(reviewId);

    } catch (error) {
      console.error("Lỗi khi dislike:", error);
      toast.error("Bạn cần đăng nhập để thực hiện việc này!");
      
      // 3. Rollback
      setReviews(currentReviews =>
        currentReviews.map(r =>
          r.id_dg === reviewId ? { ...r, dislikes: (r.dislikes || 0) - 1 } : r
        )
      );
    } finally {
      setLikingReviewId(null);
    }
  };


  if (!product) return null;

  // --- (Các biến product... giữ nguyên) ---
  const productName = product.ten_mon || product.name;
  // ... (các biến khác giữ nguyên)

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* --- (Header giữ nguyên) --- */}
        <header className="flex items-center justify-between p-4 border-b">
           {/* ... (code giữ nguyên) ... */}
        </header>

        {/* --- (Thân Modal giữ nguyên) --- */}
        <div className="p-6 overflow-y-auto">
          {/* ... (Phần thông tin sản phẩm giữ nguyên) ... */}
          
          {/* --- Phần Đánh giá & Phản hồi --- */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Đánh giá & Phản hồi</h4>
            {loading ? (
              <p>Đang tải đánh giá...</p>
            ) : (
              <div className="space-y-5 max-h-60 overflow-y-auto pr-2">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => {
                    // 💡 THÊM: Biến kiểm tra xem nút này có đang bị vô hiệu hóa không
                    const isDisabled = likingReviewId === review.id_dg;
                    
                    return (
                      <div key={review.id_dg || index} className="border-b pb-4">
                        
                        {/* --- Bình luận Khách hàng (Đã sửa tên thuộc tính) --- */}
                        <div className="flex items-center justify-between">
                          <strong className="text-gray-800">{review.Customer?.ho_ten || "Khách hàng"}</strong>
                          <StarRating rating={review.diem} count={1} /> 
                        </div>
                        <p className="text-gray-700 mt-1">{review.noi_dung}</p>
                        
                        {/* --- Nút Bấm (Đã cập nhật) --- */}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(review.ngay_dg || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                          
                          {/* Nút Like */}
                          <button 
                            onClick={() => handleLikeReview(review.id_dg)}
                            // 💡 SỬA: Thêm 'disabled' và hiệu ứng 'opacity'
                            disabled={isDisabled}
                            className={`flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 ${isDisabled ? 'opacity-50' : ''}`}
                          >
                            <HandThumbUpIcon className="w-4 h-4" />
                            <span>{review.likes || 0}</span>
                          </button>
                          
                          {/* Nút Dislike */}
                          <button 
                            onClick={() => handleDislikeReview(review.id_dg)}
                            // 💡 SỬA: Thêm 'disabled' và hiệu ứng 'opacity'
                            disabled={isDisabled}
                            className={`flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 ${isDisabled ? 'opacity-50' : ''}`}
                          >
                            <HandThumbDownIcon className="w-4 h-4" />
                            <span>{review.dislikes || 0}</span>
                          </button>
                        </div>

                        {/* --- Phản hồi Admin (Giữ nguyên) --- */}
                        {review.ReviewReply ? (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-green-500 bg-green-50 p-3 rounded-r-lg">
                            <strong className="text-sm text-green-800">Phản hồi từ Quản trị viên:</strong>
                            <p className="text-sm text-gray-700 italic mt-1">{review.ReviewReply.comment || review.ReviewReply.noi_dung}</p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {new Date(review.ReviewReply.createdAt || review.ReviewReply.ngay_ph || Date.now()).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 ml-5 pl-4">
                            <span className="text-xs text-yellow-600 italic">Chờ phản hồi...</span>
                          </div>
                        )}

                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}