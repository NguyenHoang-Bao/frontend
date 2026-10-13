import { useState, ChangeEvent } from 'react';
import { BsStarFill, BsStars, BsCheckCircleFill, BsCartPlus, BsBagCheck, BsShieldCheck, BsTruck, BsArrowRepeat } from 'react-icons/bs';
import { Product } from '../../pages/ProductDetail';

interface ProductInfoProps {
  product: Product;
  discountPercent: number;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
}

export default function ProductInfo({ product, discountPercent, onAddToCart, onBuyNow }: ProductInfoProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleQuantityInput = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setQuantity(Math.min(99, val));
    } else if (e.target.value === '') {
      setQuantity(1);
    }
  };

  return (
    <div className="lg:w-1/2 flex flex-col">
      {/* Thương hiệu & SKU */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        {product.brand && (
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            {product.brand}
          </span>
        )}
        {product.sku && <span className="text-xs text-gray-400 font-mono">Mã SP: {product.sku}</span>}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-3">{product.name}</h1>

      {/* Đánh giá sao */}
      <div className="flex items-center gap-2 mb-5 text-sm">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <BsStarFill key={i} size={14} className={i < Math.floor(product.rating || 5) ? 'text-amber-400' : 'text-gray-200'} />
          ))}
        </div>
        <span className="font-bold text-gray-900">{product.rating || 4.8}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500 underline cursor-pointer hover:text-rose-600">{product.reviewCount || 120} đánh giá</span>
        <span className="text-gray-400">|</span>
        <span className="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded">Chính hãng 100%</span>
      </div>

      {/* Khung Giá */}
      <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 mb-6 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold text-rose-600">{product.price.toLocaleString('vi-VN')}₫</span>
        <span className="text-base text-gray-400 line-through">
          {(product.originalPrice && product.originalPrice > product.price 
            ? product.originalPrice 
            : Math.round((product.price * 1.25) / 1000) * 1000
          ).toLocaleString('vi-VN')}₫
        </span>
        {discountPercent > 0 && (
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Tiết kiệm {discountPercent}%</span>
        )}
      </div>

      {product.capacity && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Dung tích / Quy cách:</span>
          <span className="text-xs font-bold text-gray-900 bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg">{product.capacity}</span>
        </div>
      )}

      {/* Tóm tắt công dụng */}
      {product.benefits && product.benefits.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <h4 className="text-xs uppercase font-bold text-gray-800 tracking-wider mb-2 flex items-center gap-1.5">
            <BsStars className="text-rose-500" /> Hiệu quả nổi bật:
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
            {product.benefits.slice(0, 3).map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <BsCheckCircleFill className="text-rose-500 mt-0.5 shrink-0" size={13} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Số lượng */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Số lượng:</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button type="button" onClick={() => handleQuantityChange(-1)} className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">-</button>
            <input type="number" min="1" max="99" value={quantity} onChange={handleQuantityInput} className="w-12 h-10 text-center text-sm font-semibold border-x border-gray-200 focus:outline-none" />
            <button type="button" onClick={() => handleQuantityChange(1)} className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">+</button>
          </div>
          <span className="text-xs text-gray-500">(Còn {product.inStock !== false ? 'sẵn hàng tại kho' : 'hết hàng'})</span>
        </div>
      </div>

      {/* Nút Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button type="button" onClick={() => onAddToCart(quantity)} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 font-bold py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all flex justify-center items-center gap-2 text-sm shadow-sm">
          <BsCartPlus size={18} /> Thêm Vào Giỏ
        </button>
        <button type="button" onClick={() => onBuyNow(quantity)} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all flex justify-center items-center gap-2 text-sm shadow-md shadow-rose-200">
          <BsBagCheck size={18} /> Mua Ngay
        </button>
      </div>

      {/* Cam kết */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 text-center">
        <div className="p-2"><BsShieldCheck className="text-rose-500 mx-auto mb-1" size={20} /><p className="text-[11px] font-semibold text-gray-800">100% Chính Hãng</p></div>
        <div className="p-2 border-x border-gray-100"><BsTruck className="text-rose-500 mx-auto mb-1" size={20} /><p className="text-[11px] font-semibold text-gray-800">Giao Toàn Quốc</p></div>
        <div className="p-2"><BsArrowRepeat className="text-rose-500 mx-auto mb-1" size={20} /><p className="text-[11px] font-semibold text-gray-800">Đổi Trả 7 Ngày</p></div>
      </div>
    </div>
  );
}