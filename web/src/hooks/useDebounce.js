// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

// Hook này nhận một giá trị (value) và một thời gian trễ (delay)
// Nó sẽ chỉ trả về giá trị mới nhất sau khi người dùng ngừng gõ trong 'delay' ms
function useDebounce(value, delay) {
  // State để lưu giá trị đã "trì hoãn"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Đặt một bộ đếm thời gian
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy bộ đếm nếu giá trị thay đổi (người dùng gõ tiếp)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chỉ chạy lại nếu giá trị hoặc thời gian trễ thay đổi

  return debouncedValue;
}

export default useDebounce;