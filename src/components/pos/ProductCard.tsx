import React from 'react';
import { BellRing, Check } from 'lucide-react';
import { ProductVariantItem } from '../../types';

interface ProductCardProps {
  product: ProductVariantItem;
  onAddToCart: (product: ProductVariantItem) => void;
  onReportOutOfStock?: (product: ProductVariantItem) => void;
  isReported?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onReportOutOfStock,
  isReported = false
}: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isShelfLow = (product.shelfStock ?? 0) <= 5;
  const hasCentralStock = (product.centralStock ?? 0) > 0;

  return (
    <div
      onClick={() => !isOutOfStock && onAddToCart(product)}
      className={`p-2 bg-white border rounded shadow-2xs flex flex-col justify-between transition-all select-none font-sans ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed border-[#d2d6de]'
          : 'cursor-pointer border-[#d2d6de] hover:border-[#1b3b6f] hover:shadow-xs'
      }`}
    >
      <div>
        <div className="h-28 w-full bg-[#f9f9f9] rounded overflow-hidden mb-1.5 flex items-center justify-center relative border border-[#eee]">
          <img
            src={product.thumbnail}
            alt={product.productName}
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-white rounded text-[10px] font-mono">
            {product.capacity}
          </span>
        </div>
        <p className="text-[10px] font-bold text-[#1b3b6f] uppercase tracking-wider">{product.brand}</p>
        <h3 className="font-bold text-gray-800 text-[11px] line-clamp-2 leading-tight mt-0.5">
          {product.productName}
        </h3>
      </div>

      <div className="mt-2 pt-1.5 border-t border-[#eee] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#d9534f] text-xs font-mono">
            {product.price.toLocaleString('vi-VN')} đ
          </span>
          {/* Badge tồn quầy kệ */}
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono border ${
              (product.shelfStock ?? 0) <= 0
                ? 'bg-red-50 text-red-700 border-red-200'
                : (product.shelfStock ?? 0) <= 5
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            title="Số lượng thực tế trên quầy kệ trưng bày"
          >
            Kệ: {product.shelfStock ?? product.stockQuantity}
          </span>
        </div>

        {/* Thông tin tra cứu kho tổng cho nhân viên */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5 border-t border-dotted border-gray-100">
          <span>Kho tổng:</span>
          <span className="font-mono font-bold text-gray-700">
            {(product.centralStock ?? 0).toLocaleString()} hộp
          </span>
        </div>

        {/* Nút Báo Quầy Hết Hàng / Châm Hàng Gấp cho Thu Ngân */}
        {isShelfLow && hasCentralStock && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReportOutOfStock?.(product);
            }}
            className={`w-full mt-0.5 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              isReported || product.staffReportedUrgent
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
            }`}
            title="Nhấn để gửi thông báo ưu tiên châm hàng gấp cho Thủ kho"
          >
            {isReported || product.staffReportedUrgent ? (
              <>
                <Check size={11} className="text-emerald-600" />
                <span>Đã báo Thủ kho</span>
              </>
            ) : (
              <>
                <BellRing size={11} className="text-red-600 animate-pulse" />
                <span>Thông báo cần hàng gấp</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
