import { useEffect, useState } from "react";
// 💡 Import 3 hàm API mới từ adminApi.js
import { getAllReviews, replyToReview, deleteReview } from "../../api/adminApi";
import Swal from "sweetalert2";

// Helper Component để hiển thị sao
const StarRating = ({ rating }) => {
  const roundedRating = Math.round(rating || 0);
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-lg ${star <= roundedRating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ))}
    </div>
  );
};

// Modal để phản hồi
const ReplyModal = ({ review, onClose, onReplied }) => {
  const [replyContent, setReplyContent] = useState(review.ReviewReply?.noi_dung || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!replyContent.trim()) {
      Swal.fire("Lỗi", "Nội dung phản hồi không được để trống.", "error");
      return;
    }
    setLoading(true);
    try {
      // 💡 GỌI API: Gửi phản hồi
      const res = await replyToReview(review.id_dg, replyContent.trim());
      onReplied(res.data.data); // Gửi data phản hồi mới về component cha
      Swal.fire("Thành công", "Đã gửi phản hồi.", "success");
      onClose();
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
      Swal.fire("Lỗi", "Không thể gửi phản hồi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Phản hồi đánh giá</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Thông tin đánh giá gốc */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{review.Customer?.ho_ten}</span>
              <StarRating rating={review.diem} />
            </div>
            <p className="text-sm text-gray-700">{review.noi_dung || <span className="italic text-gray-400">(Không có bình luận)</span>}</p>
            <p className="text-xs text-gray-400 mt-2">Món: {review.Product?.ten_mon}</p>
          </div>
          {/* Khung nhập phản hồi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung phản hồi của Admin:
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500"
              placeholder="Nhập phản hồi của bạn..."
            />
          </div>
        </div>
        <div className="p-5 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} disabled={loading} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm">
            {loading ? "Đang gửi..." : (review.ReviewReply ? "Cập nhật" : "Gửi")}
          </button>
        </div>
      </div>
    </div>
  );
};


// Component trang chính
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  
  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  // Hàm tải dữ liệu
  const fetchReviews = async (currentPage = 1) => {
    setLoading(true);
    try {
      // 💡 GỌI API: Lấy tất cả đánh giá
      const res = await getAllReviews({ page: currentPage, limit: 10 });
      setReviews(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("❌ Lỗi tải đánh giá:", err.response?.data || err.message);
      Swal.fire("Lỗi", "Không thể tải danh sách đánh giá.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);
  
  // Mở modal
  const handleOpenReply = (review) => {
    setCurrentReview(review);
    setShowModal(true);
  };

  // Cập nhật UI sau khi phản hồi
  const handleReplied = (newReplyData) => {
    setReviews(prevReviews =>
      prevReviews.map(r => 
        r.id_dg === newReplyData.id_danh_gia 
        ? { ...r, ReviewReply: newReplyData } 
        : r
      )
    );
  };

  // Xử lý xóa
  const handleDelete = (review) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn muốn xóa đánh giá của "${review.Customer?.ho_ten}" cho món "${review.Product?.ten_mon}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // 💡 GỌI API: Xóa đánh giá
          await deleteReview(review.id_dg);
          Swal.fire('Đã xóa!', 'Đánh giá đã được xóa.', 'success');
          fetchReviews(page); // Tải lại danh sách
        } catch (err) {
          Swal.fire('Lỗi!', 'Không thể xóa đánh giá này.', 'error');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 font-medium ml-3">Đang tải đánh giá...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showModal && (
        <ReplyModal 
          review={currentReview} 
          onClose={() => setShowModal(false)}
          onReplied={handleReplied}
        />
      )}

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">⭐ Quản lý Đánh giá</h1>

      {/* Table */}
      {reviews.length === 0 ? (
        <p>Không có đánh giá nào.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Món ăn</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đánh giá</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bình luận</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phản hồi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id_dg} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{review.Customer?.ho_ten}</p>
                      <p className="text-sm text-gray-600">{review.Customer?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{review.Product?.ten_mon}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StarRating rating={review.diem} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-xs truncate" title={review.noi_dung}>
                        {review.noi_dung || <span className="italic text-gray-400">...</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {review.ReviewReply ? (
                        <div className="group relative">
                           <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Đã phản hồi
                           </span>
                           {/* Tooltip on hover */}
                           <div className="absolute z-10 hidden group-hover:block bottom-full mb-2 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-lg">
                             <span className="font-semibold">{review.ReviewReply.Account?.ten_dn || 'Admin'}</span>: {review.ReviewReply.noi_dung}
                           </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          Chờ phản hồi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenReply(review)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {review.ReviewReply ? "Sửa" : "Phản hồi"}
                        </button>
                        <button
                          onClick={() => handleDelete(review)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* TODO: Thêm Pagination Controls */}
    </div>
  );
}