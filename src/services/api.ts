import axios from 'axios';
import {
  UserProfile,
  ProductVariantItem,
  PosOrderPayload,
  CreateImportReceiptPayload,
  SupplierItem,
  CustomerLoyaltyInfo,
  ReplenishmentItem
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000
});

// Interceptor gắn JWT token nếu có
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('hb_desktop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import webProducts from '../data/products.json';
import { getImageUrl } from '../utils/imageHelper';

// ================= DỮ LIỆU ĐẦY ĐỦ TỪ SOURCE WEB (PRODUCTS & BRANDS) =================
const MOCK_VARIANTS: ProductVariantItem[] = (webProducts as any[]).map((p, idx) => {
  const idNum = Number(p.id) || (idx + 1);
  const total = 25 + ((idNum * 17) % 65); // Tổng tồn từ 25 đến 89 hộp
  // Tạo một số mặt hàng có tồn quầy kệ thấp (<= 5) để kích hoạt hệ thống cảnh báo châm hàng tự động
  const shelf = (idNum % 6 === 0) ? 2 : (idNum % 4 === 0) ? 4 : 8 + (idNum % 10);
  const central = total - shelf;

  return {
    idVariant: idNum,
    sku: p.sku || `HB-${String(idNum).padStart(4, '0')}`,
    barcode: `89360${String(idNum).padStart(7, '0')}`,
    productName: p.name,
    category: p.category || 'Chăm sóc da',
    brand: p.brand || 'Khác',
    capacity: p.capacity || 'Tiêu chuẩn',
    price: Number(p.price) || 100000,
    originalPrice: Number(p.originalPrice) || Number(p.price) || 120000,
    shelfStock: shelf,
    centralStock: central,
    stockQuantity: total,
    shelfMinAlert: 5, // Ngưỡng báo động: còn <= 5 hộp thì báo thủ kho châm hàng
    shelfCapacity: 20, // Kệ chứa tối đa 20 hộp
    thumbnail: getImageUrl(p.thumbnail || p.image || (p.images && p.images[0]))
  };
});

const MOCK_SUPPLIERS: SupplierItem[] = [
  { idSupplier: 1, name: 'Công Ty TNHH L\'Oréal Việt Nam', phone: '028 3936 9999', address: 'Quận 1, TP. Hồ Chí Minh' },
  { idSupplier: 2, name: 'Công Ty Shiseido Cosmetics VN', phone: '028 3824 5555', address: 'Quận 3, TP. Hồ Chí Minh' },
  { idSupplier: 3, name: 'Công Ty CP Dược Mỹ Phẩm Minh Long', phone: '024 3788 1234', address: 'Cầu Giấy, Hà Nội' }
];

const MOCK_INBOUND_HISTORY: any[] = [
  {
    receiptCode: 'PNK-20260928-01',
    supplierName: 'Công Ty CP Dược Mỹ Phẩm Minh Long',
    importDate: '28/09/2026 14:00',
    totalQuantity: 30,
    totalValue: 9750000,
    note: 'Nhập bổ sung Toner Kiehl\'s lô date 2027',
    items: [
      {
        productName: 'Toner Hoa Cúc Kiehl\'s Calendula Herbal Extract',
        capacity: '250ml',
        quantity: 30,
        shelfQuantity: 10,
        centralQuantity: 20,
        importPrice: 325000,
        batchNumber: 'LOT2024-118',
        expiryDate: '2027-02-28'
      }
    ]
  },
  {
    receiptCode: 'PNK-20260925-03',
    supplierName: 'Công Ty Shiseido Cosmetics VN',
    importDate: '25/09/2026 09:30',
    totalQuantity: 50,
    totalValue: 16500000,
    note: 'Nhập chống nắng Anessa lô date mới',
    items: [
      {
        productName: 'Sữa Chống Nắng Anessa Perfect UV Milk SPF50+ PA++++',
        capacity: '60ml',
        quantity: 50,
        shelfQuantity: 15,
        centralQuantity: 35,
        importPrice: 330000,
        batchNumber: 'LOT2024-550',
        expiryDate: '2028-05-15'
      }
    ]
  }
];

const MOCK_REPLENISHMENT_HISTORY: any[] = [
  {
    slipCode: 'DC-20260928-01',
    createdAt: '28/09/2026 19:10',
    performer: 'kho_hoangbao (Thủ kho)',
    totalItems: 3,
    totalQuantity: 28,
    status: 'COMPLETED',
    note: 'Xuất điều chuyển châm hàng quầy kệ đầu ca tối',
    items: [
      { productName: 'Nước Tẩy Trang Bioderma Sensibio H2O (500ml)', sku: 'BIODERMA-MICELLAR-500', quantity: 10 },
      { productName: 'Serum La Roche-Posay Hyalu B5 (30ml)', sku: 'LRP-SERUM-B5-30', quantity: 8 },
      { productName: 'Sữa Chống Nắng Anessa Perfect UV Milk (60ml)', sku: 'ANESSA-SUN-60', quantity: 10 }
    ]
  }
];

export const retailApi = {
  // 1. Đăng nhập tách biệt rõ ràng theo tài khoản & mật khẩu
  login: async (username: string, password?: string): Promise<UserProfile> => {
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      if (res.data?.data) {
        localStorage.setItem('hb_desktop_token', res.data.data.token);
        return res.data.data;
      }
    } catch (e) {
      console.warn('Backend chưa bật, dùng cơ chế xác thực nội bộ');
    }

    const u = username.trim().toLowerCase();
    const p = (password || '').trim();

    // Mật khẩu kiểm tra mặc định 123456
    if (p && p !== '123456') {
      throw new Error('Mật khẩu không chính xác! Vui lòng thử lại.');
    }

    // 1. TÀI KHOẢN DUY NHẤT QUẢN LÝ KHO (Chỉ vào được Kho)
    if (u === 'kho' || u === 'thukho' || u === 'kho_hoangbao' || u === 'warehouse') {
      const user: UserProfile = {
        idUser: 2,
        username: username,
        fullName: 'Bộ Phận Quản Lý Kho',
        role: 'WAREHOUSE_MANAGER',
        token: 'token-warehouse-12345'
      };
      localStorage.setItem('hb_desktop_token', user.token!);
      return user;
    }

    // 2. TÀI KHOẢN DUY NHẤT BÁN HÀNG / THU NGÂN POS (Chỉ vào được POS)
    if (u === 'pos' || u === 'banhang' || u === 'staff_linh' || u === 'pos_staff') {
      const user: UserProfile = {
        idUser: 3,
        username: username,
        fullName: 'Bộ Phận Bán Hàng',
        role: 'STAFF',
        token: 'token-pos-12345'
      };
      localStorage.setItem('hb_desktop_token', user.token!);
      return user;
    }

    // 3. TÀI KHOẢN QUẢN TRỊ VIÊN
    if (u === 'admin') {
      const user: UserProfile = {
        idUser: 1,
        username: username,
        fullName: 'Quản Trị Viên',
        role: 'ADMIN',
        token: 'token-admin-12345'
      };
      localStorage.setItem('hb_desktop_token', user.token!);
      return user;
    }

    // Nếu không khớp tài khoản nào được phân quyền
    throw new Error('Tài khoản không tồn tại hoặc không có quyền truy cập ứng dụng!');
  },

  // 2. Lấy danh sách sản phẩm / biến thể
  getVariants: async (search?: string): Promise<ProductVariantItem[]> => {
    try {
      const res = await apiClient.get('/products', { params: { keyword: search, size: 50 } });
      if (res.data?.data?.content) {
        // Map từ backend response nếu cần
        return res.data.data.content;
      }
    } catch (e) {
      // Mock search
    }

    if (!search || !search.trim()) return MOCK_VARIANTS;
    const term = search.toLowerCase().trim();
    return MOCK_VARIANTS.filter(
      (v) =>
        v.productName.toLowerCase().includes(term) ||
        v.barcode.includes(term) ||
        v.sku.toLowerCase().includes(term)
    );
  },

  // 3. Tạo đơn hàng POS tại quầy
  createPosOrder: async (payload: PosOrderPayload) => {
    try {
      const res = await apiClient.post('/admin/orders/pos', payload);
      return res.data;
    } catch (e) {
      console.warn('Backend chưa kết nối, mô phỏng tạo đơn POS thành công!');
      // Giảm tồn quầy kệ (shelfStock) trong mock
      payload.items.forEach((item) => {
        const found = MOCK_VARIANTS.find((v) => v.idVariant === item.idVariant);
        if (found) {
          found.shelfStock = Math.max(0, found.shelfStock - item.quantity);
          found.stockQuantity = found.shelfStock + found.centralStock;
        }
      });
      return {
        success: true,
        message: 'Tạo đơn hàng tại quầy thành công!',
        data: {
          orderCode: 'POS' + Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString()
        }
      };
    }
  },

  // 4. Lấy nhà cung cấp
  getSuppliers: async (): Promise<SupplierItem[]> => {
    try {
      const res = await apiClient.get('/admin/suppliers');
      if (res.data?.data) return res.data.data;
    } catch (e) {}
    return MOCK_SUPPLIERS;
  },

  // 5. Tạo phiếu nhập kho và phân bổ tồn
  createImportReceipt: async (payload: any) => {
    try {
      const res = await apiClient.post('/admin/warehouse/import-receipts', payload);
      return res.data;
    } catch (e) {
      console.warn('Backend chưa kết nối, mô phỏng tạo phiếu nhập kho thành công!');
      const newItems: any[] = [];
      let totalQty = 0;
      let totalVal = 0;

      payload.items.forEach((item: any) => {
        const found = MOCK_VARIANTS.find((v) => v.idVariant === item.idVariant);
        const toShelf = item.shelfQuantity || 0;
        const toCentral = item.centralQuantity !== undefined ? item.centralQuantity : (item.quantity - toShelf);

        if (found) {
          found.shelfStock += toShelf;
          found.centralStock += toCentral;
          found.stockQuantity = found.shelfStock + found.centralStock;
        }

        totalQty += item.quantity;
        totalVal += item.quantity * item.importPrice;

        newItems.push({
          productName: found?.productName || item.productName || 'Sản phẩm mới',
          capacity: found?.capacity || item.capacity || 'Tiêu chuẩn',
          quantity: item.quantity,
          shelfQuantity: toShelf,
          centralQuantity: toCentral,
          importPrice: item.importPrice,
          batchNumber: item.batchNumber || 'LOT' + Math.floor(1000 + Math.random() * 9000),
          expiryDate: item.expiryDate || '2028-12-31'
        });
      });

      const supplier = MOCK_SUPPLIERS.find((s) => s.idSupplier === payload.supplierId);
      const receiptCode = 'PNK-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

      const record = {
        receiptCode,
        supplierName: supplier?.name || 'Nhà Phân Phối Dược Mỹ Phẩm',
        importDate: new Date().toLocaleString('vi-VN'),
        totalQuantity: totalQty,
        totalValue: totalVal,
        note: payload.note || 'Nhập hàng định kỳ',
        items: newItems
      };

      MOCK_INBOUND_HISTORY.unshift(record);

      return {
        success: true,
        message: 'Lập phiếu nhập kho thành công!',
        data: record
      };
    }
  },

  getInboundHistory: async () => {
    return MOCK_INBOUND_HISTORY;
  },

  // 6. Tra cứu khách hàng theo SĐT để tích điểm & đồng bộ Omnichannel
  lookupCustomer: async (phone: string): Promise<CustomerLoyaltyInfo | null> => {
    const clean = phone.trim().replace(/\s+/g, '');
    if (!clean || clean.length < 9) return null;
    try {
      const res = await apiClient.get('/customers/lookup', { params: { phone: clean } });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (e) {}

    // Mock dữ liệu khách hàng thân thiết nếu chưa kết nối backend trực tiếp
    const mockCustomers: Record<string, CustomerLoyaltyInfo> = {
      '0359490221': {
        idUser: 10,
        fullName: 'Nguyễn Hoàng Bảo',
        phoneNumber: '0359490221',
        loyaltyPoints: 350,
        membershipTier: 'KIM CƯƠNG',
        totalOrders: 18,
        totalSpent: 12500000
      },
      '0912345678': {
        idUser: 11,
        fullName: 'Chị Mai Hoa',
        phoneNumber: '0912345678',
        loyaltyPoints: 120,
        membershipTier: 'VÀNG',
        totalOrders: 6,
        totalSpent: 3800000
      },
      '0988776655': {
        idUser: 12,
        fullName: 'Anh Tuấn Anh',
        phoneNumber: '0988776655',
        loyaltyPoints: 45,
        membershipTier: 'BẠC',
        totalOrders: 2,
        totalSpent: 920000
      }
    };

    return mockCustomers[clean] || null;
  },

  // 7. Lấy mã QR thanh toán (VietQR hoặc MoMo)
  getPaymentQr: async (orderCode: string, method: 'BANK_TRANSFER' | 'MOMO', amount: number) => {
    try {
      const endpoint = method === 'MOMO' ? `/payment/momo/${orderCode}` : `/payment/vietqr/${orderCode}`;
      const res = await apiClient.get(endpoint);
      if (res.data?.data) return res.data.data;
    } catch (e) {}

    // Fallback QR code chuyên nghiệp
    if (method === 'MOMO') {
      const momoData = encodeURIComponent(`2|99|0359490221|NGUYEN HOANG BAO||0|0|${Math.round(amount)}|${orderCode}|transfer_myqr`);
      return {
        orderCode,
        totalAmount: amount,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${momoData}`,
        bankId: 'MOMO',
        accountNumber: '0359490221',
        accountName: 'NGUYEN HOANG BAO',
        content: orderCode,
        paymentMethod: 'MOMO'
      };
    } else {
      return {
        orderCode,
        totalAmount: amount,
        qrCodeUrl: `https://api.vietqr.io/image/970422-0359490221-compact2.png?amount=${Math.round(amount)}&addInfo=${orderCode}&accountName=NGUYEN%20HOANG%20BAO`,
        bankId: 'MBBank',
        accountNumber: '0359490221',
        accountName: 'NGUYEN HOANG BAO',
        content: orderCode,
        paymentMethod: 'BANK_TRANSFER'
      };
    }
  },

  // 8. Polling kiểm tra trạng thái thanh toán từ API (chỉ hoàn tất khi API báo đã nhận tiền)
  checkPaymentStatus: async (orderCode: string): Promise<{ isPaid: boolean; status?: string }> => {
    try {
      const res = await apiClient.get(`/payment/check-status/${orderCode}`);
      if (res.data?.data) {
        return {
          isPaid: Boolean(res.data.data.isPaid),
          status: res.data.data.status
        };
      }
    } catch (e) {}
    return { isPaid: false };
  },

  // 9. Lấy danh sách mặt hàng cần châm ra quầy kệ (Auto-Replenishment Alert)
  getReplenishmentAlerts: async (): Promise<ReplenishmentItem[]> => {
    return MOCK_VARIANTS
      .filter((v) => (v.shelfStock <= (v.shelfMinAlert || 5) || v.staffReportedUrgent) && v.centralStock > 0)
      .map((v) => {
        const capacity = v.shelfCapacity || 20;
        const needed = capacity - v.shelfStock;
        const suggested = Math.min(v.centralStock, needed);
        return {
          idVariant: v.idVariant,
          productName: v.productName,
          sku: v.sku,
          barcode: v.barcode,
          brand: v.brand,
          capacity: v.capacity,
          shelfStock: v.shelfStock,
          centralStock: v.centralStock,
          shelfMinAlert: v.shelfMinAlert || 5,
          shelfCapacity: capacity,
          suggestedQuantity: Math.max(suggested, 1),
          staffReportedUrgent: Boolean(v.staffReportedUrgent)
        };
      })
      .sort((a, b) => (b.staffReportedUrgent ? 1 : 0) - (a.staffReportedUrgent ? 1 : 0));
  },

  // 10. Thu ngân báo hết hàng trên quầy kệ [Khẩn cấp]
  reportShelfOutOfStock: async (idVariant: number): Promise<boolean> => {
    const found = MOCK_VARIANTS.find((v) => v.idVariant === idVariant);
    if (found) {
      found.staffReportedUrgent = true;
      return true;
    }
    return false;
  },

  // 11. Thủ kho thực hiện châm hàng từ Kho Tổng ra Quầy kệ
  restockShelf: async (idVariant: number, quantity: number): Promise<boolean> => {
    const found = MOCK_VARIANTS.find((v) => v.idVariant === idVariant);
    if (!found || found.centralStock < quantity) return false;
    found.centralStock -= quantity;
    found.shelfStock += quantity;
    found.stockQuantity = found.shelfStock + found.centralStock;
    found.staffReportedUrgent = false; // Xóa trạng thái báo gấp khi đã châm hàng
    return true;
  },

  // 12. Châm toàn bộ theo đề xuất tự động
  restockAllSuggested: async (): Promise<number> => {
    let count = 0;
    MOCK_VARIANTS.forEach((v) => {
      if ((v.shelfStock <= (v.shelfMinAlert || 5) || v.staffReportedUrgent) && v.centralStock > 0) {
        const capacity = v.shelfCapacity || 20;
        const needed = capacity - v.shelfStock;
        const moveQty = Math.min(v.centralStock, needed);
        if (moveQty > 0) {
          v.centralStock -= moveQty;
          v.shelfStock += moveQty;
          v.stockQuantity = v.shelfStock + v.centralStock;
          v.staffReportedUrgent = false;
          count++;
        }
      }
    });
    return count;
  },

  // 13. Lập Phiếu Điều Chuyển Hàng Ra Kệ 1 lần (Batch Replenishment Slip)
  createReplenishmentBatch: async (
    items: { idVariant: number; quantity: number }[],
    note?: string
  ): Promise<{ slipCode: string; totalItems: number; totalQuantity: number }> => {
    let totalQty = 0;
    const slipItems: any[] = [];

    items.forEach((item) => {
      const found = MOCK_VARIANTS.find((v) => v.idVariant === item.idVariant);
      if (found && item.quantity > 0) {
        const actualMove = Math.min(found.centralStock, item.quantity);
        if (actualMove > 0) {
          found.centralStock -= actualMove;
          found.shelfStock += actualMove;
          found.stockQuantity = found.shelfStock + found.centralStock;
          found.staffReportedUrgent = false;
          totalQty += actualMove;
          slipItems.push({
            productName: found.productName,
            sku: found.sku,
            quantity: actualMove
          });
        }
      }
    });

    const slipCode =
      'DC-' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const record = {
      slipCode,
      createdAt: new Date().toLocaleString('vi-VN'),
      performer: 'kho_hoangbao (Thủ kho)',
      totalItems: slipItems.length,
      totalQuantity: totalQty,
      status: 'COMPLETED',
      note: note || 'Xuất điều chuyển châm hàng ra quầy kệ',
      items: slipItems
    };

    MOCK_REPLENISHMENT_HISTORY.unshift(record);

    return {
      slipCode,
      totalItems: slipItems.length,
      totalQuantity: totalQty
    };
  },

  // 14. Lấy lịch sử các đợt điều chuyển châm hàng
  getReplenishmentHistory: async () => {
    return MOCK_REPLENISHMENT_HISTORY;
  }
};
