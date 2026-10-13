import React from 'react';
import {
  Package,
  Layers,
  Boxes,
  Calendar,
  ClipboardCheck,
  History
} from 'lucide-react';

export type WarehouseSubTab = 'fulfillment' | 'replenishment' | 'inbound' | 'expiry' | 'stocktake' | 'logs';

interface WarehouseNavbarProps {
  activeTab: WarehouseSubTab;
  onTabChange: (tab: WarehouseSubTab) => void;
  pendingOrderCount: number;
  criticalExpiryCount: number;
  replenishmentCount?: number;
}

export default function WarehouseNavbar({
  activeTab,
  onTabChange,
  pendingOrderCount,
  criticalExpiryCount,
  replenishmentCount
}: WarehouseNavbarProps) {
  return (
    <div className="h-11 bg-white border-b border-[#d2d6de] px-3 flex items-center justify-between shrink-0 select-none font-sans shadow-2xs">
      <div className="flex items-center gap-1.5">
        {/* 1. ĐƠN CẦN GIAO */}
        <button
          onClick={() => onTabChange('fulfillment')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'fulfillment'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <Package size={15} />
          <span>Đơn Cần Giao</span>
          {pendingOrderCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#f39c12] text-white rounded text-[10px] font-mono">
              {pendingOrderCount}
            </span>
          )}
        </button>

        {/* 2. LẤY HÀNG RA QUẦY */}
        <button
          onClick={() => onTabChange('replenishment')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'replenishment'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <Layers size={15} />
          <span>Lấy Hàng Ra Quầy</span>
          {replenishmentCount !== undefined && replenishmentCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#dd4b39] text-white rounded text-[10px] font-mono">
              {replenishmentCount}
            </span>
          )}
        </button>

        {/* 3. NHẬP HÀNG MỚI */}
        <button
          onClick={() => onTabChange('inbound')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'inbound'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <Boxes size={15} />
          <span>Nhập Hàng Mới</span>
        </button>

        {/* 4. HẠN SỬ DỤNG */}
        <button
          onClick={() => onTabChange('expiry')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'expiry'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <Calendar size={15} />
          <span>Hạn Sử Dụng</span>
          {criticalExpiryCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#d9534f] text-white rounded text-[10px] font-mono">
              {criticalExpiryCount}
            </span>
          )}
        </button>

        {/* 5. ĐẾM HÀNG (KIỂM KHO) */}
        <button
          onClick={() => onTabChange('stocktake')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'stocktake'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <ClipboardCheck size={15} />
          <span>Đếm Hàng (Kiểm Kho)</span>
        </button>

        {/* 6. LỊCH SỬ GIAO DỊCH */}
        <button
          onClick={() => onTabChange('logs')}
          className={`h-8 px-3 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'logs'
              ? 'bg-[#1b3b6f] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <History size={15} />
          <span>Lịch Sử Giao Dịch</span>
        </button>
      </div>

      <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        <span>Kho sẵn sàng vận hành</span>
      </div>
    </div>
  );
}
