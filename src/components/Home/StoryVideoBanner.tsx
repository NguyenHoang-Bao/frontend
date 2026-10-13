import {Link} from "react-router-dom";
// Import Video Banner & Triết Lý Làm Đẹp
import videoBanner from '../../assets/video/videobanner.mp4';

export default function StoryVideoBanner(){
    return(
        <>
        <section className="relative w-full py-20 md:py-28 overflow-hidden my-12 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            src={videoBanner}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoBanner} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white max-w-4xl">
          {/* Nhãn nhỏ trên cùng */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[4px] text-rose-300 mb-3 block">
            CHUYỆN LÀM ĐẸP HOÀNG BẢO
          </span>

          {/* Tiêu đề lớn, cân đối, ngắt dòng chuẩn */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight md:leading-snug mb-4 tracking-tight">
            Bí Quyết Thanh Xuân<br className="hidden sm:inline" /> Hành Trình Nuôi Dưỡng Làn Da Rạng Rỡ
          </h2>

          {/* Đoạn mô tả phụ chữ to, rõ ràng */}
          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Gìn giữ vẻ đẹp thuần khiết nguyên bản từ những thành phần tự nhiên lành tính, an toàn tuyệt đối cho mọi làn da.
          </p>

          {/* 3 Hộp nội dung chữ to cân đối, nổi bật và dễ đọc */}
          <div className="flex flex-col gap-3.5 max-w-3xl mx-auto mb-8 text-left">
            <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-lg px-6 py-4 flex items-center gap-4 hover:bg-black/60 transition-all">
              
              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                Tuyển chọn tiêu chuẩn thành phần hữu cơ sạch, lành tính và an toàn tuyệt đối cho cả mẹ bầu và làn da nhạy cảm nhất.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-lg px-6 py-4 flex items-center gap-4 hover:bg-black/60 transition-all">
              
              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                Kỹ thuật chiết xuất & ủ dưỡng chất khép kín chuẩn GMP, lưu giữ trọn vẹn tinh chất và hiệu quả dược tính tự nhiên.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-lg px-6 py-4 flex items-center gap-4 hover:bg-black/60 transition-all">
              
              <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                Đóng gói cẩn trọng, thân thiện với môi trường, trao gửi tận tay khách hàng như một món quà ý nghĩa.
              </p>
            </div>
          </div>

          {/* Nút bấm cân đối, sắc nét */}
          <div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-white hover:bg-rose-500 text-gray-900 hover:text-white border border-white/30 rounded-md px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg"
            >
              KHÁM PHÁ CÂU CHUYỆN
            </Link>
          </div>
        </div>
      </section>
        </>
    )
}