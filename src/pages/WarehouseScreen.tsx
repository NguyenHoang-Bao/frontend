import React, { useState, useEffect } from 'react';
import { ProductVariantItem, SupplierItem, UserProfile } from '../types';
import { retailApi } from '../services/api';
import WarehouseNavbar, { WarehouseSubTab } from '../components/warehouse/WarehouseNavbar';
import FulfillmentTab, { OnlineOrderToPack } from '../components/warehouse/FulfillmentTab';
import InboundTab from '../components/warehouse/InboundTab';
import StocktakeTab from '../components/warehouse/StocktakeTab';
import ExpiryManagementTab, { BatchItem } from '../components/warehouse/ExpiryManagementTab';
import AuditLogsTab from '../components/warehouse/AuditLogsTab';
import ReplenishmentTab from '../components/warehouse/ReplenishmentTab';

interface WarehouseScreenProps {
  currentUser: UserProfile;
}

const INITIAL_ONLINE_ORDERS: OnlineOrderToPack[] = [
  {
    idOrder: 1004,
    orderCode: 'DH-SHIP-8830',
    customerName: 'Trần Thị Thu Hà',
    phoneNumber: '0909 888 777',
    shippingType: 'HOA_TOC',
    trackingCode: 'KIEN-HT-8830',
    status: 'PENDING_PICK',
    items: [
      {
        idVariant: 105,
        productName: 'Toner Hoa Cúc Kiehl\'s Calendula Herbal Extract',
        capacity: '250ml',
        sku: 'KIEHLS-CALENDULA-250',
        barcode: '893600123405',
        suggestedLot: 'LOT2024-118',
        expiryDate: '28/02/2027',
        quantity: 1,
        scannedCount: 0
      }
    ]
  },
  {
    idOrder: 1001,
    orderCode: 'DH-SHIP-8821',
    customerName: 'Nguyễn Thị Minh Hạnh',
    phoneNumber: '0912 345 678',
    shippingType: 'TIEU_CHUAN',
    trackingCode: 'KIEN-TC-8821',
    status: 'PENDING_PICK',
    items: [
      {
        idVariant: 101,
        productName: 'Serum La Roche-Posay Hyalu B5 Cấp Ẩm Phục Hồi',
        capacity: '30ml',
        sku: 'LRP-SERUM-B5-30',
        barcode: '893600123401',
        suggestedLot: 'LOT2024-891',
        expiryDate: '30/08/2027',
        quantity: 1,
        scannedCount: 0
      },
      {
        idVariant: 104,
        productName: 'Nước Tẩy Trang Bioderma Sensibio H2O Nắp Hồng',
        capacity: '500ml',
        sku: 'BIODERMA-MICELLAR-500',
        barcode: '893600123404',
        suggestedLot: 'LOT2024-512',
        expiryDate: '15/10/2027',
        quantity: 2,
        scannedCount: 0
      }
    ]
  },
  {
    idOrder: 1002,
    orderCode: 'DH-SHIP-8822',
    customerName: 'Lê Hoàng Yến Nhi',
    phoneNumber: '0988 765 432',
    shippingType: 'TIEU_CHUAN',
    trackingCode: 'KIEN-TC-8822',
    status: 'PENDING_PICK',
    items: [
      {
        idVariant: 103,
        productName: 'Sữa Chống Nắng Anessa Perfect UV Milk SPF50+ PA++++',
        capacity: '60ml',
        sku: 'ANESSA-SUN-60',
        barcode: '893600123403',
        suggestedLot: 'LOT2023-412',
        expiryDate: '15/11/2026',
        quantity: 1,
        scannedCount: 0
      }
    ]
  },
  {
    idOrder: 1003,
    orderCode: 'DH-SHIP-8825',
    customerName: 'Phạm Thu Trang',
    phoneNumber: '0933 112 233',
    shippingType: 'TIEU_CHUAN',
    trackingCode: 'KIEN-TC-8825',
    status: 'READY_FOR_SHIPPER',
    items: [
      {
        idVariant: 106,
        productName: 'Son Thỏi Lì MAC Matte Lipstick Màu Chili Đỏ Gạch',
        capacity: '3g',
        sku: 'MAC-LIP-CHILI',
        barcode: '893600123406',
        suggestedLot: 'LOT2024-904',
        expiryDate: '20/09/2028',
        quantity: 1,
        scannedCount: 1
      }
    ]
  }
];

