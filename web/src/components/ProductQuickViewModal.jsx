// web/src/components/ProductQuickViewModal.jsx
import React, { useState, useEffect } from "react";
import {
  getReviewsByProductId,
  likeReviewById,
  dislikeReviewById,
} from "../api/api";
import {
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

// --- Component StarRating ---
const StarRating = ({ rating, count }) => {
  const roundedRating = Math.round(rating || 0);
  if (count === 0 || !count) {
    return (
      <div className="text-sm text-gray-400 h-5">Chưa có đánh giá</div>
    );
  }
  return (
    <div className="flex items-center gap-1 h-5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= roundedRating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
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

  const handleLikeReview = async (reviewId) => {
    if (likingReviewId) return;
    setLikingReviewId(reviewId);

    try {
      setReviews((currentReviews) =>
        currentReviews.map((r) =>
          r.id_dg === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
        )
      );
      await likeReviewById(reviewId);
    } catch (error) {
      console.error("Lỗi khi like:", error);
      toast.error("Bạn cần đăng nhập để thực hiện việc này!");
      setReviews((currentReviews) =>
        currentReviews.map((r) =>
          r.id_dg === reviewId ? { ...r, likes: (r.likes || 0) - 1 } : r
        )
      );
    } finally {
      setLikingReviewId(null);
    }
  };

  const handleDislikeReview = async (reviewId) => {
    if (likingReviewId) return;
    setLikingReviewId(reviewId);

    try {
      setReviews((currentReviews) =>
        currentReviews.map((r) =>
          r.id_dg === reviewId
            ? { ...r, dislikes: (r.dislikes || 0) + 1 }
            : r
        )
      );
      await dislikeReviewById(reviewId);
    } catch (error) {
      console.error("Lỗi khi dislike:", error);
      toast.error("Bạn cần đăng nhập để thực hiện việc này!");
      setReviews((currentReviews) =>
        currentReviews.map((r) =>
          r.id_dg === reviewId
            ? { ...r, dislikes: (r.dislikes || 0) - 1 }
            : r
        )
      );
    } finally {
      setLikingReviewId(null);
    }
  };

  if (!product) return null;

  // --- Thông tin sản phẩm ---
  const productName = product.ten_mon || product.name;
  const imageUrl =
    product.anh ||
    product.imageUrl ||
    "https://placehold.co/500x400/F9F5EC/A1887F?text=LO+COFFEE";
  const description =
    product.mo_ta || product.description || "Chưa có mô tả cho sản phẩm này.";
  const ratingAvg = product.rating_avg || 0;
  const ratingCount = product.rating_count || 0;

  const originalPrice =
    Number(
      product.gia_goc != null ? product.gia_goc : product.gia
    ) || 0;
  const promoPrice =
    product.gia_km != null ? Number(product.gia_km) : originalPrice;
  const hasPromo = promoPrice < originalPrice;

  const appliedPromo = product.khuyen_mai_ap_dung || null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Xem nhanh sản phẩm
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Nội dung */}
        <div className="p-6 overflow-y-auto">
          {/* Thông tin sản phẩm */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Ảnh */}
            <div className="md:w-1/2 w-full">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="md:w-1/2 w-full flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {productName}
              </h2>

              <div className="flex items-center gap-3 mb-3">
                <StarRating rating={ratingAvg} count={ratingCount} />
              </div>

              {/* Giá */}
              <div className="mb-4">
                {hasPromo ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-600">
                        {promoPrice.toLocaleString("vi-VN")} ₫
                      </span>
                      <span className="text-base text-gray-400 line-through">
                        {originalPrice.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    {appliedPromo && (
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        Đang áp dụng khuyến mãi: {appliedPromo.ten_km}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-orange-600">
                    {originalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  Mô tả
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Thông tin khuyến mãi chi tiết (nếu có) */}
              {appliedPromo && (
                <div className="mt-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-800">
                  <p className="font-semibold">
                    Khuyến mãi đang áp dụng: {appliedPromo.ten_km}
                  </p>
                  {appliedPromo.loai_km === "FIXED_PRICE" && (
                    <p>
                      Đồng giá{" "}
                      {Number(appliedPromo.gia_dong || promoPrice).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫ trong khung giờ khuyến mãi.
                    </p>
                  )}
                  {appliedPromo.loai_km === "PERCENT" && (
                    <p>Giảm {appliedPromo.pt_giam}% so với giá gốc.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Đánh giá & Phản hồi */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Đánh giá & Phản hồi
            </h4>
            {loading ? (
              <p>Đang tải đánh giá...</p>
            ) : (
              <div className="space-y-5 max-h-60 overflow-y-auto pr-2">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => {
                    const isDisabled = likingReviewId === review.id_dg;

                    return (
                      <div
                        key={review.id_dg || index}
                        className="border-b pb-4"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-gray-800">
                            {review.Customer?.ho_ten || "Khách hàng"}
                          </strong>
                          <StarRating rating={review.diem} count={1} />
                        </div>
                        <p className="text-gray-700 mt-1">
                          {review.noi_dung}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(
                              review.ngay_dg || Date.now()
                            ).toLocaleDateString("vi-VN")}
                          </span>

                          <button
                            onClick={() => handleLikeReview(review.id_dg)}
                            disabled={isDisabled}
                            className={`flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 ${
                              isDisabled ? "opacity-50" : ""
                            }`}
                          >
                            <HandThumbUpIcon className="w-4 h-4" />
                            <span>{review.likes || 0}</span>
                          </button>

                          <button
                            onClick={() => handleDislikeReview(review.id_dg)}
                            disabled={isDisabled}
                            className={`flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 ${
                              isDisabled ? "opacity-50" : ""
                            }`}
                          >
                            <HandThumbDownIcon className="w-4 h-4" />
                            <span>{review.dislikes || 0}</span>
                          </button>
                        </div>

                        {review.ReviewReply ? (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-green-500 bg-green-50 p-3 rounded-r-lg">
                            <strong className="text-sm text-green-800">
                              Phản hồi từ Quản trị viên:
                            </strong>
                            <p className="text-sm text-gray-700 italic mt-1">
                              {review.ReviewReply.comment ||
                                review.ReviewReply.noi_dung}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {new Date(
                                review.ReviewReply.createdAt ||
                                  review.ReviewReply.ngay_ph ||
                                  Date.now()
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 ml-5 pl-4">
                            <span className="text-xs text-yellow-600 italic">
                              Chờ phản hồi...
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
