import {Link} from "react-router-dom";
 
export default function ShopBySkinType(){
    return(
        <>
        <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-rose-400 font-bold uppercase text-xs tracking-widest">Lựa Chọn Hoàn Hảo Cho Bạn</span>
            <h2 className="text-3xl font-extrabold uppercase tracking-widest mt-2">Giải Pháp Theo Loại Da</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Dù bạn sở hữu làn da dầu mụn hay nhạy cảm dễ kích ứng, chúng tôi luôn có những sản phẩm chuyên biệt dành riêng cho bạn.</p>
            <div className="w-16 h-1 bg-rose-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skin 1: Da Dầu Mụn */}
            <Link to="/products?cat=da-dau" className="group relative block h-80 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop"
                alt="Da Dầu Mụn"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-1 mb-3 self-start tracking-wider uppercase">Làm Sạch & Kiểm Soát</span>
                <h4 className="font-bold text-xl text-white mb-2">Da Dầu & Mụn</h4>
                <p className="text-sm text-gray-200 line-clamp-2">Kiểm soát bã nhờn, se khít lỗ chân lông và làm dịu các nốt mụn viêm hiệu quả.</p>
              </div>
            </Link>

            {/* Skin 2: Da Khô */}
            <Link to="/products?cat=da-kho" className="group relative block h-80 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop"
                alt="Da Khô Thiếu Ẩm"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-1 mb-3 self-start tracking-wider uppercase">Cấp Ẩm Sâu</span>
                <h4 className="font-bold text-xl text-white mb-2">Da Khô Thiếu Ẩm</h4>
                <p className="text-sm text-gray-200 line-clamp-2">Bổ sung Hyaluronic Acid và Ceramide giúp da luôn ngậm nước, căng bóng mềm mịn.</p>
              </div>
            </Link>

            {/* Skin 3: Da Nhạy Cảm */}
            <Link to="/products?cat=da-nhay-cam" className="group relative block h-80 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop"
                alt="Da Nhạy Cảm"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-1 mb-3 self-start tracking-wider uppercase">Dịu Nhẹ & Phục Hồi</span>
                <h4 className="font-bold text-xl text-white mb-2">Da Nhạy Cảm</h4>
                <p className="text-sm text-gray-200 line-clamp-2">Công thức lành tính 100% không cồn, không hương liệu, củng cố hàng rào bảo vệ da.</p>
              </div>
            </Link>

            {/* Skin 4: Chống Lão Hóa */}
            <Link to="/products?cat=chong-lao-hoa" className="group relative block h-80 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1512496015851-a9083890aef6?q=80&w=600&auto=format&fit=crop"
                alt="Chống Lão Hóa"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="inline-block bg-white text-black text-[10px] font-bold px-2 py-1 mb-3 self-start tracking-wider uppercase">Tái Tạo Tế Bào</span>
                <h4 className="font-bold text-xl text-white mb-2">Chống Lão Hóa</h4>
                <p className="text-sm text-gray-200 line-clamp-2">Kích thích tăng sinh Collagen với Retinol và Peptide, làm mờ nếp nhăn và săn chắc da.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
        </>
    )
}