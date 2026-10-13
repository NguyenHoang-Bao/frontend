import {Link} from "react-router-dom";
import {BsArrowRight, BsCartPlus} from 'react-icons/bs';
//import data
import featuredProducts from '../../data/products.json';

// Hàm helper để tạo URL ảnh từ Cloudinary
// Khai báo kiểu string cho tham số path
const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/hb22fnuq/image/upload';
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop';

const getImageUrl = (path?: string) => {
  if (!path) return DEFAULT_PLACEHOLDER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.includes('assets/')) {
    try {
      return new URL(path, import.meta.url).href;
    } catch {
      return DEFAULT_PLACEHOLDER;
    }
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CLOUDINARY_BASE_URL}/${cleanPath}`;
};

interface NewArrivalsProps {
  limit?: number;
}

export default function NewArrivals({ limit = 8 }: NewArrivalsProps = {}){
  const displayedProducts = featuredProducts.slice(0, limit);

    return(
        <>
        <section className="py-20 px-4 sm:px-6 lg:px-8 container mx-auto bg-white">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-wide text-gray-900">Hàng Mới Về</h2>
            <div className="w-16 h-1 bg-rose-500 mt-4 rounded-full"></div>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors uppercase text-sm font-bold tracking-wider">
            Xem Tất Cả <BsArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => {
            const origPrice = product.originalPrice && product.originalPrice > product.price
              ? product.originalPrice
              : Math.round((product.price * 1.25) / 1000) * 1000;
            const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);

            const primaryImg = getImageUrl(product.image || product.thumbnail || (product.images && product.images[0]) || '');
            const secondImg = product.images && product.images.length > 1 && product.images[1] !== (product.image || product.thumbnail)
              ? getImageUrl(product.images[1])
              : null;

            return (
              <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer bg-white block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 relative">
                <div className="relative overflow-hidden bg-white aspect-[3/4] shrink-0">
                  {secondImg ? (
                    <>
                      {/* Ảnh chính (mặt trước) */}
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = DEFAULT_PLACEHOLDER;
                        }}
                      />
                      {/* Ảnh khi hover (mặt sau) */}
                      <img
                        src={secondImg}
                        alt={`${product.name} (back view)`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = DEFAULT_PLACEHOLDER;
                        }}
                      />
                    </>
                  ) : (
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = DEFAULT_PLACEHOLDER;
                      }}
                    />
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md z-10">
                      -{discountPercent}%
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center gap-2 py-3 font-bold uppercase text-sm rounded-full transition-colors shadow-md cursor-pointer">
                      <BsCartPlus size={18} /> Thêm vào giỏ
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 group-hover:text-rose-600 transition-colors text-[15px] font-bold mb-1.5 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-rose-600 font-extrabold text-base md:text-lg">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-gray-400 line-through text-xs md:text-sm font-medium">
                      {origPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
        </>
    )
}