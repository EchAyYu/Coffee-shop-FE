// ================================
// ☕ Coffee Shop FE - Error Debug Component
// ================================
import { useState } from "react";

export default function ErrorDebug({ error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorType = (error) => {
    if (error?.response?.status === 403) return "Quyền truy cập";
    if (error?.response?.status === 401) return "Xác thực";
    if (error?.response?.status === 404) return "Không tìm thấy";
    if (error?.response?.status >= 500) return "Máy chủ";
    if (!error?.response) return "Mạng";
    return "Không xác định";
  };

  const getSolution = (error) => {
    if (error?.response?.status === 403) {
      return [
        "Kiểm tra xem bạn đã đăng nhập chưa",
        "Liên hệ quản trị viên để được cấp quyền",
        "Thử đăng xuất và đăng nhập lại"
      ];
    }
    if (error?.response?.status === 401) {
      return [
        "Đăng nhập lại với tài khoản hợp lệ",
        "Kiểm tra tên đăng nhập và mật khẩu",
        "Liên hệ quản trị viên nếu vẫn gặp lỗi"
      ];
    }
    if (error?.response?.status === 404) {
      return [
        "Kiểm tra URL có đúng không",
        "Thử refresh trang",
        "Liên hệ quản trị viên nếu vẫn gặp lỗi"
      ];
    }
    if (error?.response?.status >= 500) {
      return [
        "Thử lại sau vài phút",
        "Kiểm tra kết nối mạng",
        "Liên hệ quản trị viên nếu lỗi kéo dài"
      ];
    }
    if (!error?.response) {
      return [
        "Kiểm tra kết nối internet",
        "Kiểm tra máy chủ có hoạt động không",
        "Thử lại sau vài phút"
      ];
    }
    return ["Thử lại sau vài phút", "Liên hệ quản trị viên"];
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="text-red-500 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Lỗi {getErrorType(error)}
          </h3>
          <p className="text-red-700 mb-4">
            {error?.message || "Đã xảy ra lỗi không xác định"}
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-red-800">Cách khắc phục:</h4>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              {getSolution(error).map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Thử lại
              </button>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {showDetails ? "Ẩn" : "Hiện"} chi tiết
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-2">Chi tiết lỗi:</h5>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify({
                  status: error?.response?.status,
                  statusText: error?.response?.statusText,
                  data: error?.response?.data,
                  url: error?.config?.url,
                  method: error?.config?.method,
                  message: error?.message
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
