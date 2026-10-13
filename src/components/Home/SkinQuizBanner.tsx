import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Droplets } from 'lucide-react';

export default function SkinQuizBanner() {
  return (
    <section className="py-12 bg-white font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50/60 border border-rose-100 p-8 sm:p-12 shadow-xs">
          
          {/* Background decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-rose-600 text-xs font-bold uppercase tracking-wider shadow-2xs border border-rose-200">
              <Sparkles size={14} className="text-rose-500" />
              Trắc Nghiệm Da Chuẩn K-Beauty 60 Giây
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Bạn Đã Thực Sự Hiểu <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Nhu Cầu Sinh Học Của Làn Da Mình?
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
              Không cần đọc hàng chục bài viết phức tạp. Trả lời 4 câu hỏi nhanh để nhận phác đồ Routine 
              Sáng &amp; Tối chuẩn y khoa cùng gợi ý sản phẩm chính hãng tương thích 100%.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Droplets size={15} className="text-rose-500" />
                <span>Đo độ dầu &amp; ẩm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-rose-500" />
                <span>Chuẩn hoạt chất da liễu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={15} className="text-rose-500" />
                <span>Giảm 5% Combo Routine</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/skin-quiz"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full shadow-lg shadow-rose-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Chẩn Đoán Làn Da Ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
