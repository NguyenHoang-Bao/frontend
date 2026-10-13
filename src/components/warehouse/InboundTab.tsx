import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle,
  Trash2,
  Barcode,
  Search,
  History,
  Printer,
  X,
  AlertTriangle
} from 'lucide-react';
import { ProductVariantItem, SupplierItem } from '../../types';
import { retailApi } from '../../services/api';

interface InboundTabProps {
  suppliers: SupplierItem[];
  variants: ProductVariantItem[];
  onSaveInbound: (payload: any) => Promise<any>;
}

interface SimpleInboundItem {
  idVariant: number;
  productName: string;
  capacity: string;
  sku: string;
  barcode: string;
  quantity: number;
  importPrice: number;
  expiryDate: string;
  batchNumber: string;
}

export default function InboundTab({ suppliers, variants, onSaveInbound }: InboundTabProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [receiptNote, setReceiptNote] = useState('');
  const [inboundItems, setInboundItems] = useState<SimpleInboundItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [searchCatalogTerm, setSearchCatalogTerm] = useState('');

  const loadHistory = async () => {
    try {
      const data = await retailApi.getInboundHistory();
      setHistoryList(data);
    } catch (e) {
      console.error('Lỗi tải lịch sử nhập kho:', e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addVariantToSlip = (v: ProductVariantItem, addQty = 20) => {
    const existing = inboundItems.find((i) => i.idVariant === v.idVariant);
    if (existing) {
      setInboundItems((prev) =>
        prev.map((i) => (i.idVariant === v.idVariant ? { ...i, quantity: i.quantity + addQty } : i))
      );
    } else {
      setInboundItems((prev) => [
        ...prev,
        {
          idVariant: v.idVariant,
          productName: v.productName,
          capacity: v.capacity,
          sku: v.sku,
          barcode: v.barcode,
          quantity: addQty,
          importPrice: Math.round(v.price * 0.65),
          batchNumber: 'LOT' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
          expiryDate: '2028-12-31'
        }
      ]);
    }
  };

  // Quét mã vạch tự động thêm món
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    const term = scanBarcode.trim().toLowerCase();
    if (!term) return;

    const matched = variants.find(
      (v) =>
        v.barcode === term ||
        v.sku.toLowerCase() === term ||
        v.productName.toLowerCase().includes(term)
    );

    if (matched) {
      addVariantToSlip(matched, 10);
      setScanFeedback({
        text: `Đã thêm: ${matched.productName} (+10 hộp)`,
        type: 'success'
      });
      setScanBarcode('');
    } else {
      setScanFeedback({
        text: `Không tìm thấy sản phẩm với mã "${term}"!`,
        type: 'error'
      });
      setScanBarcode('');
    }

    setTimeout(() => setScanFeedback(null), 3000);
  };

  const handleUpdateItem = (idVariant: number, field: string, val: any) => {
    setInboundItems((prev) =>
      prev.map((item) =>
        item.idVariant === idVariant ? { ...item, [field]: val } : item
      )
    );
  };

  const handleRemoveItem = (idVariant: number) => {
    setInboundItems((prev) => prev.filter((i) => i.idVariant !== idVariant));
  };

  // Bấm lưu nhập kho 1 lần
  const handleSaveInboundSlip = async () => {
    if (inboundItems.length === 0) {
      alert('Chưa có sản phẩm nào trong phiếu nhập!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        note: receiptNote.trim() || 'Nhập hàng từ nhà phân phối',
        items: inboundItems.map((i) => ({
          idVariant: i.idVariant,
          productName: i.productName,
          capacity: i.capacity,
          quantity: i.quantity,
          importPrice: i.importPrice,
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate
        }))
      };

      const res = await onSaveInbound(payload);
      setSuccessMessage(
        `NHẬP KHO THÀNH CÔNG! Đã nhập ${totalQuantity} hộp vào kho (Mã phiếu: ${res?.data?.receiptCode || 'PNK-MỚI'}).`
      );

      setInboundItems([]);
      setReceiptNote('');
      loadHistory();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Không thể tạo phiếu nhập'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuantity = inboundItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = inboundItems.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);

  const filteredCatalog = variants.filter(
    (v) =>
      v.productName.toLowerCase().includes(searchCatalogTerm.toLowerCase()) ||
      v.barcode.includes(searchCatalogTerm)
  );

  return (
    <div className="flex-1 flex overflow-hidden font-sans text-xs bg-[#eef1f5]">
      {/* CỘT TRÁI: KHU VỰC LẬP PHIẾU NHẬP HÀNG */}
      <div className="flex-1 flex flex-col border-r border-[#d2d6de] bg-white overflow-hidden">
        {/* THÔNG BÁO THÀNH CÔNG */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-300 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={17} className="text-emerald-600" />
              <span className="font-bold text-xs">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-gray-500 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* HEADER CÔNG CỤ */}
        <div className="p-3.5 bg-[#f4f6f9] border-b border-[#d2d6de] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700 text-xs">Nhà cung cấp:</span>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                className="h-8 px-2.5 border border-[#d2d6de] rounded bg-white text-xs font-bold text-[#1b3b6f] focus:border-[#1b3b6f] focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.idSupplier} value={s.idSupplier}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="px-3 h-8 border border-gray-300 hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <History size={13} />
                <span>Xem Lần Nhập Trước ({historyList.length})</span>
              </button>

              <button
                onClick={handleSaveInboundSlip}
                disabled={isSubmitting || inboundItems.length === 0}
                className="px-4 h-8 bg-[#00a65a] hover:bg-[#008d4c] disabled:bg-gray-300 text-white font-bold text-xs rounded cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <CheckCircle size={15} />
                <span>LƯU VÀO KHO 💾</span>
              </button>
            </div>
          </div>

          {/* Ô bắn súng Barcode */}
          <form onSubmit={handleBarcodeScan} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={scanBarcode}
                onChange={(e) => setScanBarcode(e.target.value)}
                placeholder="Bắn súng quét Barcode để thêm nhanh sản phẩm vào danh sách..."
                className="w-full h-8 pl-8 pr-2.5 text-xs border border-[#d2d6de] rounded bg-white font-bold font-mono focus:border-[#1b3b6f] focus:outline-none"
                autoFocus
              />
              <Barcode size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1b3b6f]" />
            </div>
            <button
              type="submit"
              className="px-3.5 h-8 bg-[#1b3b6f] hover:bg-[#142d55] text-white font-bold text-xs rounded cursor-pointer"
            >
              Thêm [Enter]
            </button>
          </form>

          {scanFeedback && (
            <div
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
                scanFeedback.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {scanFeedback.type === 'success' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
              <span>{scanFeedback.text}</span>
            </div>
          )}
        </div>

        {/* BẢNG DANH SÁCH MÓN CẦN NHẬP (GỌN GÀNG, DỄ NHÌN) */}
        <div className="flex-1 overflow-y-auto p-3 bg-[#ecf0f5]">
          <table className="w-full text-left border-collapse text-xs border border-[#d2d6de] bg-white rounded shadow-2xs">
            <thead>
              <tr className="bg-[#f4f6f9] text-[#444] border-b border-[#d2d6de] text-[11px] uppercase font-bold">
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Tên Mỹ Phẩm</th>
                <th className="p-2.5 w-24 text-center">Số Lượng Nhập</th>
                <th className="p-2.5 w-32 text-center">Hạn Sử Dụng (EXP)</th>
                <th className="p-2.5 w-28 text-right">Giá Nhập</th>
                <th className="p-2.5 w-28 text-right">Thành Tiền</th>
                <th className="p-2.5 w-10 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              {inboundItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400">
                    <Boxes size={36} className="mx-auto mb-2 text-gray-300 stroke-1" />
                    <p className="font-bold text-gray-600 text-sm">Chưa có sản phẩm nào</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Bắn máy quét Barcode ở trên hoặc bấm chọn sản phẩm từ danh mục bên phải.
                    </p>
                  </td>
                </tr>
              ) : (
                inboundItems.map((item, idx) => (
                  <tr key={item.idVariant} className="hover:bg-gray-50">
                    <td className="p-2.5 text-center font-mono text-gray-400">{idx + 1}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-gray-900">{item.productName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {item.capacity} | {item.barcode}
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.idVariant, 'quantity', Math.max(1, Number(e.target.value)))
                        }
                        className="w-16 h-7 text-center font-bold font-mono text-sm border border-[#d2d6de] rounded bg-white text-[#1b3b6f] focus:border-[#1b3b6f] focus:outline-none"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => handleUpdateItem(item.idVariant, 'expiryDate', e.target.value)}
                        className="w-28 h-7 text-center font-mono text-xs border border-[#d2d6de] rounded px-1 bg-white focus:border-[#1b3b6f] focus:outline-none"
                      />
                    </td>
                    <td className="p-2.5 text-right font-mono text-gray-700">
                      {item.importPrice.toLocaleString()}đ
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                      {(item.quantity * item.importPrice).toLocaleString()}đ
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.idVariant)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TỔNG KẾT DƯỚI ĐÁY */}
        {inboundItems.length > 0 && (
          <div className="p-3 bg-white border-t border-[#d2d6de] flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Tổng số mặt hàng: <strong>{inboundItems.length}</strong> món
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span>Tổng số hộp: <strong className="text-[#1b3b6f] text-sm">{totalQuantity}</strong> hộp</span>
              <span>Tổng tiền nhập: <strong className="text-[#d9534f] text-sm">{totalAmount.toLocaleString()}đ</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: BẤM CHỌN NHANH TỪ DANH MỤC */}
      <div className="w-80 flex flex-col bg-white overflow-hidden">
        <div className="p-2.5 bg-[#f4f6f9] border-b border-[#d2d6de] space-y-2 shrink-0">
          <div className="font-bold text-xs text-[#333] flex items-center justify-between">
            <span>Bấm Để Thêm Nhanh</span>
            <span className="text-[10px] text-gray-500 font-normal">Tự động +20 hộp</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchCatalogTerm}
              onChange={(e) => setSearchCatalogTerm(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full h-7 pl-7 pr-2 text-xs border border-[#d2d6de] rounded bg-white focus:outline-none focus:border-[#1b3b6f]"
            />
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-[#ecf0f5]">
          {filteredCatalog.map((v) => (
            <div
              key={v.idVariant}
              onClick={() => addVariantToSlip(v, 20)}
              className="p-2 rounded border border-[#d2d6de] bg-white hover:border-[#1b3b6f] hover:bg-blue-50/50 cursor-pointer transition-all select-none"
            >
              <div className="font-bold text-xs text-gray-900 leading-snug">{v.productName}</div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono mt-1">
                <span>{v.capacity}</span>
                <span>Tồn hiện tại: <strong>{v.stockQuantity}</strong> hộp</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL POPUP XEM LỊCH SỬ NHẬP KHO */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-3.5 bg-[#f4f6f9] border-b border-[#d2d6de] flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase text-[#333] flex items-center gap-2">
                <History size={15} className="text-[#1b3b6f]" />
                <span>Lịch Sử Các Lần Nhập Kho Trước Đây</span>
              </h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-black font-bold p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {historyList.map((rec, idx) => (
                <div key={idx} className="p-3 border border-[#d2d6de] rounded bg-gray-50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-[#1b3b6f]">{rec.receiptCode}</span>
                    <span className="text-gray-500 font-mono text-[11px]">{rec.importDate}</span>
                  </div>
                  <div className="font-semibold text-gray-800">{rec.supplierName}</div>
                  <div className="flex items-center justify-between text-[11px] text-gray-600 mt-1">
                    <span>
                      Nhập: <strong>{rec.totalQuantity} hộp</strong>
                    </span>
                    <span className="font-bold text-[#d9534f] font-mono">
                      {rec.totalValue?.toLocaleString()}đ
                    </span>
                  </div>
                  {rec.note && <div className="text-[10px] text-gray-500 italic mt-0.5">"{rec.note}"</div>}
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-gray-50 border-t border-[#d2d6de] text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
