import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';

interface CartTableProps {
  cart: CartItem[];
  onUpdateQuantity: (idVariant: number, delta: number) => void;
  onSetQuantity?: (idVariant: number, qty: number) => void;
  onRemoveItem: (idVariant: number) => void;
}

export default function CartTable({
  cart,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem
}: CartTableProps) {
  return (
    <div className="flex-1 min-h-0 p-2 overflow-y-auto space-y-1.5 divide-y divide-gray-100 font-sans">
      {cart.length > 0 ? (
        cart.map((item, index) => (
          <div key={item.variant.idVariant} className="pt-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 w-4 text-center">
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-1 py-0.2 bg-gray-100 text-[#1b3b6f] rounded font-bold uppercase">
                  {item.variant.brand}
                </span>
                <h4 className="font-bold text-gray-800 truncate text-[11px]">
                  {item.variant.productName}
                </h4>
              </div>
              <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                <span className="font-mono">{item.variant.capacity}</span>
                <span>•</span>
                <span className="font-mono text-[#d9534f] font-bold">
                  {item.variant.price.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Bộ đếm số lượng */}
            <div className="flex items-center border border-[#d2d6de] rounded bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.variant.idVariant, -1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                title="Giảm 1"
              >
                <Minus size={10} />
              </button>
              <input
                type="number"
                min="1"
                max={item.variant.stockQuantity}
                value={item.quantity}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(item.variant.stockQuantity, Number(e.target.value) || 1));
                  if (onSetQuantity) onSetQuantity(item.variant.idVariant, val);
                }}
                className="w-8 h-6 text-center font-bold font-mono text-xs border-x border-[#d2d6de] focus:outline-none focus:bg-blue-50/50"
              />
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.variant.idVariant, 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                title="Tăng 1"
              >
                <Plus size={10} />
              </button>
            </div>

            {/* Thành tiền & nút xóa */}
            <div className="text-right min-w-[75px]">
              <p className="font-bold text-gray-900 font-mono text-xs">
                {(item.variant.price * item.quantity).toLocaleString('vi-VN')} đ
              </p>
              <button
                type="button"
                onClick={() => onRemoveItem(item.variant.idVariant)}
                className="text-gray-400 hover:text-red-600 cursor-pointer p-0.5 mt-0.5 transition-colors"
                title="Xóa sản phẩm khỏi đơn"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
          <ShoppingCart size={36} className="mb-2 text-gray-300 stroke-1" />
          <p className="font-semibold text-xs text-gray-600">Đơn hàng đang trống</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Quét mã vạch [F2] hoặc nhấp chọn sản phẩm bên trái
          </p>
        </div>
      )}
    </div>
  );
}
