export interface UserProfile {
  idUser: number;
  username: string;
  fullName: string;
  role: 'STAFF' | 'WAREHOUSE_MANAGER' | 'ADMIN';
  token?: string;
}

export interface ProductVariantItem {
  idVariant: number;
  sku: string;
  barcode: string;
  productName: string;
  category: string;
  brand: string;
  capacity: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number; // Tổng tồn
  shelfStock: number;    // Tồn tại quầy kệ POS
  centralStock: number;  // Tồn tại kho tổng
  shelfMinAlert: number; // Ngưỡng báo động châm hàng (mặc định 5)
  shelfCapacity: number; // Sức chứa tối đa của kệ (mặc định 20)
  staffReportedUrgent?: boolean; // Thu ngân POS báo hết khẩn cấp
  thumbnail?: string;
}

export interface ReplenishmentItem {
  idVariant: number;
  productName: string;
  sku: string;
  barcode: string;
  brand: string;
  capacity: string;
  shelfStock: number;
  centralStock: number;
  shelfMinAlert: number;
  shelfCapacity: number;
  suggestedQuantity: number;
  staffReportedUrgent?: boolean;
}

export interface CartItem {
  variant: ProductVariantItem;
  quantity: number;
  discount?: number; // vnđ hoặc %
}

export interface ParkedOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  cart: CartItem[];
  discountAmount: number;
  discountType: 'PERCENT' | 'FIXED';
  parkedAt: string;
}

export interface CustomerLoyaltyInfo {
  idUser?: number;
  fullName: string;
  phoneNumber: string;
  loyaltyPoints: number;
  membershipTier: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface PosOrderPayload {
  customerName: string;
  phoneNumber?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO';
  note?: string;
  discount?: number;
  redeemPoints?: number;
  items: {
    idVariant: number;
    quantity: number;
  }[];
}

export interface ImportReceiptItem {
  idVariant: number;
  productName: string;
  capacity: string;
  quantity: number;
  importPrice: number;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
}

export interface CreateImportReceiptPayload {
  supplierId: number;
  note: string;
  items: {
    idVariant: number;
    quantity: number;
    importPrice: number;
  }[];
}

export interface SupplierItem {
  idSupplier: number;
  name: string;
  phone: string;
  address: string;
}
