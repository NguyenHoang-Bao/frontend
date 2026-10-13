import React from 'react';
import { X, Check } from 'lucide-react';

interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export default function VietQrModal({ isOpen, onClose, totalAmount }: VietQrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans select-none">
      <div className="bg-white rounded border border-[#d2d6de] shadow-lg max-w-sm w-full p-4 text-center space-y-3.5">
        <div className="flex justify-between items-center border-b border-[#eee] pb-2">
          <h3 className="font-bold text-xs text-[#333] uppercase">Quét Mã VietQR Chuyển Khoản</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-2.5 bg-[#fbfbfb] border border-[#d2d6de] rounded flex justify-center">
          <img
            src={`https://api.vietqr.io/image/970422-0359490221-compact2.png?amount=${totalAmount}&addInfo=HB_POS_${Date.now().toString().slice(-4)}`}
            alt="VietQR Chuyển khoản"
            className="w-52 h-auto"
          />
        </div>

        <div className="text-xs space-y-1 text-gray-700">
          <p>
            Số tiền:{' '}
            <strong className="text-[#1b3b6f] text-sm font-mono">
              {totalAmount.toLocaleString('vi-VN')} đ
            </strong>
          </p>
          <p>Chủ TK: <strong>NGUYEN HOANG BAO</strong></p>
          <p className="text-[11px] text-gray-500">Mã QR tự động cập nhật số tiền hóa đơn</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold text-xs rounded cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          <span>ĐÃ NHẬN TIỀN (XÁC NHẬN)</span>
        </button>
      </div>
    </div>
  );
}
