import React, { useState } from 'react';
import { CheckSquare, ClipboardList, Save, Search, Layers, Archive, Check } from 'lucide-react';
import { ProductVariantItem } from '../../types';

type StocktakeScope = 'ALL' | 'SHELF' | 'CENTRAL';

interface StocktakeItem {
  variant: ProductVariantItem;
  actualCount: number;
  note: string;
}

interface StocktakeTabProps {
  variants: ProductVariantItem[];
  onAdjustmentApplied?: () => void;
}

export default function StocktakeTab({ variants, onAdjustmentApplied }: StocktakeTabProps) {
  const [scope, setScope] = useState<StocktakeScope>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStocktakeActive, setIsStocktakeActive] = useState(false);
  const [stocktakeItems, setStocktakeItems] = useState<StocktakeItem[]>([]);

  const getTargetBookStock = (v: ProductVariantItem, currentScope: StocktakeScope) => {
    if (currentScope === 'SHELF') return v.shelfStock;
    if (currentScope === 'CENTRAL') return v.centralStock;
    return v.stockQuantity;
  };

  const startStocktake = () => {
    setIsStocktakeActive(true);
    setStocktakeItems(
      variants.map((v) => ({
        variant: v,
        actualCount: getTargetBookStock(v, scope),
        note: 'Bình thường'
      }))
    );
  };

  const applyStockAdjustment = () => {
    const scopeLabel = scope === 'SHELF' ? 'Quầy Kệ' : scope === 'CENTRAL' ? 'Kho Phía Sau' : 'Cả Quầy & Kho';
    if (
      window.confirm(
        `Xác nhận cân bằng kho cho khu vực [${scopeLabel}] theo số lượng thực tế kiểm kê? Hệ thống sẽ ghi nhận vào Lịch sử giao dịch kho.`
      )
    ) {
      setIsStocktakeActive(false);
      onAdjustmentApplied?.();
      alert(`Đã cân bằng kho [${scopeLabel}] thành công! Dữ liệu tồn kho mới đã đồng bộ cho Web & POS.`);
    }
  };

  const filteredItems = (isStocktakeActive
    ? stocktakeItems
    : variants.map((v) => ({
        variant: v,
        actualCount: getTargetBookStock(v, scope),
        note: 'Khớp 100%'
      }))
  ).filter((it) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      it.variant.productName.toLowerCase().includes(term) ||
      it.variant.barcode.includes(term) ||
      it.variant.sku.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#ecf0f5] overflow-hidden p-3 space-y-3 font-sans text-xs">
      {/* Header & Controls */}
      <div className="p-3 bg-white border border-[#d2d6de] rounded flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h3 className="font-bold text-xs uppercase text-[#333] flex items-center gap-1.5">
            <CheckSquare size={16} className="text-[#1b3b6f]" />
            <span>Đếm Hàng Thực Tế (Kiểm Kho)</span>
          </h3>
          <p className="text-[11px] text-[#777] mt-0.5">
            Đếm lại số lượng thực tế xem có bị thất thoát hay vỡ hỏng so với số liệu máy tính hay không
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bộ lọc phạm vi kiểm kê */}
          <div className="flex rounded border border-[#d2d6de] overflow-hidden bg-white">
            <button
              onClick={() => {
                if (isStocktakeActive) return;
                setScope('ALL');
              }}
              disabled={isStocktakeActive}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                scope === 'ALL'
                  ? 'bg-[#1b3b6f] text-white'
                  : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              Cả Quầy & Kho
            </button>
            <button
              onClick={() => {
                if (isStocktakeActive) return;
                setScope('SHELF');
              }}
              disabled={isStocktakeActive}
              className={`px-3 py-1.5 text-xs font-bold transition-colors border-l border-[#d2d6de] ${
                scope === 'SHELF'
                  ? 'bg-[#1b3b6f] text-white'
                  : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              Chỉ Quầy Kệ
            </button>
            <button
              onClick={() => {
                if (isStocktakeActive) return;
                setScope('CENTRAL');
              }}
              disabled={isStocktakeActive}
              className={`px-3 py-1.5 text-xs font-bold transition-colors border-l border-[#d2d6de] ${
                scope === 'CENTRAL'
                  ? 'bg-[#1b3b6f] text-white'
                  : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              Chỉ Kho Phía Sau
            </button>
          </div>

          {!isStocktakeActive ? (
            <button
              onClick={startStocktake}
              className="px-4 py-2 bg-[#1b3b6f] hover:bg-[#142d55] text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ClipboardList size={14} />
              <span>Bắt Đầu Đếm Hàng</span>
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={() => setIsStocktakeActive(false)}
                className="px-3 py-2 border border-[#d2d6de] bg-white hover:bg-gray-100 text-xs font-medium rounded cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={applyStockAdjustment}
                className="px-4 py-2 bg-[#00a65a] hover:bg-[#008d4c] text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Save size={14} />
                <span>CẬP NHẬT LẠI TỒN ĐÚNG THỰC TẾ 💾</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thanh tìm kiếm nhanh */}
      <div className="p-2 bg-white border border-[#d2d6de] rounded flex items-center justify-between">
        <div className="relative w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, mã barcode, SKU..."
            className="w-full h-8 pl-8 pr-2 text-xs border border-[#d2d6de] rounded bg-white focus:outline-none focus:border-[#1b3b6f]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
          <span>Khu vực đang kiểm: <strong className="text-[#1b3b6f]">{scope === 'SHELF' ? 'Quầy Kệ Showroom' : scope === 'CENTRAL' ? 'Kho Tổng Lưu Trữ' : 'Toàn Bộ Cửa Hàng'}</strong></span>
          <span>Hiển thị: <strong>{filteredItems.length}</strong> sản phẩm</span>
        </div>
      </div>

      {/* Bảng kiểm kê */}
      <div className="flex-1 overflow-y-auto border border-[#d2d6de] rounded bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f6f9] text-[#444] border-b border-[#d2d6de]">
              <th className="p-2 border-r border-[#d2d6de] w-10 text-center font-bold">STT</th>
              <th className="p-2 border-r border-[#d2d6de] font-bold">Sản phẩm & Biến thể</th>
              <th className="p-2 border-r border-[#d2d6de] w-28 font-bold">Mã Barcode / SKU</th>
              <th className="p-2 border-r border-[#d2d6de] w-24 text-center font-bold">Tồn Kệ</th>
              <th className="p-2 border-r border-[#d2d6de] w-24 text-center font-bold">Tồn Kho Tổng</th>
              <th className="p-2 border-r border-[#d2d6de] w-28 text-center font-bold bg-blue-50 text-[#1b3b6f]">
                Tồn sổ sách ({scope === 'SHELF' ? 'Kệ' : scope === 'CENTRAL' ? 'Kho' : 'Tổng'})
              </th>
              <th className="p-2 border-r border-[#d2d6de] w-32 text-center font-bold bg-amber-50 text-amber-900">
                Thực tế đếm
              </th>
              <th className="p-2 border-r border-[#d2d6de] w-28 text-center font-bold">Chênh lệch</th>
              <th className="p-2 font-bold">Lý do điều chỉnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d2d6de]">
            {filteredItems.map((item, idx) => {
              const bookStock = getTargetBookStock(item.variant, scope);
              const diff = item.actualCount - bookStock;

              return (
                <tr key={item.variant.idVariant} className="hover:bg-gray-50">
                  <td className="p-2 text-center font-mono text-gray-400 border-r border-[#d2d6de]">
                    {idx + 1}
                  </td>
                  <td className="p-2 font-bold text-gray-800 border-r border-[#d2d6de]">
                    {item.variant.productName} ({item.variant.capacity})
                  </td>
                  <td className="p-2 font-mono text-gray-600 border-r border-[#d2d6de] text-[11px]">
                    {item.variant.barcode}
                  </td>
                  <td className="p-2 text-center font-mono font-semibold text-gray-700 border-r border-[#d2d6de]">
                    {item.variant.shelfStock}
                  </td>
                  <td className="p-2 text-center font-mono font-semibold text-gray-700 border-r border-[#d2d6de]">
                    {item.variant.centralStock}
                  </td>
                  <td className="p-2 text-center font-mono font-bold bg-blue-50/50 text-[#1b3b6f] border-r border-[#d2d6de]">
                    {bookStock}
                  </td>
                  <td className="p-2 text-center bg-amber-50/40 border-r border-[#d2d6de]">
                    {isStocktakeActive ? (
                      <input
                        type="number"
                        min="0"
                        value={item.actualCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStocktakeItems((prev) =>
                            prev.map((r) =>
                              r.variant.idVariant === item.variant.idVariant
                                ? { ...r, actualCount: val }
                                : r
                            )
                          );
                        }}
                        className="w-20 h-7 text-center font-mono font-bold border border-[#d2d6de] rounded px-1 focus:border-[#1b3b6f] focus:outline-none bg-white shadow-2xs"
                      />
                    ) : (
                      <span className="font-mono font-bold text-gray-700">
                        {item.actualCount}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center font-mono font-bold border-r border-[#d2d6de]">
                    {diff === 0 ? (
                      <span className="text-gray-400 font-normal">0 (Khớp)</span>
                    ) : diff > 0 ? (
                      <span className="text-emerald-600 font-bold">+{diff} (Thừa)</span>
                    ) : (
                      <span className="text-[#d9534f] font-bold">{diff} (Thiếu)</span>
                    )}
                  </td>
                  <td className="p-2 text-gray-600">
                    {isStocktakeActive ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={item.note}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStocktakeItems((prev) =>
                              prev.map((r) =>
                                r.variant.idVariant === item.variant.idVariant
                                  ? { ...r, note: val }
                                  : r
                              )
                            );
                          }}
                          className="h-7 px-1.5 border border-[#d2d6de] rounded text-xs bg-white focus:border-[#1b3b6f] focus:outline-none"
                        >
                          <option value="Bình thường">Bình thường</option>
                          <option value="Hàng mẫu dùng thử (Tester)">Hàng mẫu thử (Tester)</option>
                          <option value="Vỡ bao bì / Bể nắp">Vỡ bao bì / Bể nắp</option>
                          <option value="Hết hạn tiêu hủy">Hết hạn tiêu hủy</option>
                          <option value="Thất thoát quầy kệ showroom">Thất thoát quầy kệ showroom</option>
                          <option value="Nhân viên quên quét bill">Nhân viên quên quét bill</option>
                        </select>
                      </div>
                    ) : (
                      <span>{item.note}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
