import React, { useState, useEffect } from 'react';
import { UserCheck, Award, Sparkles, Check, Search, PhoneCall } from 'lucide-react';
import { retailApi } from '../../services/api';
import { CustomerLoyaltyInfo } from '../../types';

interface CustomerInfoBarProps {
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (val: string) => void;
  onApplyLoyaltyDiscount?: (pointsUsed: number, discountAmount: number) => void;
  currentDiscount?: number;
}

export default function CustomerInfoBar({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  onApplyLoyaltyDiscount,
  currentDiscount = 0
}: CustomerInfoBarProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerLoyaltyInfo | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pointsApplied, setPointsApplied] = useState<number>(0);

  // Tự động tìm kiếm thông tin khách hàng khi nhập đủ 10 số điện thoại
  useEffect(() => {
    const clean = customerPhone.trim().replace(/\s+/g, '');
    if (clean.length >= 10) {
      setIsSearching(true);
      retailApi
        .lookupCustomer(clean)
        .then((info) => {
          if (info) {
            setCustomerInfo(info);
            if (!customerName || customerName === 'Khách mua tại quầy' || customerName === 'Khách vãng lai') {
              onCustomerNameChange(info.fullName);
            }
          } else {
            setCustomerInfo(null);
          }
        })
        .finally(() => setIsSearching(false));
    } else {
      setCustomerInfo(null);
      setPointsApplied(0);
    }
  }, [customerPhone]);

  // Áp dụng cấn trừ điểm tích lũy (1 điểm = 1.000 VNĐ)
  const handleRedeemPoints = () => {
    if (!customerInfo || customerInfo.loyaltyPoints <= 0) return;
    const pointsToUse = Math.min(customerInfo.loyaltyPoints, 200); // Tối đa dùng 200 điểm/đơn
    const discountVal = pointsToUse * 1000;
    setPointsApplied(pointsToUse);
    if (onApplyLoyaltyDiscount) {
      onApplyLoyaltyDiscount(pointsToUse, discountVal);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'KIM CƯƠNG':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'VÀNG':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'BẠC':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-3 bg-white border-b border-[#d2d6de] space-y-2 font-sans">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[#333] uppercase flex items-center gap-1.5">
          <UserCheck size={14} className="text-[#1b3b6f]" />
          <span>Thông Tin Khách Hàng (Tích Điểm Đa Kênh)</span>
        </span>
        {isSearching && <span className="text-[10px] text-gray-400 italic">Đang tra cứu SĐT...</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Tên khách hàng..."
          className="h-8 px-2.5 text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none"
        />
        <div className="relative">
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            placeholder="Số điện thoại tích điểm..."
            className="w-full h-8 px-2.5 text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none font-mono"
          />
          <PhoneCall size={13} className="absolute right-2.5 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Huy hiệu thành viên & Tích điểm Omnichannel */}
      {customerInfo && (
        <div className="p-2 bg-blue-50/50 border border-blue-200 rounded flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${getTierColor(
                customerInfo.membershipTier
              )} flex items-center gap-1`}
            >
              <Award size={11} />
              <span>{customerInfo.membershipTier}</span>
            </span>
            <span className="text-[11px] text-gray-700">
              Có <strong>{customerInfo.loyaltyPoints} điểm</strong> (~{(customerInfo.loyaltyPoints * 1000).toLocaleString()}đ)
            </span>
          </div>

          {pointsApplied > 0 ? (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <Check size={12} /> Đã trừ {pointsApplied} điểm (-{(pointsApplied * 1000).toLocaleString()}đ)
            </span>
          ) : (
            customerInfo.loyaltyPoints > 0 && (
              <button
                type="button"
                onClick={handleRedeemPoints}
                className="px-2 py-0.5 bg-[#1b3b6f] hover:bg-[#142d55] text-white text-[10px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Sparkles size={10} />
                <span>Dùng {Math.min(customerInfo.loyaltyPoints, 200)} điểm</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
