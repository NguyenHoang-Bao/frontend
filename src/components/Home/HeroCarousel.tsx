import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {BsChevronLeft, BsChevronRight, BsArrowRight} from 'react-icons/bs';

// Hero Banner Images từ Unsplash (cosmetics & beauty)
const heroImg1 = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=2070&q=80&auto=format&fit=crop';
const heroImg2 = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=2070&q=80&auto=format&fit=crop';
const heroImg3 = 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=2070&q=80&auto=format&fit=crop';

// Khai báo kiểu cho đối tượng HeroSlide
interface HeroSlide {
    image: string;
    badge?: string; // Tùy chọn vì có cái null
    title: string;
    description?: string | null;
    buttonText: string;
    link: string;
  }
  
  const heroSlides: HeroSlide[] = [
    {
      image: heroImg1,
      badge: 'Bộ Sưu Tập Mới 2026',
      title: 'NUÔI DƯỠNG\nLÀN DA RẠNG RỠ',
      description: 'Khám phá các dòng sản phẩm dưỡng da chuyên sâu mới nhất. Tươi trẻ, thuần khiết và tỏa sáng tự nhiên trong từng khoảnh khắc.',
      buttonText: 'Khám Phá Ngay',
      link: '/products'
    },
    {
      image: heroImg2,
      badge: 'Skincare Organic',
      title: 'BÍ QUYẾT\nDA SÁNG MỊN',
      description: null,
      buttonText: 'Mua Ngay',
      link: '/products'
    },
    {
      image: heroImg3,
      badge: 'Natural Beauty',
      title: 'VẺ ĐẸP\nTHUẦN KHIẾT',
      description: null,
      buttonText: 'Xem Sản Phẩm',
      link: '/products'
    },
  ];

export default function HeroCarousel(){

    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const totalSlides = heroSlides.length;

    
    const goToSlide = (index: number) => setCurrentSlide(index);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    const nextSlide = () => setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

    // Auto-play: chuyển slide sau 6 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [currentSlide, totalSlides]);
    return(
        <>
        {/* ====== 1. HERO CAROUSEL ====== */}
      <section className="relative w-full h-[60vh] max-h-[550px] min-h-[380px] overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Ảnh nền */}
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Lớp phủ tối */}
              <div className="absolute inset-0 bg-black/50 z-[1]"></div>

              {/* Nội dung text - căn trái, giữa dọc */}
              <div className="absolute inset-0 z-[2] flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-lg">
                    {slide.badge && (
                      <span className="inline-block text-sm uppercase tracking-[3px] font-semibold text-gray-300 mb-4">
                        {slide.badge}
                      </span>
                    )}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 whitespace-pre-line">
                      {slide.title}
                    </h1>
                    {slide.description && (
                      <p className="text-base sm:text-lg text-gray-200/90 leading-relaxed mb-8 max-w-md">
                        {slide.description}
                      </p>
                    )}
                    <Link
                      to={slide.link}
                      className="inline-flex items-center gap-3 bg-rose-400 hover:bg-rose-500 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-full shadow-lg shadow-rose-400/30"
                    >
                      {slide.buttonText} <BsArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút Previous */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-20 bg-white/20 hover:bg-pink-500/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
          aria-label="Previous slide"
        >
          <BsChevronLeft size={22} />
        </button>

        {/* Nút Next */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-20 bg-white/20 hover:bg-pink-500/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20"
          aria-label="Next slide"
        >
          <BsChevronRight size={22} />
        </button>

        {/* Indicators (dots) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide ? 'bg-pink-400 w-8 h-2.5' : 'bg-white/50 hover:bg-pink-300/70 w-2.5 h-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
        </>
    );

}