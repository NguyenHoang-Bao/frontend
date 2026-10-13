import React from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import { CartItem } from '../../types';

interface CompletedOrderData {
  orderCode: string;
  items: CartItem[];
  subtotal?: number;
  discountAmount?: number;
  totalAmount: number;
  cashGiven: number;
  changeMoney: number;
  customerName: string;
  customerPhone?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO';
  cashier: string;
  createdAt: string;
}

interface ThermalReceiptModalProps {
  order: CompletedOrderData | null;
  onClose: () => void;
  onPrint: () => void;
}

export default function ThermalReceiptModal({
  order,
  onClose,
  onPrint
}: ThermalReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-mono select-none">
      <div className="bg-white rounded-lg shadow-2xl max-w-xs w-full p-4 space-y-3 text-xs">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-bold text-emerald-600 flex items-center gap-1 font-sans">
            <CheckCircle size={14} /> Hoàn tất đơn hàng!
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Khung Hóa đơn K80 nhiệt */}
        <div className="p-3 border border-dashed border-gray-300 bg-amber-50/20 text-[11px] leading-tight space-y-2">
          <div className="text-center space-y-0.5">
            <h4 className="font-bold text-sm uppercase">HOÀNG BẢO COSMETICS</h4>
            <p className="text-[10px]">Hệ Thống Phân Phối Mỹ Phẩm Chính Hãng</p>
            <p className="text-[10px]">Hotline: 0359 490 221</p>
            <div className="border-t border-dashed my-1"></div>
            <h5 className="font-bold text-xs uppercase">HÓA ĐƠN BÁN LẺ</h5>
            <p className="text-[10px]">Mã đơn: {order.orderCode}</p>
            <p className="text-[10px]">Thời gian: {order.createdAt}</p>
          </div>

          <div className="border-t border-dashed my-1"></div>

          <div className="space-y-1">
            {order.items.map((i: CartItem, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span className="truncate max-w-[150px]">
                  {i.variant.productName} x{i.quantity}
                </span>
                <span>{(i.variant.price * i.quantity).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed my-1"></div>

          <div className="space-y-0.5">
            {order.discountAmount && order.discountAmount > 0 ? (
              <>
                <div className="flex justify-between text-[10px]">
                  <span>Tạm tính:</span>
                  <span>{(order.subtotal || order.totalAmount + order.discountAmount).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-[10px] text-red-600">
                  <span>Giảm giá / Chiết khấu:</span>
                  <span>-{order.discountAmount.toLocaleString()}đ</span>
                </div>
                <div className="border-t border-dotted my-0.5"></div>
              </>
            ) : null}
            <div className="flex justify-between font-bold text-xs">
              <span>TỔNG CỘNG:</span>
              <span>{order.totalAmount.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Hình thức:</span>
              <span>
                {order.paymentMethod === 'CASH'
                  ? 'Tiền mặt'
                  : order.paymentMethod === 'MOMO'
                  ? 'Ví MoMo (QR Code)'
                  : 'Chuyển khoản (VietQR)'}
              </span>
            </div>
            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between text-[10px]">
                  <span>Khách đưa:</span>
                  <span>{order.cashGiven.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Tiền thối:</span>
                  <span>{order.changeMoney.toLocaleString()}đ</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed my-1"></div>
          <p className="text-center italic text-[9px] pt-1">
            Cảm ơn quý khách! Hẹn gặp lại quý khách!
          </p>
        </div>

        <div className="flex gap-2 pt-1 font-sans">
          <button
            onClick={onPrint}
            className="flex-1 py-2 bg-[#222d32] hover:bg-black text-white font-bold text-xs rounded flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={13} />
            <span>In Hóa Đơn [Print]</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-300 text-xs rounded hover:bg-gray-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
