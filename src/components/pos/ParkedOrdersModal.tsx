import React from 'react';
import { X, Play, Trash2, Clock, ShoppingCart } from 'lucide-react';
import { ParkedOrder } from '../../types';

interface ParkedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkedOrders: ParkedOrder[];
  onResumeOrder: (order: ParkedOrder) => void;
  onDeleteParkedOrder: (id: string) => void;
}

export default function ParkedOrdersModal({
  isOpen,
  onClose,
  parkedOrders,
  onResumeOrder,
  onDeleteParkedOrder
}: ParkedOrdersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans select-none">
      <div className="bg-white rounded border border-[#d2d6de] shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3 bg-[#132238] text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#f39c12]" />
            <h3 className="font-bold text-xs uppercase tracking-wide">
              Danh Sách Đơn Đang Treo ({parkedOrders.length})
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Nội dung danh sách */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 bg-[#ecf0f5]">
          {parkedOrders.length > 0 ? (
            parkedOrders.map((po) => {
              const totalItems = po.cart.reduce((s, i) => s + i.quantity, 0);
              const totalVal = po.cart.reduce((s, i) => s + i.variant.price * i.quantity, 0) - (po.discountAmount || 0);

              return (
                <div
                  key={po.id}
                  className="p-3 bg-white rounded border border-[#d2d6de] shadow-2xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-gray-900 font-mono">
                        {po.orderCode}
                      </span>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Khách: <strong>{po.customerName}</strong> {po.customerPhone && `(${po.customerPhone})`}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {po.parkedAt}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-500 bg-[#f9f9f9] p-1.5 rounded border border-[#eee] space-y-0.5">
                    {po.cart.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate max-w-[240px]">• {it.variant.productName}</span>
                        <span className="font-mono font-bold">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="font-mono font-bold text-xs text-[#d9534f]">
                      Tổng: {totalVal.toLocaleString('vi-VN')} đ ({totalItems} SP)
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDeleteParkedOrder(po.id)}
                        className="px-2 py-1 border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded text-gray-500 text-[11px] cursor-pointer transition-colors"
                        title="Hủy đơn treo này"
                      >
                        <Trash2 size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onResumeOrder(po)}
                        className="px-3 py-1 bg-[#1b3b6f] hover:bg-[#142d55] text-white rounded text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Play size={11} />
                        <span>Mở Lại Đơn</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400">
              <ShoppingCart size={32} className="mx-auto mb-2 text-gray-300 stroke-1" />
              <p className="text-xs font-semibold text-gray-600">Không có đơn hàng nào đang treo</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Bấm nút [F4] Treo đơn để lưu tạm giỏ hàng khi khách cần chọn thêm đồ
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-white border-t border-[#d2d6de] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-[#d2d6de] hover:bg-gray-100 text-xs rounded text-gray-700 cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
