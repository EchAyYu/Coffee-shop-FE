// src/components/PromotionCarousel.jsx
import React, { useState } from 'react';
import { FaTag, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Helper để chuyển đổi số thứ sang tên (0: CN, 1: T2, ...)
const getDayName = (dayIndex) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return days[dayIndex];
}

const formatPromoDate = (promo) => {
    if (promo.lap_lai_thu !== null) {
        return `Áp dụng **${getDayName(promo.lap_lai_thu)}** hàng tuần`;
    }
    const ngay_bd = promo.ngay_bd ? new Date(promo.ngay_bd).toLocaleDateString() : 'N/A';
    const ngay_kt = promo.ngay_kt ? new Date(promo.ngay_kt).toLocaleDateString() : '';

    return `Từ: **${ngay_bd}** ${ngay_kt && ` - Đến: **${ngay_kt}**`}`;
};


// ===================================
// COMPONENT CAROUSEL CHÍNH
// ===================================
export default function PromotionCarousel({ promotionsList }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!promotionsList || promotionsList.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % promotionsList.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? promotionsList.length - 1 : prevIndex - 1
        );
    };
    
    // Khuyến mãi hiện tại
    const currentPromo = promotionsList[currentIndex];

    return (
        <div className="relative w-full overflow-hidden">
            
            {/* Carousel Item (Sử dụng transform/translate để hiển thị slide) */}
            <div className="flex transition-transform duration-500 ease-in-out" 
                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {promotionsList.map((promo, index) => (
                    <div 
                        key={promo.id_km} 
                        className="flex-shrink-0 w-full"
                    >
                        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#1E1E1E] shadow-2xl transition-all h-96">
                            {/* Banner ảnh nền */}
                            <img 
                                src={promo.hinh_anh || "https://placehold.co/1200x400?text=Coffee+Promo"} 
                                alt={promo.ten_km} 
                                className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
                            />
                            {/* Overlay để làm nổi bật text */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-800/80 to-amber-700/80 dark:from-black/80 dark:to-gray-900/80"></div>

                            {/* Nội dung chính */}
                            <div className="relative z-10 p-8 md:p-16 text-white h-full flex flex-col justify-center">
                                <span className="text-xl font-black mb-3 inline-block bg-red-600 px-4 py-1 rounded-full shadow-lg transform -rotate-1">
                                    GIẢM {promo.pt_giam}%
                                </span>
                                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                                    <FaTag className="inline mr-3 text-amber-200" /> {promo.ten_km}
                                </h2>
                                <p className="text-lg md:text-xl text-orange-100 max-w-3xl mb-6">
                                    {promo.mo_ta || "Nội dung chi tiết chương trình khuyến mãi đang chờ bạn khám phá."}
                                </p>
                                {/* Thời gian áp dụng */}
                                <div className="flex items-center text-lg font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit">
                                    <FaClock className="mr-3 text-amber-200" />
                                    <span>{formatPromoDate(promo)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Các nút chuyển slide */}
            {promotionsList.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide} 
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-20"
                        title='Trước'
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        onClick={nextSlide} 
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-20"
                        title='Sau'
                    >
                        <FaChevronRight />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {promotionsList.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                    {promotionsList.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentIndex ? 'bg-orange-500 w-5' : 'bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}