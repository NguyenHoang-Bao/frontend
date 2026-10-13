import React, { useState } from 'react';
import {
  FileText,
  Search,
  ShoppingCart,
  Truck,
  ArrowRightLeft,
  Boxes,
  AlertTriangle,
  Download,
  Filter,
  User,
  Package,
  Calendar
} from 'lucide-react';

export interface InventoryLogEntry {
  id: string;
  code: string; // Mã giao dịch
  timestamp: string;
  productName: string;
  sku: string;
  barcode: string;
  capacity: string;
  type: 'BAN_QUAY' | 'XUAT_GIAO' | 'CHUYEN_KE' | 'NHAP_KHO' | 'KIEM_KE_HAO';
  typeLabel: string;
  location: string; // Vị trí kho ảnh hưởng
  changeQty: number; // + hoặc -
  balanceShelf: number; // Tồn quầy sau giao dịch
  balanceStorage: number; // Tồn kho sau giao dịch
  performer: string;
  performerRole: 'Thu ngân' | 'Thủ kho' | 'Quản lý';
  refDocument: string; // Chứng từ tham chiếu (Hóa đơn, Phiếu nhập, Phiếu xuất...)
  note?: string;
}

const MOCK_LOGS: InventoryLogEntry[] = [
  {
    id: '1',
    code: 'GD-2026-0928-07',
    timestamp: '28/09/2026 21:15',
    productName: 'Son Thỏi Lì MAC Matte Lipstick Màu Chili Đỏ Gạch',
    sku: 'MAC-CHILI-3G',
    barcode: '773602056638',
    capacity: '3g',
    type: 'BAN_QUAY',
    typeLabel: 'Bán lẻ tại quầy',
    location: 'Quầy Bán Kệ',
    changeQty: -1,
    balanceShelf: 4,
    balanceStorage: 18,
    performer: 'Trần Thảo Linh',
    performerRole: 'Thu ngân',
    refDocument: 'Hóa đơn #POS-892110',
    note: 'Khách thanh toán quét mã QR VietQR'
  },
  {
    id: '2',
    code: 'GD-2026-0928-06',
    timestamp: '28/09/2026 20:40',
    productName: 'Serum La Roche-Posay Hyalu B5 Cấp Ẩm Phục Hồi',
    sku: 'LRP-B5-30ML',
    barcode: '3337875583626',
    capacity: '30ml',
    type: 'XUAT_GIAO',
    typeLabel: 'Xuất hàng giao online',
    location: 'Kho Phía Sau',
    changeQty: -1,
    balanceShelf: 2,
    balanceStorage: 14,
    performer: 'Hoàng Quốc Bảo',
    performerRole: 'Thủ kho',
    refDocument: 'Đơn giao #DH-SHIP-8821',
    note: 'Giao tiêu chuẩn'
  },
  {
    id: '3',
    code: 'GD-2026-0928-05',
    timestamp: '28/09/2026 19:10',
    productName: 'Nước Tẩy Trang Bioderma Sensibio H2O Nắp Hồng',
    sku: 'BIO-H2O-500ML',
    barcode: '3401570228214',
    capacity: '500ml',
    type: 'CHUYEN_KE',
    typeLabel: 'Chuyển ra quầy kệ',
    location: 'Kho ➔ Quầy',
    changeQty: 10, // Quầy +10, Kho -10
    balanceShelf: 13,
    balanceStorage: 12,
    performer: 'Hoàng Quốc Bảo',
    performerRole: 'Thủ kho',
    refDocument: 'Phiếu chuyển #DC-20260928',
    note: 'Châm hàng do quầy sắp hết'
  },
  {
    id: '4',
    code: 'GD-2026-0928-04',
    timestamp: '28/09/2026 16:30',
    productName: 'Sữa Chống Nắng Anessa Perfect UV Milk SPF50+',
    sku: 'ANE-SUN-60ML',
    barcode: '4909978120719',
    capacity: '60ml',
    type: 'XUAT_GIAO',
    typeLabel: 'Xuất hàng giao online',
    location: 'Kho Phía Sau',
    changeQty: -1,
    balanceShelf: 5,
    balanceStorage: 21,
    performer: 'Hoàng Quốc Bảo',
    performerRole: 'Thủ kho',
    refDocument: 'Đơn giao #DH-SHIP-8830',
    note: 'Giao Hỏa Tốc (Ahamove nhận)'
  },
  {
    id: '5',
    code: 'GD-2026-0928-03',
    timestamp: '28/09/2026 14:00',
    productName: 'Toner Hoa Cúc Kiehl\'s Calendula Herbal Extract',
    sku: 'KHL-TONER-250',
    barcode: '3605970014210',
    capacity: '250ml',
    type: 'NHAP_KHO',
    typeLabel: 'Nhập hàng từ NCC',
    location: 'Kho Phía Sau',
    changeQty: 30,
    balanceShelf: 3,
    balanceStorage: 30,
    performer: 'Hoàng Quốc Bảo',
    performerRole: 'Thủ kho',
    refDocument: 'Phiếu nhập #PNK-20260928',
    note: 'NCC Dược Mỹ Phẩm Minh Long'
  },
  {
    id: '6',
    code: 'GD-2026-0928-02',
    timestamp: '27/09/2026 18:20',
    productName: 'Nước Tẩy Trang Bioderma Sensibio H2O Nắp Hồng',
    sku: 'BIO-H2O-500ML',
    barcode: '3401570228214',
    capacity: '500ml',
    type: 'KIEM_KE_HAO',
    typeLabel: 'Xuất hao hụt / Hỏng',
    location: 'Quầy Bán Kệ',
    changeQty: -1,
    balanceShelf: 3,
    balanceStorage: 22,
    performer: 'Hoàng Quốc Bảo',
    performerRole: 'Thủ kho',
    refDocument: 'Biên bản #BB-20260927',
    note: 'Khách sơ ý làm rơi vỡ nắp tại quầy'
  },
  {
    id: '7',
    code: 'GD-2026-0928-01',
    timestamp: '27/09/2026 11:15',
    productName: 'Kem Dưỡng Bioderma Sensibio Soothing Cream',
    sku: 'BIO-CREAM-40ML',
    barcode: '3401347871276',
    capacity: '40ml',
    type: 'BAN_QUAY',
    typeLabel: 'Bán lẻ tại quầy',
    location: 'Quầy Bán Kệ',
    changeQty: -2,
    balanceShelf: 6,
    balanceStorage: 15,
    performer: 'Trần Thảo Linh',
    performerRole: 'Thu ngân',
    refDocument: 'Hóa đơn #POS-891902',
    note: 'Khách trả tiền mặt'
  }
];

