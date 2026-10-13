import React, { useState } from 'react';
import {
  PackageCheck,
  Barcode,
  CheckCircle,
  AlertTriangle,
  Clock,
  Truck,
  Printer,
  Search,
  Zap,
  Tag,
  Package
} from 'lucide-react';

export type ShippingType = 'HOA_TOC' | 'TIEU_CHUAN';

export interface OnlineOrderToPack {
  idOrder: number;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  shippingType: ShippingType;
  trackingCode: string;
  status: 'PENDING_PICK' | 'PACKING' | 'READY_FOR_SHIPPER' | 'HANDED_OVER';
  items: {
    idVariant: number;
    productName: string;
    capacity: string;
    sku: string;
    barcode: string;
    suggestedLot?: string;
    expiryDate?: string;
    quantity: number;
    scannedCount: number;
  }[];
}

interface FulfillmentTabProps {
  orders: OnlineOrderToPack[];
  onOrdersChange: (orders: OnlineOrderToPack[]) => void;
}

export default function FulfillmentTab({ orders, onOrdersChange }: FulfillmentTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrderToPack | null>(null);
  const [packScanBarcode, setPackScanBarcode] = useState('');
  const [packScanMessage, setPackScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingFilter, setShippingFilter] = useState<'ALL' | ShippingType>('ALL');

  const handlePackScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !packScanBarcode.trim()) return;

    const term = packScanBarcode.trim();
    const itemIndex = selectedOrder.items.findIndex(
      (i) => i.barcode === term || i.sku.toLowerCase() === term.toLowerCase()
    );

    if (itemIndex === -1) {
      setPackScanMessage({
        text: `CẢNH BÁO: Mã vạch "${term}" KHÔNG THUỘC đơn hàng này! Đừng đóng nhầm hàng!`,
        type: 'error'
      });
      setPackScanBarcode('');
      return;
    }

    const item = selectedOrder.items[itemIndex];
    if (item.scannedCount >= item.quantity) {
      setPackScanMessage({
        text: `Sản phẩm "${item.productName}" ĐÃ QUÉT ĐỦ số lượng (${item.quantity}/${item.quantity})!`,
        type: 'error'
      });
      setPackScanBarcode('');
      return;
    }

    // Cập nhật tăng số lượng đã quét
    const updatedItems = selectedOrder.items.map((it, idx) =>
      idx === itemIndex ? { ...it, scannedCount: it.scannedCount + 1 } : it
    );

    const isAllPacked = updatedItems.every((it) => it.scannedCount >= it.quantity);
    const newStatus = isAllPacked ? 'READY_FOR_SHIPPER' : 'PACKING';

    const updatedOrder: OnlineOrderToPack = {
      ...selectedOrder,
      items: updatedItems,
      status: newStatus
    };

    setSelectedOrder(updatedOrder);
    onOrdersChange(orders.map((o) => (o.idOrder === updatedOrder.idOrder ? updatedOrder : o)));

    setPackScanMessage({
      text: isAllPacked
        ? `HOÀN THÀNH ĐÓNG GÓI ĐƠN ${selectedOrder.orderCode}! Có thể in tem và bàn giao.`
        : `Đã quét khớp: ${item.productName} (${item.scannedCount + 1}/${item.quantity})`,
      type: 'success'
    });
    setPackScanBarcode('');
  };

  const handleHandoverToShipper = (idOrder: number) => {
    onOrdersChange(
      orders.map((o) => (o.idOrder === idOrder ? { ...o, status: 'HANDED_OVER' } : o))
    );
    setSelectedOrder(null);
    setPackScanMessage(null);
    alert('Đã xác nhận bàn giao kiện hàng cho shipper thành công!');
  };

  // Ưu tiên đơn Hỏa Tốc lên đầu, sau đó đến Tiêu Chuẩn
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'HANDED_OVER' && b.status !== 'HANDED_OVER') return 1;
    if (a.status !== 'HANDED_OVER' && b.status === 'HANDED_OVER') return -1;
    if (a.shippingType === 'HOA_TOC' && b.shippingType !== 'HOA_TOC') return -1;
    if (a.shippingType !== 'HOA_TOC' && b.shippingType === 'HOA_TOC') return 1;
    return b.idOrder - a.idOrder;
  });

  const filteredOrders = sortedOrders.filter((o) => {
    if (shippingFilter !== 'ALL' && o.shippingType !== shippingFilter) return false;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      o.orderCode.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.phoneNumber.includes(term) ||
      o.trackingCode.toLowerCase().includes(term)
    );
  });

  const pendingCount = orders.filter((o) => o.status !== 'HANDED_OVER').length;
  const hoaTocCount = orders.filter((o) => o.shippingType === 'HOA_TOC' && o.status !== 'HANDED_OVER').length;

  return (
    <div className="flex-1 flex overflow-hidden font-sans">
      {/* CỘT TRÁI: DANH SÁCH ĐƠN HÀNG CẦN XỬ LÝ */}
      <div className="w-96 border-r border-[#d2d6de] bg-white flex flex-col">
        <div className="p-2.5 bg-[#f4f6f9] border-b border-[#d2d6de] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-[#333]">
              <PackageCheck size={16} className="text-[#1b3b6f]" />
              <span>Đơn Giao Đi Cần Đóng Gói</span>
            </div>
            <div className="flex items-center gap-1">
              {hoaTocCount > 0 && (
                <span className="px-2 py-0.5 bg-[#d9534f] text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                  <Zap size={11} /> {hoaTocCount} Hỏa Tốc
                </span>
              )}
              <span className="px-2 py-0.5 bg-[#f39c12] text-white text-[11px] font-bold rounded font-mono">
                {pendingCount} đơn
              </span>
            </div>
          </div>

          {/* Bộ lọc loại giao hàng: Hỏa Tốc vs Tiêu Chuẩn */}
          <div className="flex rounded border border-[#d2d6de] overflow-hidden bg-white text-xs font-semibold">
            <button
              onClick={() => setShippingFilter('ALL')}
              className={`flex-1 py-1 text-center transition-colors ${
                shippingFilter === 'ALL'
                  ? 'bg-[#1b3b6f] text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setShippingFilter('HOA_TOC')}
              className={`flex-1 py-1 text-center border-l border-[#d2d6de] transition-colors flex items-center justify-center gap-1 ${
                shippingFilter === 'HOA_TOC'
                  ? 'bg-[#d9534f] text-white font-bold'
                  : 'text-red-700 hover:bg-red-50'
              }`}
            >
              <Zap size={12} /> Hỏa Tốc
            </button>
            <button
              onClick={() => setShippingFilter('TIEU_CHUAN')}
              className={`flex-1 py-1 text-center border-l border-[#d2d6de] transition-colors flex items-center justify-center gap-1 ${
                shippingFilter === 'TIEU_CHUAN'
                  ? 'bg-[#1b3b6f] text-white font-bold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package size={12} /> Tiêu Chuẩn
            </button>
          </div>

          {/* Ô tìm kiếm đơn */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, SĐT khách..."
              className="w-full h-7 pl-7 pr-2 text-xs border border-[#d2d6de] rounded bg-white focus:outline-none focus:border-[#1b3b6f]"
            />
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1.5 bg-[#ecf0f5]">
          {filteredOrders.map((order) => {
            const isSelected = selectedOrder?.idOrder === order.idOrder;
            const isDone = order.status === 'READY_FOR_SHIPPER';
            const isHandedOver = order.status === 'HANDED_OVER';
            const isHoaToc = order.shippingType === 'HOA_TOC';

            return (
              <div
                key={order.idOrder}
                onClick={() => !isHandedOver && setSelectedOrder(order)}
                className={`p-2.5 rounded border transition-all select-none cursor-pointer ${
                  isSelected
                    ? isHoaToc
                      ? 'border-[#d9534f] bg-red-50/70 shadow-2xs'
                      : 'border-[#1b3b6f] bg-blue-50/70 shadow-2xs'
                    : isHandedOver
                    ? 'border-[#d2d6de] bg-gray-50 opacity-60'
                    : isHoaToc
                    ? 'border-red-200 bg-white hover:border-red-500'
                    : 'border-[#d2d6de] bg-white hover:border-[#1b3b6f]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-xs text-[#1b3b6f]">
                      {order.orderCode}
                    </span>
                    {isHoaToc ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#d9534f] text-white flex items-center gap-0.5">
                        <Zap size={10} /> HỎA TỐC
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-200 text-gray-700">
                        TIÊU CHUẨN
                      </span>
                    )}
                  </div>

                  {/* Trạng thái đóng gói */}
                  {isHandedOver ? (
                    <span className="text-gray-500 font-bold text-[10px]">
                      ✓ Đã giao Shipper
                    </span>
                  ) : isDone ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle size={11} /> Đã Đóng Xong
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px] flex items-center gap-1">
                      <Clock size={11} /> Chờ Đóng Gói
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                  <span>
                    Khách: <strong>{order.customerName}</strong> ({order.phoneNumber})
                  </span>
                  <span className="font-mono text-gray-500 text-[10px]">
                    Mã kiện: <strong>{order.trackingCode}</strong>
                  </span>
                </div>

                <div className="text-[10px] text-gray-500 bg-[#f9f9f9] p-1.5 rounded space-y-0.5 border border-[#eee]">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="truncate max-w-[230px]">
                        • {it.productName} ({it.capacity})
                      </span>
                      <span className="font-mono font-bold shrink-0 ml-1">
                        x{it.quantity} ({it.scannedCount}/{it.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: BÀN ĐÓNG GÓI & QUÉT BARCODE */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedOrder ? (
          <div className="h-full flex flex-col">
            <div className="p-3 bg-[#f4f6f9] border-b border-[#d2d6de] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase text-[#333] flex items-center gap-1.5">
                    <PackageCheck size={16} className="text-[#1b3b6f]" />
                    <span>Bàn Đóng Gói Đơn: {selectedOrder.orderCode}</span>
                  </span>
                  {selectedOrder.shippingType === 'HOA_TOC' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d9534f] text-white flex items-center gap-1">
                      <Zap size={11} /> HỎA TỐC - ĐÓNG GẤP
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700">
                      GIAO TIÊU CHUẨN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Khách hàng: <strong>{selectedOrder.customerName}</strong> | SĐT:{' '}
                  <strong className="text-[#1b3b6f]">{selectedOrder.phoneNumber}</strong> | Mã kiện:{' '}
                  <strong className="font-mono text-gray-700">{selectedOrder.trackingCode}</strong>
                </p>
              </div>

              {selectedOrder.status === 'READY_FOR_SHIPPER' && (
                <button
                  onClick={() => handleHandoverToShipper(selectedOrder.idOrder)}
                  className="px-4 py-2 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold text-xs rounded flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Truck size={14} />
                  <span>BÀN GIAO CHO SHIPPER</span>
                </button>
              )}
            </div>

            {/* Thanh quét barcode */}
            <div className="p-3 bg-[#f9f9f9] border-b border-[#d2d6de]">
              <form onSubmit={handlePackScan} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={packScanBarcode}
                    onChange={(e) => setPackScanBarcode(e.target.value)}
                    placeholder="Bắn súng barcode từng món trước khi xếp vào hộp đóng gói..."
                    className="w-full h-9 pl-9 pr-3 text-xs border border-[#d2d6de] rounded bg-white font-bold font-mono focus:outline-none focus:border-[#1b3b6f] transition-colors"
                    autoFocus
                  />
                  <Barcode size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1b3b6f]" />
                </div>

                <button
                  type="submit"
                  className="px-4 h-9 bg-[#1b3b6f] hover:bg-[#142d55] text-white font-bold text-xs rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Xác Nhận [Enter]
                </button>
              </form>

              {packScanMessage && (
                <div
                  className={`mt-2 p-2 rounded text-xs font-bold flex items-center gap-2 ${
                    packScanMessage.type === 'success'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {packScanMessage.type === 'success' ? (
                    <CheckCircle size={15} className="shrink-0" />
                  ) : (
                    <AlertTriangle size={15} className="shrink-0" />
                  )}
                  <span>{packScanMessage.text}</span>
                </div>
              )}
            </div>

            {/* Danh sách mặt hàng cần nhặt */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#ecf0f5]">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#555] uppercase">
                  Danh sách sản phẩm cần nhặt (Nhặt từ Kho Tổng theo FEFO):
                </h4>
                <span className="text-[11px] text-gray-500">
                  Lấy đúng số lô có date gần nhất theo gợi ý
                </span>
              </div>

              {selectedOrder.items.map((it, idx) => {
                const isCompleted = it.scannedCount >= it.quantity;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex items-center justify-between transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-[#d2d6de]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-xs text-gray-900">{it.productName}</h5>
                        {it.suggestedLot && (
                          <span className="px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-800 rounded text-[10px] font-mono font-semibold flex items-center gap-1">
                            <Tag size={10} />
                            Lô gợi ý: {it.suggestedLot} {it.expiryDate ? `(HSD: ${it.expiryDate})` : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        Dung tích: <strong>{it.capacity}</strong> | SKU: {it.sku} | Barcode:{' '}
                        <span className="text-gray-700 font-bold">{it.barcode}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded font-mono font-bold text-xs ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        Đã quét: {it.scannedCount} / {it.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer in phiếu vận đơn */}
            <div className="p-3 bg-white border-t border-[#d2d6de] flex justify-between items-center">
              <span className="text-gray-500 text-[11px]">
                Đóng gói đủ 100% $\rightarrow$ In phiếu dán thùng $\rightarrow$ Chờ Shipper đến lấy.
              </span>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-[#d2d6de] bg-[#f9f9f9] hover:bg-gray-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={13} />
                <span>In Phiếu Đóng Hàng & Nhãn Dán Kiện</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#ecf0f5]">
            <PackageCheck size={48} className="mb-2 text-[#8aa4af] stroke-1" />
            <h4 className="font-bold text-sm text-[#555]">Chọn một đơn hàng bên trái</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Đơn <strong className="text-red-600">⚡ HỎA TỐC</strong> được đẩy lên đầu để đóng gói ngay lập tức. Cầm súng quét barcode kiểm tra từng món hàng khi xếp vào thùng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