const MOCK_BATCHES: BatchItem[] = [
  {
    id: 'b1',
    productName: 'Serum La Roche-Posay Hyalu B5 Cấp Ẩm Phục Hồi',
    sku: 'LRP-SERUM-B5-30',
    batchNumber: 'LOT2024-891',
    expiryDate: '2027-08-30',
    quantity: 42,
    status: 'SAFE'
  },
  {
    id: 'b2',
    productName: 'Sữa Chống Nắng Anessa Perfect UV Milk SPF50+ PA++++',
    sku: 'ANESSA-SUN-60',
    batchNumber: 'LOT2023-412',
    expiryDate: '2026-11-15',
    quantity: 15,
    status: 'CRITICAL'
  },
  {
    id: 'b3',
    productName: 'Toner Hoa Cúc Kiehl\'s Calendula Herbal Extract',
    sku: 'KIEHLS-CALENDULA-250',
    batchNumber: 'LOT2024-118',
    expiryDate: '2027-02-28',
    quantity: 8,
    status: 'WARNING'
  }
];

export default function WarehouseScreen({ currentUser }: WarehouseScreenProps) {
  const [activeTab, setActiveTab] = useState<WarehouseSubTab>('fulfillment');
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrderToPack[]>(INITIAL_ONLINE_ORDERS);

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    const vList = await retailApi.getVariants();
    setVariants(vList);
    const sList = await retailApi.getSuppliers();
    setSuppliers(sList);
  };

  const handleSaveInbound = async (payload: any) => {
    const res = await retailApi.createImportReceipt(payload);
    loadBaseData();
    return res;
  };

  const pendingOrders = onlineOrders.filter((o) => o.status !== 'HANDED_OVER').length;
  const [replenishmentCount, setReplenishmentCount] = useState<number>(0);

  useEffect(() => {
    retailApi.getReplenishmentAlerts().then((data) => setReplenishmentCount(data.length));
  }, [activeTab]);

  const criticalExpiryCount = MOCK_BATCHES.filter((b) => b.status === 'CRITICAL').length;

  return (
    <div className="h-[calc(100vh-44px)] flex flex-col overflow-hidden bg-[#eef1f5] font-sans text-xs">
      {/* THANH MENU ĐIỀU HƯỚNG WMS */}
      <WarehouseNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrderCount={pendingOrders}
        criticalExpiryCount={criticalExpiryCount}
        replenishmentCount={replenishmentCount}
      />

      {/* 1. XỬ LÝ ĐƠN ONLINE (PICK & PACK) */}
      {activeTab === 'fulfillment' && (
        <FulfillmentTab
          orders={onlineOrders}
          onOrdersChange={setOnlineOrders}
        />
      )}

      {/* 2. NHẬP KHO & LÔ HÀNG */}
      {activeTab === 'inbound' && (
        <InboundTab
          suppliers={suppliers}
          variants={variants}
          onSaveInbound={handleSaveInbound}
        />
      )}

      {/* 3. ĐỀ XUẤT CHÂM HÀNG RA KỆ (AUTO-REPLENISHMENT) */}
      {activeTab === 'replenishment' && <ReplenishmentTab />}

      {/* 4. KIỂM KÊ & CÂN BẰNG TỒN */}
      {activeTab === 'stocktake' && (
        <StocktakeTab
          variants={variants}
          onAdjustmentApplied={loadBaseData}
        />
      )}

      {/* 5. HẠN SỬ DỤNG FEFO */}
      {activeTab === 'expiry' && (
        <ExpiryManagementTab
          batches={MOCK_BATCHES}
          onProposeFlashSale={() =>
            alert('Đã gửi thông báo danh sách cận date sang Admin để mở Flash Sale!')
          }
        />
      )}

      {/* 6. SỔ CÁI BIẾN ĐỘNG KHO */}
      {activeTab === 'logs' && <AuditLogsTab />}
    </div>
  );
}