export default function AuditLogsTab() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = MOCK_LOGS.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.code.toLowerCase().includes(term) ||
      item.productName.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term) ||
      item.barcode.includes(term) ||
      item.refDocument.toLowerCase().includes(term) ||
      item.performer.toLowerCase().includes(term)
    );
  });

  // Thống kê nhanh trong ngày
  const totalTransactions = MOCK_LOGS.length;
  const totalSold = MOCK_LOGS.filter((l) => l.type === 'BAN_QUAY' || l.type === 'XUAT_GIAO')
    .reduce((acc, l) => acc + Math.abs(l.changeQty), 0);
  const totalRestocked = MOCK_LOGS.filter((l) => l.type === 'CHUYEN_KE')
    .reduce((acc, l) => acc + l.changeQty, 0);
  const totalImported = MOCK_LOGS.filter((l) => l.type === 'NHAP_KHO')
    .reduce((acc, l) => acc + l.changeQty, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#ecf0f5] overflow-hidden p-3 space-y-3 font-sans text-xs">
      {/* 4 THẺ TỔNG HỢP NHANH */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-white p-2.5 rounded border border-[#d2d6de] flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded bg-blue-50 text-[#1b3b6f] flex items-center justify-center font-bold">
            <FileText size={16} />
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Tổng Giao Dịch</div>
            <div className="font-bold text-sm text-gray-900">{totalTransactions} lượt</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded border border-[#d2d6de] flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShoppingCart size={16} />
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Xuất Bán / Giao Đi</div>
            <div className="font-bold text-sm text-red-600">{totalSold} hộp</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded border border-[#d2d6de] flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Chuyển Ra Quầy Bán</div>
            <div className="font-bold text-sm text-cyan-800">{totalRestocked} hộp</div>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded border border-[#d2d6de] flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Boxes size={16} />
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Nhập Mới Vào Kho</div>
            <div className="font-bold text-sm text-emerald-700">+{totalImported} hộp</div>
          </div>
        </div>
      </div>

      {/* THANH CÔNG CỤ TÌM KIẾM VÀ BỘ LỌC CHỈN CHU */}
      <div className="p-3 bg-white border border-[#d2d6de] rounded shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-[#1b3b6f]" />
            <div>
              <h3 className="font-bold text-xs uppercase text-[#1b3b6f]">
                Sổ Nhật Ký Biến Động Kho Hàng
              </h3>
              <p className="text-[11px] text-gray-500">
                Đối soát toàn bộ luồng hàng: Bán lẻ quầy, Đóng gói giao đi, Chuyển kệ và Nhập kho
              </p>
            </div>
          </div>

          {/* Ô TÌM KIẾM */}
          <div className="relative w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã GD, tên mỹ phẩm, mã vạch, chứng từ..."
              className="w-full h-8 pl-8 pr-2.5 text-xs border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none bg-white"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* CÁC NÚT LỌC LOẠI NGHIỆP VỤ */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#eee]">
          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 mr-1">
            <Filter size={12} /> Lọc:
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              filterType === 'ALL'
                ? 'bg-[#1b3b6f] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất Cả ({MOCK_LOGS.length})
          </button>

          <button
            onClick={() => setFilterType('BAN_QUAY')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              filterType === 'BAN_QUAY'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <ShoppingCart size={12} />
            <span>Bán Tại Quầy</span>
          </button>

          <button
            onClick={() => setFilterType('XUAT_GIAO')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              filterType === 'XUAT_GIAO'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Truck size={12} />
            <span>Xuất Giao Online</span>
          </button>

          <button
            onClick={() => setFilterType('CHUYEN_KE')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              filterType === 'CHUYEN_KE'
                ? 'bg-cyan-700 text-white shadow-2xs'
                : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
            }`}
          >
            <ArrowRightLeft size={12} />
            <span>Chuyển Ra Quầy</span>
          </button>

          <button
            onClick={() => setFilterType('NHAP_KHO')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              filterType === 'NHAP_KHO'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Boxes size={12} />
            <span>Nhập Kho NCC</span>
          </button>

          <button
            onClick={() => setFilterType('KIEM_KE_HAO')}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              filterType === 'KIEM_KE_HAO'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle size={12} />
            <span>Hao Hụt / Hỏng</span>
          </button>
        </div>
      </div>

      {/* BẢNG SỔ KHO ĐẦY ĐỦ ĐỐI SOÁT - RÕ RÀNG & CHUYÊN NGHIỆP */}
      <div className="flex-1 overflow-y-auto bg-white border border-[#d2d6de] rounded shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f4f6f9] text-[#444] font-bold border-b border-[#d2d6de] text-[11px] uppercase">
              <th className="p-2.5 border-r border-[#d2d6de] w-28 font-mono">Mã Giao Dịch</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-32">Thời Gian</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-36">Loại Nghiệp Vụ</th>
              <th className="p-2.5 border-r border-[#d2d6de]">Sản Phẩm & Mã Vạch</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-28 text-center">Vị Trí</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-24 text-right font-mono">Biến Động</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-36 text-center font-mono">Tồn Sau Giao Dịch</th>
              <th className="p-2.5 border-r border-[#d2d6de] w-32">Người Thực Hiện</th>
              <th className="p-2.5">Chứng Từ / Ghi Chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400">
                  <Package size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-semibold text-gray-600">Không tìm thấy giao dịch nào</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/25 transition-colors">
                  {/* MÃ GIAO DỊCH */}
                  <td className="p-2.5 align-top border-r border-[#eee] font-mono text-[11px] font-bold text-gray-700">
                    {item.code}
                  </td>

                  {/* THỜI GIAN */}
                  <td className="p-2.5 align-top border-r border-[#eee] text-gray-600 text-[11px] whitespace-nowrap">
                    {item.timestamp}
                  </td>

                  {/* LOẠI NGHIỆP VỤ */}
                  <td className="p-2.5 align-top border-r border-[#eee]">
                    {item.type === 'BAN_QUAY' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShoppingCart size={11} /> Bán Lẻ Quầy
                      </span>
                    )}
                    {item.type === 'XUAT_GIAO' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Truck size={11} /> Xuất Giao Hàng
                      </span>
                    )}
                    {item.type === 'CHUYEN_KE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        <ArrowRightLeft size={11} /> Chuyển Ra Kệ
                      </span>
                    )}
                    {item.type === 'NHAP_KHO' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Boxes size={11} /> Nhập Kho Mới
                      </span>
                    )}
                    {item.type === 'KIEM_KE_HAO' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertTriangle size={11} /> Hao Hụt / Hỏng
                      </span>
                    )}
                  </td>

                  {/* SẢN PHẨM & MÃ VẠCH */}
                  <td className="p-2.5 align-top border-r border-[#eee]">
                    <div className="font-bold text-gray-900 leading-snug">{item.productName}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                      <span>Mã vạch: <span className="font-semibold text-gray-700">{item.barcode}</span></span>
                      <span>•</span>
                      <span>Dung tích: {item.capacity}</span>
                    </div>
                  </td>

                  {/* VỊ TRÍ KHO */}
                  <td className="p-2.5 align-top border-r border-[#eee] text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                      {item.location}
                    </span>
                  </td>

                  {/* SỐ LƯỢNG BIẾN ĐỘNG */}
                  <td className="p-2.5 align-top border-r border-[#eee] text-right font-mono font-bold whitespace-nowrap">
                    {item.type === 'CHUYEN_KE' ? (
                      <span className="text-cyan-700">+{item.changeQty} kệ</span>
                    ) : item.changeQty > 0 ? (
                      <span className="text-emerald-700">+{item.changeQty}</span>
                    ) : (
                      <span className="text-red-600">{item.changeQty}</span>
                    )}
                  </td>

                  {/* TỒN SAU ĐÓ (ĐỐI SOÁT QUAN TRỌNG) */}
                  <td className="p-2.5 align-top border-r border-[#eee] text-center font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-[11px]">
                      <span className="text-gray-600">Kệ: <strong className="text-gray-900">{item.balanceShelf}</strong></span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">Kho: <strong className="text-gray-900">{item.balanceStorage}</strong></span>
                    </div>
                  </td>

                  {/* NGƯỜI THỰC HIỆN */}
                  <td className="p-2.5 align-top border-r border-[#eee] whitespace-nowrap">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <User size={12} className="text-gray-400" />
                      <span>{item.performer}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 pl-4">{item.performerRole}</div>
                  </td>

                  {/* CHỨNG TỪ & GHI CHÚ */}
                  <td className="p-2.5 align-top">
                    <div className="font-bold text-gray-800 text-[11px]">{item.refDocument}</div>
                    {item.note && (
                      <div className="text-[11px] text-gray-500 mt-0.5 italic">{item.note}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER ĐỐI SOÁT */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
        <span>Hiển thị <strong>{filteredLogs.length}</strong> / <strong>{MOCK_LOGS.length}</strong> giao dịch biến động</span>
        <span className="italic">* Dữ liệu được ghi nhận tự động theo thời gian thực mỗi khi có đơn bán, xuất kho hoặc chuyển kệ</span>
      </div>
    </div>
  );
}
