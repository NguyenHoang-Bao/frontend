import React from 'react';
import {
  ShoppingBag,
  Boxes,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';

interface DesktopHeaderProps {
  currentUser: UserProfile;
  activeTab: 'POS' | 'WAREHOUSE';
  onTabChange: (tab: 'POS' | 'WAREHOUSE') => void;
  onLogout: () => void;
}

export default function DesktopHeader({
  currentUser,
  activeTab,
  onTabChange,
  onLogout
}: DesktopHeaderProps) {
  return (
    <header className="h-11 bg-[#132238] text-white flex items-center justify-between px-3.5 border-b border-[#0e1828] shrink-0 select-none font-sans">
      {/* Logo hệ thống */}
      <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
        <ShieldCheck size={18} className="text-[#f39c12]" />
        <span>HoangBao<span className="text-blue-400 font-extrabold">.retail</span></span>
      </div>

      {/* Phân hệ: Tách biệt hoàn toàn theo tài khoản đăng nhập */}
      <div>
        {currentUser.role === 'STAFF' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1b3b6f] text-white rounded text-xs font-bold border border-[#2b5190] shadow-xs">
            <ShoppingBag size={13} />
            <span>Phân Hệ Bán Hàng POS</span>
          </div>
        )}

        {currentUser.role === 'WAREHOUSE_MANAGER' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1b3b6f] text-white rounded text-xs font-bold border border-[#2b5190] shadow-xs">
            <Boxes size={13} />
            <span>Phân Hệ Quản Lý Kho Vận</span>
          </div>
        )}

        {currentUser.role === 'ADMIN' && (
          <div className="flex items-center bg-[#0e1929] rounded p-0.5 border border-[#1d304e] text-xs">
            <button
              onClick={() => onTabChange('POS')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                activeTab === 'POS'
                  ? 'bg-[#1b3b6f] text-white shadow-xs border border-[#2b5190]'
                  : 'text-gray-300 hover:text-white hover:bg-[#1a2d4a]'
              }`}
            >
              <ShoppingBag size={13} />
              <span>Bán Hàng POS</span>
            </button>
            <button
              onClick={() => onTabChange('WAREHOUSE')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 cursor-pointer font-bold transition-colors ${
                activeTab === 'WAREHOUSE'
                  ? 'bg-[#1b3b6f] text-white shadow-xs border border-[#2b5190]'
                  : 'text-gray-300 hover:text-white hover:bg-[#1a2d4a]'
              }`}
            >
              <Boxes size={13} />
              <span>Thủ Kho Vận</span>
            </button>
          </div>
        )}
      </div>

      {/* Góc phải: Nút Đăng xuất đơn giản (không hiển thị ca hay tên nhân viên) */}
      <div className="flex items-center">
        <button
          onClick={onLogout}
          className="h-8 px-3 bg-[#0e1929] hover:bg-red-700 text-gray-300 hover:text-white rounded cursor-pointer transition-colors border border-[#1d304e] flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={13} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
