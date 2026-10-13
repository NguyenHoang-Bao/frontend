import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle,
  RefreshCw,
  Search,
  PackageCheck,
  Flame,
  AlertTriangle,
  History,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { retailApi } from '../../services/api';
import { ReplenishmentItem } from '../../types';

export default function ReplenishmentTab() {
  const [alerts, setAlerts] = useState<ReplenishmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [inputQuantities, setInputQuantities] = useState<Record<number, number>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySlips, setHistorySlips] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await retailApi.getReplenishmentAlerts();
      setAlerts(data);
      const initialQtys: Record<number, number> = {};
      const initialSelected: Record<number, boolean> = {};

      data.forEach((item) => {
        initialQtys[item.idVariant] = item.suggestedQuantity;
        initialSelected[item.idVariant] = true; // Mặc định chọn tất cả
      });

      setInputQuantities(initialQtys);
      setSelectedIds(initialSelected);

      const historyData = await retailApi.getReplenishmentHistory();
      setHistorySlips(historyData);
    } catch (err) {
      console.error('Lỗi tải dữ liệu châm hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSelect = (idVariant: number) => {
    setSelectedIds((prev) => ({ ...prev, [idVariant]: !prev[idVariant] }));
  };

  const handleSelectAll = (select: boolean) => {
    const updated: Record<number, boolean> = {};
    alerts.forEach((it) => {
      updated[it.idVariant] = select;
    });
    setSelectedIds(updated);
  };

  const handleQuantityChange = (idVariant: number, val: number, max: number) => {
    const safeVal = Math.max(1, Math.min(val, max));
    setInputQuantities((prev) => ({ ...prev, [idVariant]: safeVal }));
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const totalBoxes = alerts
    .filter((item) => selectedIds[item.idVariant])
    .reduce((sum, item) => sum + (inputQuantities[item.idVariant] ?? item.suggestedQuantity), 0);

  // Bưng hàng ra quầy 1 lần cho tất cả mặt hàng đã chọn
  const handleRestockBatch = async () => {
    const itemsToMove = alerts
      .filter((item) => selectedIds[item.idVariant])
      .map((item) => ({
        idVariant: item.idVariant,
        productName: item.productName,
        sku: item.sku,
        quantity: inputQuantities[item.idVariant] ?? item.suggestedQuantity
      }));

    if (itemsToMove.length === 0) {
      alert('Bạn chưa tích chọn món nào để bưng ra quầy!');
      return;
    }

    setLoading(true);
    try {
      const res = await retailApi.createReplenishmentBatch(
        itemsToMove,
        'Lấy hàng từ kho bưng ra quầy kệ bán lẻ'
      );

      setSuccessMessage(
        `ĐÃ CHUYỂN XONG! Đã bưng ${res.totalQuantity} hộp (${res.totalItems} món) ra quầy bán lẻ thành công.`
      );

      setTimeout(() => setSuccessMessage(null), 5000);
      loadData();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Không thể thực hiện'));
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-3 font-sans text-xs bg-[#eef1f5]">
      {/* THÔNG BÁO THÀNH CÔNG */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span className="font-bold text-xs">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-gray-500 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* THANH THAO TÁC CHÍNH */}
      <div className="p-3.5 bg-white border border-[#d2d6de] rounded shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-[#1b3b6f] flex items-center gap-2">
            <Layers size={18} className="text-[#1b3b6f]" />
            <span>Hàng Quầy Bán Đang Thiếu (Cần Bưng Ra Kệ)</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Dưới đây là các món trên kệ bán lẻ còn dưới 5 hộp hoặc thu ngân bấm gọi khẩn cấp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút xem lịch sử dạng nhẹ nhàng */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 border border-gray-300 hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <History size={14} />
            <span>Xem Lần Chuyển Trước ({historySlips.length})</span>
          </button>

          {/* NÚT HÀNH ĐỘNG TO DUY NHẤT */}
          <button
            type="button"
            onClick={handleRestockBatch}
            disabled={selectedCount === 0 || loading}
            className="px-5 py-2 bg-[#00a65a] hover:bg-[#008d4c] disabled:bg-gray-300 text-white font-bold text-xs rounded shadow-xs flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <PackageCheck size={16} />
            <span>BƯNG RA QUẦY ({selectedCount} món - {totalBoxes} hộp) 🚀</span>
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM & CHỌN NHANH */}
      <div className="p-2.5 bg-white border border-[#d2d6de] rounded flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectAll(true)}
            className="px-2.5 py-1 border border-gray-300 hover:bg-gray-100 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckSquare size={13} className="text-[#1b3b6f]" />
            <span>Chọn hết ({alerts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectAll(false)}
            className="px-2.5 py-1 border border-gray-300 hover:bg-gray-100 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Square size={13} className="text-gray-400" />
            <span>Bỏ chọn</span>
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 font-semibold text-xs">
            Đang chọn: <strong className="text-[#1b3b6f]">{selectedCount}</strong> món
          </span>
        </div>

        <div className="relative w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            className="w-full h-8 pl-8 pr-2.5 text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none bg-white"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* BẢNG RÚT GỌN SIÊU DỄ HIỂU (CHỈ 4 CỘT CHÍNH) */}
      <div className="bg-white border border-[#d2d6de] rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f6f9] text-gray-700 font-bold border-b border-[#d2d6de] text-[11px] uppercase">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedCount === alerts.length && alerts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="cursor-pointer"
                />
              </th>
              <th className="p-3">Tên Mỹ Phẩm</th>
              <th className="p-3 text-center w-36">Quầy Bán Còn</th>
              <th className="p-3 text-center w-36">Trong Kho Còn</th>
              <th className="p-3 text-center w-44 bg-blue-50/60 text-[#1b3b6f]">Lấy Ra Mấy Hộp?</th>
              <th className="p-3 text-center w-36">Tình Trạng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  <CheckCircle size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-bold text-gray-700 text-sm">Quầy bán hàng hiện đã đủ hàng!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Không có món nào bị thiếu hụt trên quầy vào lúc này.
                  </p>
                </td>
              </tr>
            ) : (
              filteredAlerts.map((item) => {
                const isChecked = Boolean(selectedIds[item.idVariant]);
                const currentQty = inputQuantities[item.idVariant] ?? item.suggestedQuantity;

                return (
                  <tr
                    key={item.idVariant}
                    onClick={() => handleToggleSelect(item.idVariant)}
                    className={`transition-colors cursor-pointer select-none ${
                      isChecked ? 'bg-blue-50/30' : 'hover:bg-gray-50 opacity-60'
                    } ${item.staffReportedUrgent ? 'border-l-4 border-l-red-600' : ''}`}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.idVariant)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-900 text-xs">{item.productName}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {item.brand} | {item.capacity}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded font-bold font-mono text-red-700 bg-red-100 border border-red-200">
                        <AlertTriangle size={12} />
                        {item.shelfStock} hộp
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-emerald-700 text-xs">
                      {item.centralStock} hộp
                    </td>
                    <td className="p-3 text-center bg-blue-50/40" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max={item.centralStock}
                          value={currentQty}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.idVariant,
                              Number(e.target.value),
                              item.centralStock
                            )
                          }
                          className="w-20 h-8 text-center font-bold font-mono text-sm border border-[#d2d6de] rounded bg-white text-[#1b3b6f] focus:border-[#1b3b6f] focus:outline-none shadow-2xs"
                        />
                        <span className="text-gray-500 font-semibold text-xs">hộp</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {item.staffReportedUrgent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white inline-flex items-center gap-1 shadow-2xs">
                          <Flame size={11} /> Thu ngân gọi gấp
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">
                          Sắp hết trên quầy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* POPUP XEM LỊCH SỬ KHI CẦN (KHÔNG ĐẬP VÀO MẮT LÀM RỐI) */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-3.5 bg-[#f4f6f9] border-b border-[#d2d6de] flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase text-[#333] flex items-center gap-2">
                <History size={15} className="text-[#1b3b6f]" />
                <span>Lịch Sử Những Lần Chuyển Hàng Ra Quầy Gần Đây</span>
              </h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-black font-bold p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {historySlips.map((slip, idx) => (
                <div key={idx} className="p-3 border border-[#d2d6de] rounded bg-gray-50 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-[#1b3b6f]">{slip.slipCode}</span>
                    <span className="text-gray-500 font-mono text-[11px]">{slip.createdAt}</span>
                  </div>
                  <div className="text-gray-700">
                    Đã chuyển: <strong className="text-emerald-700">{slip.totalQuantity} hộp</strong> ({slip.totalItems} mặt hàng)
                  </div>
                  <div className="text-[11px] text-gray-500 italic">"{slip.note}"</div>
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
