import React from 'react';
import { Banknote, QrCode, RotateCcw, CheckCircle, PauseCircle, Tag, Smartphone } from 'lucide-react';

interface PaymentSummaryProps {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  onDiscountChange: (val: number) => void;
  totalAmount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO';
  onPaymentMethodChange: (method: 'CASH' | 'BANK_TRANSFER' | 'MOMO') => void;
  cashGiven: number;
  onCashGivenChange: (val: number) => void;
  changeMoney: number;
  onOpenQrModal: (method?: 'BANK_TRANSFER' | 'MOMO') => void;
  onClearCart: () => void;
  onParkOrder: () => void;
  parkedCount: number;
  onOpenParkedModal: () => void;
  onCheckout: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export default function PaymentSummary({
  itemCount,
  subtotal,
  discountAmount,
  onDiscountChange,
  totalAmount,
  paymentMethod,
  onPaymentMethodChange,
  cashGiven,
  onCashGivenChange,
  changeMoney,
  onOpenQrModal,
  onClearCart,
  onParkOrder,
  parkedCount,
  onOpenParkedModal,
  onCheckout,
  isProcessing,
  disabled
}: PaymentSummaryProps) {
  // Gợi ý mệnh giá tiền mặt nhanh
  const quickCashOptions = [
    { label: 'Đúng số tiền', value: totalAmount },
    { label: '100k', value: 100000 },
    { label: '200k', value: 200000 },
    { label: '500k', value: 500000 },
    { label: '1 triệu', value: 1000000 }
  ];

  return (
    <div className="p-3 bg-white border-t border-[#d2d6de] space-y-2.5 shadow-xs font-sans">
      {/* Chiết khấu & Tạm tính */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính ({itemCount} SP):</span>
          <span className="font-bold font-mono">{subtotal.toLocaleString('vi-VN')} đ</span>
        </div>

        {/* Ô nhập chiết khấu / giảm giá */}
        <div className="flex items-center justify-between py-1 border-t border-dashed border-gray-200">
          <div className="flex items-center gap-1 text-gray-600">
            <Tag size={12} className="text-[#1b3b6f]" />
            <span>Giảm giá / Voucher:</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max={subtotal}
              step="5000"
              value={discountAmount || ''}
              onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-24 h-6 px-1.5 text-right font-mono font-bold text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none"
            />
            <span className="text-[11px] text-gray-500 font-mono">đ</span>
          </div>
        </div>

        <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
          <span>KHÁCH CẦN TRẢ:</span>
          <span className="text-base text-[#d9534f] font-mono">
            {totalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Phương thức thanh toán: Tiền mặt, VietQR, Ví MoMo */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => onPaymentMethodChange('CASH')}
          className={`p-2 border rounded font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'CASH'
              ? 'border-[#00a65a] bg-emerald-50 text-[#00a65a] ring-1 ring-[#00a65a]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Banknote size={16} />
          <span>Tiền mặt</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onPaymentMethodChange('BANK_TRANSFER');
            onOpenQrModal('BANK_TRANSFER');
          }}
          className={`p-2 border rounded font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'BANK_TRANSFER'
              ? 'border-[#1b3b6f] bg-blue-50/70 text-[#1b3b6f] ring-1 ring-[#1b3b6f]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <QrCode size={16} />
          <span>VietQR</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onPaymentMethodChange('MOMO');
            onOpenQrModal('MOMO');
          }}
          className={`p-2 border rounded font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            paymentMethod === 'MOMO'
              ? 'border-[#a50064] bg-pink-50 text-[#a50064] ring-1 ring-[#a50064]'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Smartphone size={16} className="text-[#a50064]" />
          <span>Ví MoMo</span>
        </button>
      </div>

      {/* Banner thông báo khi chọn quét mã QR */}
      {(paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'MOMO') && (
        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-800">
            <QrCode size={14} className={paymentMethod === 'MOMO' ? 'text-[#a50064]' : 'text-[#1b3b6f]'} />
            <span className="font-semibold text-[11px]">
              {paymentMethod === 'MOMO' ? 'Mã Ví MoMo tự động' : 'Mã VietQR 24/7 tự động'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenQrModal(paymentMethod)}
            className="px-2 py-0.5 bg-[#1b3b6f] hover:bg-[#142d55] text-white text-[10px] font-bold rounded cursor-pointer"
          >
            Mở quét mã
          </button>
        </div>
      )}

      {/* Nghiệp vụ Tiền mặt: Chọn nhanh mệnh giá & Tính tiền thối */}
      {paymentMethod === 'CASH' && (
        <div className="p-2 bg-[#f9f9f9] rounded border border-[#d2d6de] space-y-2 text-xs">
          {/* Nút bấm chọn nhanh mệnh giá */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-gray-500 mr-1">Tiền đưa:</span>
            {quickCashOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => onCashGivenChange(opt.value)}
                className="px-2 py-0.5 bg-white hover:bg-gray-100 border border-[#d2d6de] text-[10px] font-bold font-mono rounded cursor-pointer transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-200">
            <span className="text-gray-600">Khách đưa chính xác:</span>
            <input
              type="number"
              value={cashGiven || ''}
              onChange={(e) => onCashGivenChange(Number(e.target.value))}
              placeholder={totalAmount.toString()}
              className="w-28 h-7 px-2 text-right font-mono font-bold text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none bg-white"
            />
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-gray-800 pt-1 border-t border-gray-200">
            <span>Tiền thối lại:</span>
            <span
              className={`font-mono text-sm ${
                changeMoney < 0 ? 'text-[#d9534f]' : 'text-[#00a65a]'
              }`}
            >
              {changeMoney >= 0
                ? `${changeMoney.toLocaleString('vi-VN')} đ`
                : `Còn thiếu: ${Math.abs(changeMoney).toLocaleString('vi-VN')} đ`}
            </span>
          </div>
        </div>
      )}

      {/* Hàng nút hành động chuẩn quầy thu ngân */}
      <div className="flex gap-1.5 pt-1">
        {/* Nút Hủy đơn F8 */}
        <button
          type="button"
          onClick={onClearCart}
          disabled={disabled}
          className="p-2.5 border border-[#d2d6de] hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-40 rounded text-gray-600 cursor-pointer transition-colors"
          title="Xóa đơn làm lại [F8]"
        >
          <RotateCcw size={14} />
        </button>

        {/* Nút Treo đơn F4 */}
        <button
          type="button"
          onClick={onParkOrder}
          disabled={disabled}
          className="px-2.5 py-2 border border-[#d2d6de] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 disabled:opacity-40 rounded text-gray-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
          title="Lưu tạm đơn để phục vụ khách tiếp theo [F4]"
        >
          <PauseCircle size={14} />
          <span>Treo [F4]</span>
        </button>

        {/* Huy hiệu đơn đang treo */}
        {parkedCount > 0 && (
          <button
            type="button"
            onClick={onOpenParkedModal}
            className="px-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold font-mono cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            title="Mở danh sách đơn đang treo"
          >
            <span>{parkedCount} treo</span>
          </button>
        )}

        {/* Nút Thanh toán F1 */}
        <button
          type="button"
          disabled={disabled || isProcessing || (paymentMethod === 'CASH' && changeMoney < 0)}
          onClick={onCheckout}
          className="flex-1 py-2.5 bg-[#00a65a] hover:bg-[#008d4c] disabled:bg-gray-300 text-white font-bold text-xs uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <CheckCircle size={15} />
          <span>{isProcessing ? 'Đang tạo đơn...' : 'THANH TOÁN & IN BILL [F1]'}</span>
        </button>
      </div>
    </div>
  );
}
