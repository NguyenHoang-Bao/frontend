import React, { useState, useEffect, useCallback } from 'react';
import { ProductVariantItem, CartItem, UserProfile, ParkedOrder, PosOrderPayload } from '../types';
import { retailApi } from '../services/api';
import ProductCatalog from '../components/pos/ProductCatalog';
import CustomerInfoBar from '../components/pos/CustomerInfoBar';
import CartTable from '../components/pos/CartTable';
import PaymentSummary from '../components/pos/PaymentSummary';
import DynamicQrPaymentModal from '../components/pos/DynamicQrPaymentModal';
import ThermalReceiptModal from '../components/pos/ThermalReceiptModal';
import ParkedOrdersModal from '../components/pos/ParkedOrdersModal';

interface PosScreenProps {
  currentUser: UserProfile;
}

export default function PosScreen({ currentUser }: PosScreenProps) {
  const [products, setProducts] = useState<ProductVariantItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Khách mua tại quầy');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'MOMO'>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingOrderCode, setPendingOrderCode] = useState<string>('');
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Thông báo cần hàng gấp cho Thủ kho
  const handleReportOutOfStock = async (variant: ProductVariantItem) => {
    await retailApi.reportShelfOutOfStock(variant.idVariant);
    setReportedIds((prev) => new Set(prev).add(variant.idVariant));
    alert(
      `ĐÃ GỬI THÔNG BÁO CẦN HÀNG GẤP!\nSản phẩm: "${variant.productName}"\n\nThủ kho đã nhận được tín hiệu ưu tiên để mang hàng từ Kho tổng ra quầy.`
    );
  };

  // Đơn treo tạm thời lưu vào LocalStorage
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('hb_pos_parked_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hb_pos_parked_orders', JSON.stringify(parkedOrders));
  }, [parkedOrders]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const list = await retailApi.getVariants();
    setProducts(list);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    const term = search.trim().toLowerCase();
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === term ||
        p.sku.toLowerCase() === term ||
        p.productName.toLowerCase() === term
    );

    if (found) {
      handleAddToCart(found);
      setSearch('');
    } else {
      // Tìm sản phẩm đầu tiên khớp nếu có
      const partial = products.find(
        (p) =>
          p.barcode.includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.productName.toLowerCase().includes(term)
      );
      if (partial) {
        handleAddToCart(partial);
        setSearch('');
      } else {
        alert(`Không tìm thấy sản phẩm với mã "${search}"!`);
      }
    }
  };

  const handleAddToCart = (variant: ProductVariantItem) => {
    const available = variant.shelfStock !== undefined ? variant.shelfStock : variant.stockQuantity;
    if (available <= 0) {
      if (variant.centralStock > 0) {
        if (
          window.confirm(
            `Sản phẩm "${variant.productName}" đã HẾT HÀNG TRÊN QUẦY KỆ!\n(Kho tổng hiện còn ${variant.centralStock} hộp).\n\nBạn có muốn gửi [THÔNG BÁO CẦN HÀNG GẤP] tới Thủ kho để mang hàng ra quầy không?`
          )
        ) {
          handleReportOutOfStock(variant);
        }
      } else {
        alert(`Sản phẩm "${variant.productName}" đã hết sạch toàn hệ thống (cả quầy và kho tổng)!`);
      }
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.variant.idVariant === variant.idVariant);
      if (existing) {
        if (existing.quantity >= available) {
          alert(`Chỉ còn ${available} sản phẩm trên quầy kệ! (Kho tổng còn ${variant.centralStock} hộp)`);
          return prev;
        }
        return prev.map((item) =>
          item.variant.idVariant === variant.idVariant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { variant, quantity: 1, discount: 0 }];
    });
  };

  const handleUpdateQuantity = (idVariant: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant.idVariant === idVariant) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.variant.stockQuantity) {
              alert(`Chỉ còn ${item.variant.stockQuantity} sản phẩm trong kho!`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleSetQuantity = (idVariant: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.variant.idVariant === idVariant ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleRemoveItem = (idVariant: number) => {
    setCart((prev) => prev.filter((item) => item.variant.idVariant !== idVariant));
  };

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) return;
    if (window.confirm('Bạn có muốn hủy đơn hàng hiện tại để tạo đơn mới không? [F8]')) {
      setCart([]);
      setCustomerName('Khách mua tại quầy');
      setCustomerPhone('');
      setDiscountAmount(0);
      setRedeemPoints(0);
      setCashGiven(0);
      setPendingOrderCode('');
    }
  }, [cart]);

  // Nghiệp vụ Treo Đơn (Hold / Park Order - F4)
  const handleParkOrder = useCallback(() => {
    if (cart.length === 0) {
      alert('Giỏ hàng đang trống, không thể treo đơn!');
      return;
    }

    const newParked: ParkedOrder = {
      id: 'PARK-' + Date.now(),
      orderCode: 'TREO-' + Math.floor(1000 + Math.random() * 9000),
      customerName: customerName.trim() || 'Khách vãng lai',
      customerPhone: customerPhone.trim(),
      cart: [...cart],
      discountAmount,
      discountType: 'FIXED',
      parkedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setParkedOrders((prev) => [newParked, ...prev]);
    setCart([]);
    setCustomerName('Khách mua tại quầy');
    setCustomerPhone('');
    setDiscountAmount(0);
    setRedeemPoints(0);
    setCashGiven(0);
    setPendingOrderCode('');
  }, [cart, customerName, customerPhone, discountAmount]);

  // Mở lại đơn đã treo
  const handleResumeParkedOrder = (order: ParkedOrder) => {
    if (cart.length > 0) {
      if (
        !window.confirm(
          'Đang có đơn hàng trên màn hình. Mở lại đơn treo này sẽ thay thế giỏ hàng hiện tại?'
        )
      ) {
        return;
      }
    }

    setCart(order.cart);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setDiscountAmount(order.discountAmount || 0);
    setParkedOrders((prev) => prev.filter((po) => po.id !== order.id));
    setShowParkedModal(false);
  };

  const handleDeleteParkedOrder = (id: string) => {
    setParkedOrders((prev) => prev.filter((po) => po.id !== id));
  };

  // Tính toán tiền hàng
  const subtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const changeMoney = cashGiven > 0 ? cashGiven - totalAmount : 0;

  // Xử lý mở Modal quét mã QR (VietQR hoặc MoMo)
  const handleOpenQrModal = (method?: 'BANK_TRANSFER' | 'MOMO') => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào đơn!');
      return;
    }
    const currentMethod = method || (paymentMethod === 'MOMO' ? 'MOMO' : 'BANK_TRANSFER');
    setPaymentMethod(currentMethod);
    if (!pendingOrderCode) {
      setPendingOrderCode('POS' + Math.floor(100000 + Math.random() * 900000));
    }
    setShowQrModal(true);
  };

  // Hàm thực thi hoàn tất đơn hàng và in hóa đơn
  const executeCompleteOrder = async (
    confirmedMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO',
    fixedCode?: string
  ) => {
    setIsProcessing(true);
    try {
      const codeToUse = fixedCode || pendingOrderCode || ('POS' + Math.floor(100000 + Math.random() * 900000));
      const payload: PosOrderPayload = {
        customerName: customerName.trim() || 'Khách mua tại quầy',
        phoneNumber: customerPhone.trim() || undefined,
        paymentMethod: confirmedMethod,
        discount: discountAmount,
        redeemPoints: redeemPoints,
        items: cart.map((i) => ({
          idVariant: i.variant.idVariant,
          quantity: i.quantity
        }))
      };

      const result = await retailApi.createPosOrder(payload);

      setCompletedOrder({
        orderCode: result?.data?.orderCode || codeToUse,
        items: [...cart],
        subtotal,
        discountAmount,
        totalAmount,
        cashGiven: confirmedMethod === 'CASH' ? (cashGiven || totalAmount) : totalAmount,
        changeMoney: confirmedMethod === 'CASH' ? Math.max(0, changeMoney) : 0,
        customerName: customerName.trim() || 'Khách mua tại quầy',
        customerPhone: customerPhone,
        paymentMethod: confirmedMethod,
        cashier: currentUser.fullName,
        createdAt: new Date().toLocaleString('vi-VN')
      });

      setCart([]);
      setCustomerName('Khách mua tại quầy');
      setCustomerPhone('');
      setDiscountAmount(0);
      setRedeemPoints(0);
      setCashGiven(0);
      setPendingOrderCode('');
      setShowQrModal(false);
      loadProducts();
    } catch (err: any) {
      alert('Lỗi tạo đơn: ' + (err.message || 'Không thể kết nối đến máy chủ'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Nghiệp vụ Thanh toán [F1]: Nếu là QR thì mở mã đợi API, nếu tiền mặt thì thanh toán trực tiếp
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào đơn!');
      return;
    }

    if (paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'MOMO') {
      // BẮT BUỘC MỞ MÃ QR VÀ ĐỢI API XÁC NHẬN - KHÔNG CHO THU NGÂN TỰ DUYỆT
      if (!pendingOrderCode) {
        setPendingOrderCode('POS' + Math.floor(100000 + Math.random() * 900000));
      }
      setShowQrModal(true);
      return;
    }

    // Nghiệp vụ tiền mặt (CASH)
    if (cashGiven > 0 && cashGiven < totalAmount) {
      alert('Số tiền khách đưa chưa đủ để thanh toán đơn hàng!');
      return;
    }

    await executeCompleteOrder('CASH');
  }, [cart, paymentMethod, cashGiven, totalAmount, pendingOrderCode, discountAmount, redeemPoints, customerName, customerPhone]);

  // Xử lý khi Quét mã QR thành công (do API Webhook xác nhận)
  const handleQrPaymentSuccess = () => {
    const currentMethod = paymentMethod === 'MOMO' ? 'MOMO' : 'BANK_TRANSFER';
    executeCompleteOrder(currentMethod, pendingOrderCode);
  };

  // Áp dụng trừ điểm tích lũy của khách hàng
  const handleApplyLoyaltyDiscount = (pointsUsed: number, discountValue: number) => {
    setRedeemPoints(pointsUsed);
    setDiscountAmount((prev) => prev + discountValue);
  };

  // Thiết lập phím tắt toàn cục cho thu ngân
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Thanh toán
      if (e.key === 'F1') {
        e.preventDefault();
        handleCheckout();
      }
      // F4: Treo đơn
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          handleParkOrder();
        } else if (parkedOrders.length > 0) {
          setShowParkedModal(true);
        }
      }
      // F8: Hủy đơn
      if (e.key === 'F8') {
        e.preventDefault();
        handleClearCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout, handleParkOrder, handleClearCart, cart.length, parkedOrders.length]);

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden bg-[#eef1f5] font-sans text-xs relative">
      {/* THANH ĐIỀU HƯỚNG TAB TRÊN MÀN HÌNH NHỎ / TABLET DƯỚI 1024PX */}
      <div className="lg:hidden flex items-center bg-[#132238] text-white border-b border-[#0e1828] p-1 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'catalog' ? 'bg-[#1b3b6f] text-white shadow-xs' : 'text-gray-300 hover:text-white'
          }`}
        >
          <span>🛍️ Sản Phẩm ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-1.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'cart' ? 'bg-[#1b3b6f] text-white shadow-xs' : 'text-gray-300 hover:text-white'
          }`}
        >
          <span>🧾 Đơn Hàng</span>
          {totalCartItems > 0 && (
            <span className="px-1.5 py-0.2 bg-[#d9534f] text-white rounded-full text-[10px] font-mono font-bold">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* CỘT TRÁI: DANH MỤC & SẢN PHẨM TỪ DỮ LIỆU THỰC TẾ WEB */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 h-full ${mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        <ProductCatalog
          products={products}
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onBarcodeSubmit={handleBarcodeSubmit}
          onAddToCart={handleAddToCart}
          onReportOutOfStock={handleReportOutOfStock}
          reportedIds={reportedIds}
        />
      </div>

      {/* CỘT PHẢI: HÓA ĐƠN & THANH TOÁN */}
      <div
        className={`w-full lg:w-96 xl:w-[410px] shrink-0 flex flex-col min-h-0 h-full bg-[#fcfcfc] border-l border-[#d2d6de] overflow-y-auto lg:overflow-hidden ${
          mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex flex-1 lg:flex-initial'
        }`}
      >
        {/* Nút quay lại chọn món trên màn hình nhỏ */}
        <div className="lg:hidden p-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileTab('catalog')}
            className="text-xs font-bold text-[#1b3b6f] flex items-center gap-1 cursor-pointer"
          >
            ← Tiếp tục chọn món
          </button>
          <span className="font-bold text-gray-700">Đơn hàng quầy POS</span>
        </div>

        <CustomerInfoBar
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          customerPhone={customerPhone}
          onCustomerPhoneChange={setCustomerPhone}
          onApplyLoyaltyDiscount={handleApplyLoyaltyDiscount}
          currentDiscount={discountAmount}
        />

        <CartTable
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onSetQuantity={handleSetQuantity}
          onRemoveItem={handleRemoveItem}
        />

        <PaymentSummary
          itemCount={totalCartItems}
          subtotal={subtotal}
          discountAmount={discountAmount}
          onDiscountChange={setDiscountAmount}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          cashGiven={cashGiven}
          onCashGivenChange={setCashGiven}
          changeMoney={changeMoney}
          onOpenQrModal={handleOpenQrModal}
          onClearCart={handleClearCart}
          onParkOrder={handleParkOrder}
          parkedCount={parkedOrders.length}
          onOpenParkedModal={() => setShowParkedModal(true)}
          onCheckout={handleCheckout}
          isProcessing={isProcessing}
          disabled={cart.length === 0}
        />
      </div>

      {/* NÚT XEM ĐƠN HÀNG NỔI (FLOATING BUTTON) TRÊN MOBILE/TABLET KHI ĐANG Ở TAB CATALOG */}
      {mobileTab === 'catalog' && totalCartItems > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30">
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="w-full py-2.5 px-4 bg-[#1b3b6f] hover:bg-[#142d55] text-white rounded-lg shadow-xl font-bold text-xs flex items-center justify-between cursor-pointer border border-[#2b5190]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#d9534f] text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {totalCartItems}
              </span>
              <span>Xem đơn hàng & Thanh toán</span>
            </div>
            <span className="font-mono text-sm font-bold text-yellow-300">
              {totalAmount.toLocaleString('vi-VN')} đ →
            </span>
          </button>
        </div>
      )}

      {/* MODAL QUÉT MÃ QR TỰ ĐỘNG (VIETQR / MOMO) - KHÓA TỰ DUYỆT CỦA THU NGÂN */}
      <DynamicQrPaymentModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        totalAmount={totalAmount}
        orderCode={pendingOrderCode || 'POS' + Math.floor(100000 + Math.random() * 900000)}
        paymentMethod={paymentMethod === 'MOMO' ? 'MOMO' : 'BANK_TRANSFER'}
        onPaymentSuccess={handleQrPaymentSuccess}
      />

      {/* MODAL DANH SÁCH ĐƠN ĐANG TREO (F4) */}
      <ParkedOrdersModal
        isOpen={showParkedModal}
        onClose={() => setShowParkedModal(false)}
        parkedOrders={parkedOrders}
        onResumeOrder={handleResumeParkedOrder}
        onDeleteParkedOrder={handleDeleteParkedOrder}
      />

      {/* MODAL HÓA ĐƠN NHIỆT K80 */}
      <ThermalReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onPrint={() => window.print()}
      />
    </div>
  );
}
