import { useEffect, useState } from "react";
import {Link} from "react-router-dom";
// Import Data
import productsData from '../../data/products.json';

// Định nghĩa kiểu chung cho sản phẩm
interface Product {
    id: number | string;
    name: string;
    price: number;
    image: string;
    [key: string]: any; // Nếu có thêm data khác
  }

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
export default function FlashSale(){
      // Lấy 4 sản phẩm đầu tiên làm Featured Products
  const featuredProducts: Product[] = productsData.slice(0, 4) as Product[];
  const flashSaleProducts: Product[] = productsData.slice(0, 5) as Product[];
  const flashSaleNotices = ['Giảm đến 60%', 'Miễn phí vận chuyển', 'Hàng chính hãng'];
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  

  useEffect(() => {
    const end = new Date();
    end.setDate(end.getDate() + 2);
    end.setHours(23, 59, 59, 0);

    const tick = () => {
      const diff = Math.max(0, end.getTime() - Date.now());
      const pad = (n: number) => String(n).padStart(2, '0');
      setCountdown({
        days: pad(Math.floor(diff / (1000 * 60 * 60 * 24))),
        hours: pad(Math.floor((diff / (1000 * 60 * 60)) % 24)),
        minutes: pad(Math.floor((diff / (1000 * 60)) % 60)),
        seconds: pad(Math.floor((diff / 1000) % 60)),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

    return(
        <>
        <section id="section-flash-sale" className="pt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-pink-50 rounded-2xl p-5 sm:p-8 border border-rose-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide m-0 text-rose-600">
                Flash sale
              </h2>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex whitespace-nowrap">
                  <div className="animate-marquee flex">
                    {flashSaleNotices.concat(flashSaleNotices).map((notice, index) => (
                      <span key={`notice-a-${index}`} className="px-6 text-sm font-bold text-rose-600">
                        {notice}
                      </span>
                    ))}
                  </div>
                  <div className="animate-marquee flex" aria-hidden="true">
                    {flashSaleNotices.concat(flashSaleNotices).map((notice, index) => (
                      <span key={`notice-b-${index}`} className="px-6 text-sm font-bold text-rose-600">
                        {notice}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="flex items-center justify-center gap-2">
                {[
                  { value: countdown.days, label: 'Ngày' },
                  { value: countdown.hours, label: 'Giờ' },
                  { value: countdown.minutes, label: 'Phút' },
                  { value: countdown.seconds, label: 'Giây' },
                ].map((item) => (
                  <li key={item.label} className="flex flex-col items-center min-w-[54px] bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                    <strong className="text-lg font-extrabold text-rose-600 leading-none">{item.value}</strong>
                    <small className="text-[11px] font-bold uppercase text-gray-600 mt-1">{item.label}</small>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {flashSaleProducts.map((product) => {
                const origPrice = product.originalPrice && product.originalPrice > product.price
                  ? product.originalPrice
                  : Math.round((product.price * 1.25) / 1000) * 1000;
                const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);

                return (
                  <Link to={`/product/${product.id}`} key={product.id} className="group bg-white block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="relative overflow-hidden bg-white aspect-[3/4] shrink-0">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = DEFAULT_PLACEHOLDER;
                        }}
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm z-10">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-gray-900 group-hover:text-rose-600 transition-colors text-[15px] font-bold mb-1.5 truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-rose-600 font-extrabold text-base">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-gray-400 line-through text-xs font-medium">
                          {origPrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link to="/sale" className="inline-block border border-rose-400 text-rose-500 px-6 py-2 font-semibold hover:bg-rose-400 hover:text-white transition-colors">
                Xem tất cả »
              </Link>
            </div>
          </div>
        </div>
      </section>
        </>
    )
}