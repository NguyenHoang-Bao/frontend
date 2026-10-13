import React from 'react';
import { AlertTriangle, Send } from 'lucide-react';

export interface BatchItem {
  id: string;
  productName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

interface ExpiryManagementTabProps {
  batches: BatchItem[];
  onProposeFlashSale: () => void;
}

export default function ExpiryManagementTab({
  batches,
  onProposeFlashSale
}: ExpiryManagementTabProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#ecf0f5] overflow-hidden p-3 space-y-3 font-sans text-xs">
      <div className="p-3 bg-white border border-[#d2d6de] rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-[#f39c12]" />
          <div>
            <h3 className="font-bold text-xs uppercase text-[#333]">
              Quản Lý Hạn Sử Dụng Sản Phẩm (Hạn Ngắn Bán Trước)
            </h3>
            <p className="text-[11px] text-[#777]">
              Hàng cận date dưới 6 tháng cần ưu tiên xuất bán trước hoặc đề xuất mở Flash Sale
            </p>
          </div>
        </div>

        <button
          onClick={onProposeFlashSale}
          className="px-3.5 py-1.5 bg-[#1b3b6f] hover:bg-[#142d55] text-white font-bold text-xs rounded cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <Send size={13} />
          <span>Gửi Đề Xuất Flash Sale Cho Quản Lý</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border border-[#d2d6de] rounded bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f6f9] text-[#444] border-b border-[#d2d6de]">
              <th className="p-2 border-r border-[#d2d6de] w-10 text-center font-bold">STT</th>
              <th className="p-2 border-r border-[#d2d6de] font-bold">Tên sản phẩm</th>
              <th className="p-2 border-r border-[#d2d6de] w-32 font-mono font-bold">Số Lô Sản Xuất</th>
              <th className="p-2 border-r border-[#d2d6de] w-28 text-center font-mono font-bold">
                Hạn Dùng
              </th>
              <th className="p-2 border-r border-[#d2d6de] w-24 text-center font-mono font-bold">
                Số Lượng Tồn
              </th>
              <th className="p-2 border-r border-[#d2d6de] w-32 text-center font-bold">Cấp độ cảnh báo</th>
              <th className="p-2 text-right font-bold">Hành động khuyến nghị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d2d6de]">
            {batches.map((b, idx) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-2 text-center font-mono text-gray-400 border-r border-[#d2d6de]">
                  {idx + 1}
                </td>
                <td className="p-2 font-bold text-gray-800 border-r border-[#d2d6de]">
                  {b.productName}
                </td>
                <td className="p-2 font-mono text-gray-600 border-r border-[#d2d6de]">
                  {b.batchNumber}
                </td>
                <td className="p-2 text-center font-mono font-bold text-gray-900 border-r border-[#d2d6de]">
                  {b.expiryDate}
                </td>
                <td className="p-2 text-center font-mono font-bold border-r border-[#d2d6de]">
                  {b.quantity} hộp
                </td>
                <td className="p-2 text-center border-r border-[#d2d6de]">
                  {b.status === 'CRITICAL' ? (
                    <span className="px-2 py-0.5 bg-red-100 text-[#d9534f] font-bold rounded text-[10px]">
                      Cận date (&lt; 2 tháng)
                    </span>
                  ) : b.status === 'WARNING' ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-[#f39c12] font-bold rounded text-[10px]">
                      Chú ý (&lt; 6 tháng)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                      An toàn (&gt; 12 tháng)
                    </span>
                  )}
                </td>
                <td className="p-2 text-right">
                  {b.status === 'CRITICAL' ? (
                    <span className="text-[#d9534f] font-bold text-[11px]">
                      Cần xả kho Flash Sale 50%
                    </span>
                  ) : b.status === 'WARNING' ? (
                    <span className="text-amber-700 font-semibold text-[11px]">
                      Ưu tiên bán trước
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold text-[11px]">Lưu kho chuẩn</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
