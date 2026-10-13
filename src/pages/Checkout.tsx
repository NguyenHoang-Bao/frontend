import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  QrCode, 
  ChevronRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink, 
  ShoppingBag, 
  Ticket,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  Lock,
  Sparkles,
  Smartphone,
  Plus,
  X,
  Edit3
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/imageHelper';
import { 
  createOrderApi, 
  getVietQrApi, 
  checkPaymentStatusApi,
  BackendPaymentMethod 
} from '../services/apiClient';
import { addressService, UserAddress } from '../services/addressService';

// Kiểu dữ liệu một món trong giỏ hàng
interface CartItem {
  cartItemId: string;
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  [key: string]: any;
}

interface CartContextType {
  cart: CartItem[];
  clearCart: () => void;
}

// Cấu hình ngân hàng VietQR dự phòng
const BANK_CONFIG = {
  bankId: 'MBBank',
  bankName: 'Ngân hàng Quân Đội (MBBank)',
  accountNo: '14580886868',
  accountName: 'NGUYEN HOANG BAO',
};

// Danh sách mã Voucher có thể áp dụng
const AVAILABLE_VOUCHERS = [
  { code: 'MEGA30K', discount: 30000, minOrder: 299000, desc: 'Giảm 30K đơn từ 299K' },
  { code: 'BEAUTY50K', discount: 50000, minOrder: 499000, desc: 'Giảm 50K đơn từ 499K' },
  { code: 'VIP100K', discount: 100000, minOrder: 899000, desc: 'Giảm 100K đơn từ 899K' },
  { code: 'FREESHIP', discountType: 'shipping', minOrder: 199000, desc: 'Freeship đơn từ 199K' }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext) as CartContextType;

  // Bước hiện tại: 1 - Thông tin, 2 - Vận chuyển & Thanh toán, 3 - Hoàn tất & QR
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Thông tin tài khoản người dùng hiện tại (nếu đã đăng nhập)
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Quản lý Sổ Địa Chỉ chuẩn Shopee
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddressId, setTempAddressId] = useState<string>('');

  // Modal thêm địa chỉ mới trực tiếp tại Checkout
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    fullName: '',
    phone: '',
    province: 'Hồ Chí Minh',
    district: '',
    ward: '',
    address: '',
    label: 'Nhà riêng' as 'Nhà riêng' | 'Văn phòng',
    isDefault: false
  });
  const [newAddrErrors, setNewAddrErrors] = useState<Record<string, string>>({});

  // Form Thông tin giao hàng cho khách vãng lai (hoặc dự phòng)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'Hồ Chí Minh',
    district: '',
    ward: '',
    address: '',
    note: '',
    saveInfo: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Lựa chọn vận chuyển & thanh toán (Bước 2)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'qr_bank' | 'cod' | 'momo'>('qr_bank');

  // Trạng thái đang gửi API đặt hàng
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Đơn hàng đã tạo (Bước 3)
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Dữ liệu mã QR từ backend
  const [backendQr, setBackendQr] = useState<{
    qrCodeUrl?: string;
    bankId?: string;
    accountNumber?: string;
    accountName?: string;
    content?: string;
  } | null>(null);

  // Polling kiểm tra thanh toán tự động
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động load thông tin người dùng & Sổ địa chỉ nếu đã đăng nhập
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);

        // Khởi tạo sổ địa chỉ chuẩn Shopee cho user
        const addrs = addressService.initSampleAddressesIfEmpty(u);
        setUserAddresses(addrs);

        // Lấy địa chỉ mặc định
        const def = addressService.getDefaultAddress(u);
        setSelectedAddress(def);

        if (def) {
          setShippingInfo(prev => ({
            ...prev,
            fullName: def.fullName,
            phone: def.phone,
            province: def.province,
            district: def.district,
            ward: def.ward,
            address: def.address
          }));
        } else {
          setShippingInfo(prev => ({
            ...prev,
            fullName: u.name || u.fullName || prev.fullName,
            phone: u.phone || u.phoneNumber || prev.phone,
            email: u.email || prev.email,
            address: u.address || prev.address
          }));
        }
      }
    } catch (e) {
      console.error('Không thể đọc thông tin người dùng từ localStorage', e);
    }
  }, []);

  // Tính toán tiền hàng
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Phí vận chuyển: Miễn phí nếu đơn >= 500k ở giao tiêu chuẩn, hỏa tốc 50k
  const baseShippingFee = subtotal >= 500000 ? 0 : 30000;
  const shippingFee = shippingMethod === 'express' ? 50000 : baseShippingFee;

  // Giảm giá từ voucher
  let discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  if (appliedVoucher?.code === 'FREESHIP') {
    discountAmount = shippingFee;
  }

  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // Xử lý áp dụng voucher
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherCode).trim().toUpperCase();
    setVoucherError('');

    if (!code) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const found = AVAILABLE_VOUCHERS.find(v => v.code === code);
    if (!found) {
      setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (subtotal < found.minOrder) {
      setVoucherError(`Đơn hàng cần tối thiểu ${found.minOrder.toLocaleString('vi-VN')}₫ để dùng mã này.`);
      return;
    }

    let discount = 0;
    if (found.code === 'FREESHIP') {
      discount = shippingFee;
    } else if (found.discount) {
      discount = found.discount;
    }

    setAppliedVoucher({ code: found.code, discountAmount: discount });
    setVoucherCode(found.code);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  // Kiểm tra tính hợp lệ form Bước 1
  const validateStep1 = () => {
    // Nếu là thành viên và đã có địa chỉ được chọn -> Hợp lệ 100% không cần điền thêm!
    if (currentUser && selectedAddress) {
      return true;
    }

    const errors: Record<string, string> = {};
    if (!shippingInfo.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên người nhận';
    }
    const phoneClean = shippingInfo.phone.trim().replace(/\s+/g, '');
    if (!phoneClean) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneClean)) {
      errors.phone = 'Số điện thoại không hợp lệ (cần 10 chữ số: 03x, 05x, 07x, 08x, 09x)';
    }

    if (!shippingInfo.province.trim()) {
      errors.province = 'Vui lòng chọn hoặc nhập Tỉnh/Thành phố';
    }
    if (!shippingInfo.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tiến sang Bước 2
  const handleProceedToStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Chuyển đổi phương thức thanh toán sang enum Backend
  const mapPaymentMethodToBackend = (method: 'qr_bank' | 'cod' | 'momo'): BackendPaymentMethod => {
    switch (method) {
      case 'qr_bank':
        return 'BANK_TRANSFER';
      case 'cod':
        return 'COD';
      case 'momo':
        return 'MOMO';
      default:
        return 'COD';
    }
  };

  // Xác nhận đổi địa chỉ trong Modal
  const handleConfirmSelectAddress = () => {
    const found = userAddresses.find(a => a.id === tempAddressId);
    if (found) {
      setSelectedAddress(found);
      setShippingInfo(prev => ({
        ...prev,
        fullName: found.fullName,
        phone: found.phone,
        province: found.province,
        district: found.district,
        ward: found.ward,
        address: found.address
      }));
    }
    setIsAddressModalOpen(false);
  };

  // Thêm nhanh địa chỉ mới từ Checkout
  const handleSaveQuickNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newAddrForm.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
    const phoneClean = newAddrForm.phone.trim().replace(/\s+/g, '');
    if (!phoneClean) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneClean)) {
      errors.phone = 'Số điện thoại không hợp lệ (10 số)';
    }
    if (!newAddrForm.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể';

    if (Object.keys(errors).length > 0) {
      setNewAddrErrors(errors);
      return;
    }

    const created = addressService.addAddress(currentUser, {
      fullName: newAddrForm.fullName.trim(),
      phone: phoneClean,
      province: newAddrForm.province,
      district: newAddrForm.district.trim(),
      ward: newAddrForm.ward.trim(),
      address: newAddrForm.address.trim(),
      label: newAddrForm.label,
      isDefault: newAddrForm.isDefault
    });

    const refreshed = addressService.getAddresses(currentUser);
    setUserAddresses(refreshed);
    setSelectedAddress(created);
    setShippingInfo(prev => ({
      ...prev,
      fullName: created.fullName,
      phone: created.phone,
      province: created.province,
      district: created.district,
      ward: created.ward,
      address: created.address
    }));

    setIsAddNewModalOpen(false);
    setIsAddressModalOpen(false);
  };

  // Xác nhận đặt hàng ở Bước 2 -> Gọi API backend -> Chuyển sang Bước 3
  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    // Lấy thông tin người nhận (Ưu tiên địa chỉ đã chọn từ Sổ địa chỉ)
    const finalCustomerName = (currentUser && selectedAddress) 
      ? selectedAddress.fullName 
      : shippingInfo.fullName.trim();

    const finalPhone = (currentUser && selectedAddress)
      ? selectedAddress.phone.trim().replace(/\s+/g, '')
      : shippingInfo.phone.trim().replace(/\s+/g, '');

    const finalFullAddress = (currentUser && selectedAddress)
      ? [selectedAddress.address, selectedAddress.ward, selectedAddress.district, selectedAddress.province].filter(Boolean).join(', ')
      : [shippingInfo.address.trim(), shippingInfo.ward.trim(), shippingInfo.district.trim(), shippingInfo.province.trim()].filter(Boolean).join(', ');

    const backendMethod = mapPaymentMethodToBackend(paymentMethod);

    // Chuẩn bị payload khớp với Spring Boot backend
    const orderPayload = {
      customerName: finalCustomerName,
      phoneNumber: finalPhone,
      deliveryAddress: finalFullAddress,
      paymentMethod: backendMethod,
      note: shippingInfo.note.trim() ? `[${shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}] ${shippingInfo.note.trim()}` : `[${shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}]`,
      items: cart.map(item => ({
        idVariant: Number(item.id) || 1,
        quantity: item.quantity
      }))
    };

    let generatedOrderCode = `HBC-${Math.floor(10000 + Math.random() * 90000)}`;
    let finalOrderData: any = null;

    try {
      // 1. Gửi request tạo đơn hàng thật lên Backend Spring Boot
      const apiRes = await createOrderApi(orderPayload);
      if (apiRes && apiRes.orderCode) {
        generatedOrderCode = apiRes.orderCode;
      }
    } catch (err: any) {
      console.warn('Backend API chưa sẵn sàng hoặc lỗi kết nối, chuyển sang chế độ lưu trữ cục bộ:', err.message);
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const paymentMethodText = 
      paymentMethod === 'qr_bank' 
        ? 'Chuyển khoản VietQR 24/7' 
        : paymentMethod === 'cod' 
          ? 'Thanh toán khi nhận hàng (COD)' 
          : 'Ví điện tử MoMo';

    finalOrderData = {
      id: generatedOrderCode,
      orderCode: generatedOrderCode,
      date: formattedDate,
      status: paymentMethod === 'qr_bank' ? 'pending' : 'processing',
      statusText: paymentMethod === 'qr_bank' ? 'Chờ thanh toán QR' : 'Đang chuẩn bị hàng',
      total: finalTotal,
      subtotal,
      shippingFee,
      discountAmount,
      shippingAddress: finalFullAddress,
      phone: finalPhone,
      customerName: finalCustomerName,
      email: shippingInfo.email.trim(),
      note: shippingInfo.note.trim(),
      paymentMethod: paymentMethodText,
      paymentCode: paymentMethod,
      shippingMethod: shippingMethod === 'express' ? 'Giao hàng hỏa tốc (2H)' : 'Giao hàng tiêu chuẩn (2-3 ngày)',
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'Mặc định',
        image: item.image
      }))
    };

    // 2. Lưu vào localStorage để đồng bộ với trang OrderTracking và Profile
    try {
      const phoneKey = `orders_${finalPhone}`;
      const savedByPhone = localStorage.getItem(phoneKey);
      const existingPhoneOrders = savedByPhone ? JSON.parse(savedByPhone) : [];
      localStorage.setItem(phoneKey, JSON.stringify([finalOrderData, ...existingPhoneOrders]));

      const allOrders = JSON.parse(localStorage.getItem('all_placed_orders') || '[]');
      localStorage.setItem('all_placed_orders', JSON.stringify([finalOrderData, ...allOrders]));
    } catch (storageErr) {
      console.error('Lỗi khi lưu đơn hàng vào localStorage:', storageErr);
    }

    // 3. Nếu là VietQR, lấy thông tin QR từ Backend
    if (paymentMethod === 'qr_bank') {
      try {
        const qrRes = await getVietQrApi(generatedOrderCode);
        if (qrRes) {
          setBackendQr(qrRes);
        }
      } catch (qrErr) {
        console.warn('Chưa lấy được QR từ backend, dùng fallback VietQR chuẩn MBBank');
      }
    }

    setCreatedOrder(finalOrderData);
    clearCart();
    setIsSubmitting(false);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Polling kiểm tra trạng thái thanh toán khi ở Bước 3 với VietQR
  useEffect(() => {
    if (currentStep === 3 && createdOrder && createdOrder.paymentCode === 'qr_bank' && !isPaymentConfirmed) {
      setIsPolling(true);

      const checkStatus = async () => {
        try {
          const statusRes = await checkPaymentStatusApi(createdOrder.id || createdOrder.orderCode);
          if (statusRes && statusRes.isPaid) {
            setIsPaymentConfirmed(true);
            setIsPolling(false);
            if (pollingTimerRef.current) {
              clearInterval(pollingTimerRef.current);
            }
          }
        } catch {
          // Bỏ qua lỗi polling khi backend chưa bật
        }
      };

      pollingTimerRef.current = setInterval(checkStatus, 3000);

      return () => {
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current);
        }
      };
    }
  }, [currentStep, createdOrder, isPaymentConfirmed]);

  // Copy thông tin chuyển khoản vào Clipboard
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Đường link ảnh VietQR
  const effectiveBankId = backendQr?.bankId || BANK_CONFIG.bankId;
  const effectiveAccountNo = backendQr?.accountNumber || BANK_CONFIG.accountNo;
  const effectiveAccountName = backendQr?.accountName || BANK_CONFIG.accountName;
  const effectiveContent = backendQr?.content || (createdOrder ? createdOrder.id : '');

  const qrImageUrl = backendQr?.qrCodeUrl || (createdOrder 
    ? `https://api.vietqr.io/image/970422-${effectiveAccountNo}-compact2.png?amount=${createdOrder.total}&addInfo=${encodeURIComponent(effectiveContent)}&accountName=${encodeURIComponent(effectiveAccountName)}`
    : '');

  // Khi giỏ hàng trống và chưa tạo đơn thành công
  if (cart.length === 0 && currentStep !== 3) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShoppingBag size={40} className="stroke-[1.75]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Giỏ hàng của bạn đang trống</h2>
          <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
            Bạn chưa chọn sản phẩm nào để thanh toán. Hãy ghé qua danh mục mỹ phẩm để chọn những món ưng ý nhé!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>Khám Phá Mỹ Phẩm Ngay</span>
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 pt-6 sm:pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* ── BREADCRUMB & THANH STEPPER 3 BƯỚC ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-rose-600 transition-colors">Sản phẩm</Link>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-semibold">Thanh toán đơn hàng</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <PackageCheck size={20} />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Tiến Trình Thanh Toán
                </h1>
                <p className="text-xs text-slate-500">Mã hóa bảo mật 256-bit an toàn 100%</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
              {/* Bước 1 */}
              <button
                type="button"
                onClick={() => currentStep === 2 && setCurrentStep(1)}
                disabled={currentStep === 3}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentStep === 1 
                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200' 
                    : currentStep > 1 
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer' 
                      : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep > 1 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 1 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > 1 ? <Check size={12} /> : '1'}
                </span>
                <span className="hidden sm:inline">1. Giao hàng</span>
                <span className="sm:hidden">Địa chỉ</span>
              </button>

              <ChevronRight size={14} className="text-slate-300 shrink-0" />

              {/* Bước 2 */}
              <button
                type="button"
                onClick={() => currentStep === 3 ? null : validateStep1() && setCurrentStep(2)}
                disabled={currentStep === 3 || currentStep < 2}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  currentStep === 2 
                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200' 
                    : currentStep > 2 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep > 2 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep === 2 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > 2 ? <Check size={12} /> : '2'}
                </span>
                <span className="hidden sm:inline">2. Thanh toán</span>
                <span className="sm:hidden">Thanh toán</span>
              </button>

              <ChevronRight size={14} className="text-slate-300 shrink-0" />

              {/* Bước 3 */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                currentStep === 3 
                  ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200' 
                  : 'text-slate-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  3
                </span>
                <span className="hidden sm:inline">3. Hoàn tất & QR</span>
                <span className="sm:hidden">Hoàn tất</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BỐ CỤC CHÍNH (2 CỘT) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: FORM NỘI DUNG TỪNG BƯỚC */}
          <div className={currentStep === 3 ? "lg:col-span-12" : "lg:col-span-7 xl:col-span-8"}>
            
            {/* ── BƯỚC 1: THÔNG TIN GIAO HÀNG ── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 1. NẾU ĐÃ ĐĂNG NHẬP VÀ ĐÃ CÓ ĐỊA CHỈ: HIỂN THỊ KHUNG ĐỊA CHỈ CHUẨN SHOPEE */}
                {currentUser && selectedAddress ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Viền sọc màu sắc đặc trưng kiểu phong bì thư / Shopee */}
                    <div className="h-1.5 w-full bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_30px,#3b82f6_30px,#3b82f6_60px,#f59e0b_60px,#f59e0b_90px)]" />

                    <div className="p-6 sm:p-8">
                      {/* Tiêu đề & nút Thay đổi */}
                      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 text-rose-600 font-black text-sm">
                          <MapPin size={22} className="fill-rose-50 stroke-rose-600" />
                          <span className="uppercase tracking-wider">Địa Chỉ Nhận Hàng (Shopee Style)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTempAddressId(selectedAddress.id);
                            setIsAddressModalOpen(true);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Thay Đổi</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Thông tin địa chỉ đang được chọn */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs sm:text-sm">
                        <div className="space-y-2 flex-grow">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <strong className="text-slate-900 font-black text-sm sm:text-base">
                              {selectedAddress.fullName} ({selectedAddress.phone})
                            </strong>
                            {selectedAddress.label && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {selectedAddress.label}
                              </span>
                            )}
                            {selectedAddress.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                                Mặc định
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                            {[selectedAddress.address, selectedAddress.ward, selectedAddress.district, selectedAddress.province].filter(Boolean).join(', ')}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setTempAddressId(selectedAddress.id);
                            setIsAddressModalOpen(true);
                          }}
                          className="self-start sm:self-center px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                        >
                          Chọn địa chỉ khác ({userAddresses.length})
                        </button>
                      </div>

                      {/* Ghi chú giao hàng nếu khách muốn bổ sung */}
                      <div className="mt-6 pt-5 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ghi chú giao hàng cho shipper (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước 15 phút..."
                          value={shippingInfo.note}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>

                      {/* Nút Tiếp Tục: KHÔNG BẮT ĐIỀN LẠI GÌ HẾT! */}
                      <div className="pt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleProceedToStep2()}
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Tiếp Tục: Chọn Phương Thức Thanh Toán</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. NẾU LÀ KHÁCH VÃNG LAI HOẶC CHƯA CÓ ĐỊA CHỈ: HIỂN THỊ FORM NHẬP TAY */
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <MapPin size={22} />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-slate-900 tracking-tight">1. Địa Chỉ Nhận Hàng</h2>
                          <p className="text-xs text-slate-500">Thông tin người nhận để shipper liên hệ thuận tiện nhất</p>
                        </div>
                      </div>
                      <Link to="/products" className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 font-medium transition-colors">
                        <ArrowLeft size={14} /> Tiếp tục xem hàng
                      </Link>
                    </div>

                    {/* Banner gợi ý đăng nhập cho khách vãng lai */}
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                          <Sparkles size={16} />
                        </span>
                        <div className="text-xs text-slate-700">
                          <span>Bạn đã có tài khoản HoangBao Cosmetics? </span>
                          <Link to="/login" className="font-bold text-rose-600 hover:underline">
                            Đăng nhập ngay
                          </Link>
                          <span> để tự điền địa chỉ & quản lý nhiều địa chỉ như Shopee.</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        (Hoặc đặt hàng nhanh không cần tài khoản)
                      </span>
                    </div>

                    <form onSubmit={handleProceedToStep2} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Họ và tên */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Họ và tên người nhận <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Nguyễn Văn A"
                            value={shippingInfo.fullName}
                            onChange={(e) => {
                              setShippingInfo({ ...shippingInfo, fullName: e.target.value });
                              if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                              formErrors.fullName 
                                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                                : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                            }`}
                          />
                          {formErrors.fullName && (
                            <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Số điện thoại */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="VD: 0359490221"
                            value={shippingInfo.phone}
                            onChange={(e) => {
                              setShippingInfo({ ...shippingInfo, phone: e.target.value });
                              if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                            }}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                              formErrors.phone 
                                ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                                : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                            }`}
                          />
                          {formErrors.phone && (
                            <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> {formErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Địa chỉ Email (Nhận thông báo cập nhật đơn hàng)
                        </label>
                        <input
                          type="email"
                          placeholder="VD: customer@example.com"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-colors"
                        />
                      </div>

                      {/* Địa chỉ Tỉnh / Quận / Phường */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Tỉnh / Thành phố <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={shippingInfo.province}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 bg-white"
                          >
                            <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                            <option value="Cần Thơ">Cần Thơ</option>
                            <option value="Hải Phòng">Hải Phòng</option>
                            <option value="Bình Dương">Bình Dương</option>
                            <option value="Đồng Nai">Đồng Nai</option>
                            <option value="Khác">Tỉnh / Thành khác</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Quận / Huyện
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Tân Phú, Cầu Giấy..."
                            value={shippingInfo.district}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Phường / Xã
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Tây Thạnh, Bến Nghé..."
                            value={shippingInfo.ward}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, ward: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>

                      {/* Địa chỉ cụ thể */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 140 Lê Trọng Tấn, Tây Thạnh"
                          value={shippingInfo.address}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, address: e.target.value });
                            if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                            formErrors.address 
                              ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500' 
                              : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                          }`}
                        />
                        {formErrors.address && (
                          <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {formErrors.address}
                          </p>
                        )}
                      </div>

                      {/* Ghi chú đơn hàng */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ghi chú cho shipper (Tùy chọn)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước 15 phút..."
                          value={shippingInfo.note}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>

                      {/* Nút tiếp tục sang Bước 2 */}
                      <div className="pt-6 flex justify-end">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Tiếp Tục: Chọn Vận Chuyển & Thanh Toán</span>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            )}

            {/* ── BƯỚC 2: VẬN CHUYỂN & THANH TOÁN ── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 1. Khối Chọn hình thức vận chuyển */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Truck size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">1. Chọn Phương Thức Vận Chuyển</h2>
                      <p className="text-xs text-slate-500">Đối tác vận chuyển chính hãng, giao tận tay</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tiêu chuẩn */}
                    <div
                      onClick={() => setShippingMethod('standard')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        shippingMethod === 'standard'
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs ring-2 ring-rose-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">Giao hàng Tiêu Chuẩn</p>
                            {baseShippingFee === 0 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                MIỄN PHÍ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Nhận hàng sau 2 - 3 ngày làm việc</p>
                        </div>
                        <input
                          type="radio"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Cước phí:</span>
                        <span className="font-bold text-slate-900">
                          {baseShippingFee === 0 ? (
                            <span className="text-emerald-600 font-bold">0₫ (Miễn phí từ 500K)</span>
                          ) : (
                            `${baseShippingFee.toLocaleString('vi-VN')}₫`
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Hỏa tốc */}
                    <div
                      onClick={() => setShippingMethod('express')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        shippingMethod === 'express'
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs ring-2 ring-rose-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900">Giao Hỏa Tốc (2H)</p>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                              Nội thành
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Giao nhanh trong 2 - 4 giờ qua Ahamove/Grab</p>
                        </div>
                        <input
                          type="radio"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Cước phí:</span>
                        <span className="font-bold text-slate-900">50.000₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Khối Chọn hình thức thanh toán */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">2. Phương Thức Thanh Toán</h2>
                      <p className="text-xs text-slate-500">Lựa chọn hình thức thanh toán thuận tiện nhất</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* Chuyển khoản QR Ngân hàng (VietQR) */}
                    <div
                      onClick={() => setPaymentMethod('qr_bank')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'qr_bank'
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs ring-2 ring-rose-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 shadow-inner">
                            <QrCode size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900">Chuyển Khoản QR Ngân Hàng (VietQR 24/7)</p>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                                Khuyên Dùng
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Tự động tạo mã QR chính xác số tiền & nội dung đơn hàng. Quét được qua tất cả app ngân hàng (VCB, MB, Techcombank, BIDV, VPBank,...).
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'qr_bank'}
                          onChange={() => setPaymentMethod('qr_bank')}
                          className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>

                      {paymentMethod === 'qr_bank' && (
                        <div className="mt-3.5 pt-3 border-t border-rose-100 text-xs text-slate-600 bg-white/80 p-3 rounded-xl flex items-center gap-2 font-medium">
                          <Sparkles size={16} className="text-rose-500 shrink-0" />
                          <span>Hệ thống tự động phát hiện thanh toán ngay khi bạn chuyển tiền thành công!</span>
                        </div>
                      )}
                    </div>

                    {/* Thanh toán khi nhận hàng (COD) */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs ring-2 ring-rose-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                            <Truck size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">Thanh Toán Khi Nhận Hàng (COD)</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Kiểm tra hàng thoải mái trước khi thanh toán bằng tiền mặt cho nhân viên giao hàng.
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Ví điện tử MoMo */}
                    <div
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'momo'
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs ring-2 ring-rose-100'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-pink-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-inner">
                            MoMo
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">Ví Điện Tử MoMo</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Quét mã qua app ví điện tử MoMo trên điện thoại nhanh chóng và tiện lợi.
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === 'momo'}
                          onChange={() => setPaymentMethod('momo')}
                          className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông báo lỗi nếu có */}
                {apiError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Nút hành động */}
                <div className="flex items-center justify-between gap-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={16} /> Quay Lại Địa Chỉ
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Đang Khởi Tạo Đơn Hàng...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác Nhận Đặt Hàng ({finalTotal.toLocaleString('vi-VN')}₫)</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── BƯỚC 3: HOÀN TẤT & TẠO MÃ QR THANH TOÁN ── */}
            {currentStep === 3 && createdOrder && (
              <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
                
                {/* Banner chúc mừng thành công */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 size={38} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Đặt Hàng Thành Công!
                  </h1>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    Cảm ơn bạn đã lựa chọn mua sắm mỹ phẩm chính hãng tại <strong className="text-rose-600">HoangBao Cosmetics</strong>.
                  </p>
                  
                  <div className="inline-flex items-center gap-2.5 mt-5 px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/60">
                    <span>Mã tra cứu đơn hàng:</span>
                    <strong className="text-rose-600 font-mono text-sm font-black">{createdOrder.id}</strong>
                    <button 
                      onClick={() => handleCopy(createdOrder.id, 'orderId')}
                      className="p-1 rounded hover:bg-white text-slate-400 hover:text-slate-700 transition-colors"
                      title="Sao chép mã đơn hàng"
                    >
                      {copiedField === 'orderId' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* NẾU LÀ PHƯƠNG THỨC CHUYỂN KHOẢN QR */}
                {createdOrder.paymentCode === 'qr_bank' && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-pink-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-xs">
                      VietQR 24/7 Tự Động
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                        <QrCode size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Quét Mã QR Chuyển Khoản</h2>
                        <p className="text-xs text-slate-500">Mở ứng dụng ngân hàng bất kỳ để quét mã tự động</p>
                      </div>
                    </div>

                    {/* Trạng thái xác nhận thanh toán */}
                    {isPaymentConfirmed ? (
                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 size={28} />
                        </div>
                        <h3 className="font-black text-emerald-800 text-base">ĐÃ XÁC NHẬN THANH TOÁN THÀNH CÔNG!</h3>
                        <p className="text-xs text-emerald-600 mt-1">
                          Đơn hàng đã được chuyển sang bộ phận đóng gói và sẵn sàng xuất kho.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <RefreshCw size={16} className={`text-amber-600 shrink-0 ${isPolling ? 'animate-spin' : ''}`} />
                          <span>Hệ thống đang tự động kiểm tra giao dịch chuyển khoản mỗi 3 giây...</span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                          Auto Check
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                      {/* Ảnh QR VietQR động */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 max-w-[240px]">
                          <img
                            src={qrImageUrl}
                            alt="VietQR Payment"
                            className="w-full h-auto object-contain rounded-xl"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 mt-3 flex items-center gap-1 font-semibold">
                          ⚡ Quét mã để tự điền số tiền & nội dung
                        </span>
                      </div>

                      {/* Chi tiết tài khoản kèm nút Sao chép */}
                      <div className="md:col-span-7 space-y-3 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 text-xs block mb-0.5">Ngân hàng thụ hưởng</span>
                          <p className="font-bold text-slate-900">{BANK_CONFIG.bankName}</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-xs block mb-0.5">Số tài khoản</span>
                            <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                              {effectiveAccountNo}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(effectiveAccountNo, 'accNo')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            {copiedField === 'accNo' ? (
                              <>
                                <Check size={14} className="text-emerald-500" /> Đã chép
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Sao chép
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 text-xs block mb-0.5">Chủ tài khoản</span>
                          <span className="font-bold text-slate-900 uppercase">
                            {effectiveAccountName}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-600 text-xs block mb-0.5">Số tiền chuyển khoản</span>
                            <span className="font-black text-lg text-rose-600">
                              {createdOrder.total.toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(String(createdOrder.total), 'amount')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            {copiedField === 'amount' ? (
                              <>
                                <Check size={14} className="text-emerald-500" /> Đã chép
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Sao chép
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-600 text-xs block mb-0.5">
                              Nội dung chuyển khoản (Bắt buộc ghi đúng)
                            </span>
                            <span className="font-mono font-bold text-sm text-slate-900">
                              {effectiveContent}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(effectiveContent, 'content')}
                            className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-xs font-bold text-amber-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            {copiedField === 'content' ? (
                              <>
                                <Check size={14} className="text-emerald-500" /> Đã chép
                              </>
                            ) : (
                              <>
                                <Copy size={14} /> Sao chép
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hướng dẫn 3 bước */}
                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-slate-600">
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="w-5 h-5 bg-rose-100 text-rose-600 font-bold rounded-full inline-flex items-center justify-center mb-1">1</span>
                        <p className="font-semibold text-slate-800">Mở App Ngân Hàng</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Dùng ứng dụng ngân hàng bất kỳ</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="w-5 h-5 bg-rose-100 text-rose-600 font-bold rounded-full inline-flex items-center justify-center mb-1">2</span>
                        <p className="font-semibold text-slate-800">Quét Mã QR</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Chiếu camera vào mã QR bên cạnh</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl">
                        <span className="w-5 h-5 bg-rose-100 text-rose-600 font-bold rounded-full inline-flex items-center justify-center mb-1">3</span>
                        <p className="font-semibold text-slate-800">Xác Nhận Chuyển</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Hệ thống tự động duyệt ngay lập tức</p>
                      </div>
                    </div>

                    {/* Nút xác nhận thủ công */}
                    {!isPaymentConfirmed && (
                      <div className="mt-6 text-center">
                        <button
                          type="button"
                          onClick={() => setIsPaymentConfirmed(true)}
                          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2"
                        >
                          <Check size={16} /> Tôi Đã Chuyển Khoản Thành Công
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* NẾU LÀ COD */}
                {createdOrder.paymentCode === 'cod' && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Truck size={28} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900">Thanh Toán Tiền Mặt Khi Nhận Hàng (COD)</h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                      Bạn sẽ thanh toán số tiền <strong className="text-rose-600 font-black">{createdOrder.total.toLocaleString('vi-VN')}₫</strong> bằng tiền mặt cho shipper khi nhận gói hàng.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-2xl max-w-md mx-auto text-xs text-slate-600 text-left border border-slate-200">
                      <p className="font-bold text-slate-800 mb-1.5">📦 Quyền lợi giao nhận:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-500 leading-relaxed">
                        <li>Bạn được đồng kiểm ngoại quan sản phẩm trước khi thanh toán.</li>
                        <li>Shipper sẽ liên hệ qua số điện thoại <strong className="text-slate-700">{createdOrder.phone}</strong> trước khi giao 15-30 phút.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* NẾU LÀ MOMO */}
                {createdOrder.paymentCode === 'momo' && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-sm text-center">
                    <div className="w-14 h-14 bg-pink-500 text-white font-black text-base rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                      MoMo
                    </div>
                    <h2 className="text-lg font-black text-slate-900">Thanh Toán Qua Ví Điện Tử MoMo</h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                      Vui lòng mở app MoMo và chuyển số tiền <strong className="text-rose-600 font-black">{createdOrder.total.toLocaleString('vi-VN')}₫</strong> tới SĐT <strong className="text-slate-800">{BANK_CONFIG.accountNo}</strong> kèm nội dung <strong className="text-rose-600 font-mono">{createdOrder.id}</strong>.
                    </p>
                  </div>
                )}

                {/* THÔNG TIN CHI TIẾT ĐƠN HÀNG */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-4 pb-3 border-b border-slate-100 uppercase tracking-wider">
                    Chi Tiết Đơn Hàng #{createdOrder.id}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 font-medium">Người nhận hàng:</p>
                      <p className="font-bold text-slate-800 mt-1">{createdOrder.customerName} - {createdOrder.phone}</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">{createdOrder.shippingAddress}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 font-medium">Thông tin giao nhận:</p>
                      <p className="font-bold text-slate-800 mt-1">Ngày đặt: {createdOrder.date}</p>
                      <p className="text-slate-500 mt-1">Hình thức: {createdOrder.paymentMethod}</p>
                      <p className="text-slate-500 mt-0.5">Vận chuyển: {createdOrder.shippingMethod}</p>
                    </div>
                  </div>

                  {/* Danh sách sản phẩm trong đơn */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {createdOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                            <span className="text-slate-400">Phân loại: {item.size || 'Tiêu chuẩn'} | SL: x{item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tổng kết tiền */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Tạm tính tiền hàng:</span>
                      <span className="font-semibold text-slate-800">{createdOrder.subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span className="font-semibold text-slate-800">
                        {createdOrder.shippingFee === 0 ? (
                          <span className="text-emerald-600 font-bold">Miễn phí</span>
                        ) : (
                          `${createdOrder.shippingFee.toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                    </div>
                    {createdOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Giảm giá Voucher:</span>
                        <span className="font-bold">-{createdOrder.discountAmount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-100">
                      <span>Tổng tiền thanh toán:</span>
                      <span className="text-rose-600 text-lg font-black">{createdOrder.total.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                </div>

                {/* Nút điều hướng sau khi xong */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to={`/order-tracking?code=${encodeURIComponent(createdOrder.id)}`}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ExternalLink size={16} /> Tra Cứu & Theo Dõi Đơn Hàng
                  </Link>

                  <Link
                    to="/products"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Tiếp Tục Mua Sắm
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* CỘT PHẢI: TÓM TẮT GIỎ HÀNG & TIỀN THANH TOÁN (Ẩn ở Bước 3 để tập trung QR) */}
          {currentStep !== 3 && (
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs sticky top-28">
                
                {/* Tiêu đề tóm tắt */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    Đơn Hàng ({cart.reduce((s, i) => s + i.quantity, 0)} món)
                  </h3>
                  <Link to="/products" className="text-xs text-rose-600 font-semibold hover:underline">
                    Thêm món khác
                  </Link>
                </div>

                {/* Danh sách món hàng */}
                <div className="max-h-64 overflow-y-auto space-y-3.5 pr-1 divide-y divide-slate-100 scrollbar-thin">
                  {cart.map(item => (
                    <div key={item.cartItemId} className="flex gap-3 pt-3.5 first:pt-0">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-14 h-16 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
                      />
                      <div className="flex-grow flex flex-col justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1 leading-snug">{item.name}</p>
                          {item.size && <p className="text-slate-400 mt-0.5 text-[11px]">Phân loại: {item.size}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-500 font-medium">SL: x{item.quantity}</span>
                          <span className="font-bold text-rose-600">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Khối Nhập Voucher */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã Giảm Giá / Voucher
                  </label>
                  
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Check size={16} />
                        <span>Đã dùng: {appliedVoucher.code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-slate-400 hover:text-rose-600 font-bold text-xs cursor-pointer transition-colors"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã (VD: MEGA30K)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="flex-grow px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs uppercase focus:outline-none focus:border-rose-500 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        Áp Dụng
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <p className="text-rose-500 text-[11px] mt-1.5 font-medium">{voucherError}</p>
                  )}

                  {/* Gợi ý mã có sẵn */}
                  {!appliedVoucher && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {AVAILABLE_VOUCHERS.map(v => (
                        <button
                          key={v.code}
                          type="button"
                          onClick={() => handleApplyVoucher(v.code)}
                          title={v.desc}
                          className="text-[10px] px-2.5 py-1 rounded-lg border border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Ticket size={11} /> {v.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tính tổng tiền */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tạm tính tiền hàng:</span>
                    <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-slate-900">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold">Miễn phí</span>
                      ) : (
                        `${shippingFee.toLocaleString('vi-VN')}₫`
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Giảm giá Voucher:</span>
                      <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}

                  <div className="pt-3.5 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-rose-600">
                      {finalTotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                {/* Cam kết / Bảo đảm an toàn */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Cam kết 100% mỹ phẩm chính hãng có tem phụ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600 shrink-0" />
                    <span>Đổi trả miễn phí trong vòng 7 ngày nếu lỗi sản phẩm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-purple-600 shrink-0" />
                    <span>Giao dịch an toàn được bảo mật mã hóa SSL 256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL 1: CHỌN ĐỊA CHỈ TỪ SỔ ĐỊA CHỈ (SHOPEE STYLE) ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Địa Chỉ Của Tôi
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Danh sách địa chỉ để chọn */}
            <div className="overflow-y-auto space-y-3.5 flex-grow pr-1 divide-y divide-slate-100">
              {userAddresses.map(addr => {
                const fullAddr = [addr.address, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
                const isSelected = (tempAddressId || selectedAddress?.id) === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setTempAddressId(addr.id)}
                    className={`pt-3.5 first:pt-0 p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 border-2 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedCheckoutAddress"
                      checked={isSelected}
                      onChange={() => setTempAddressId(addr.id)}
                      className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div className="text-xs space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <strong className="font-bold text-slate-900">{addr.fullName}</strong>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600">{addr.phone}</span>
                        {addr.label && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {addr.label}
                          </span>
                        )}
                        {addr.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed">{fullAddr}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút thêm địa chỉ mới & link profile */}
            <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewAddrForm({
                    fullName: currentUser?.name || currentUser?.fullName || '',
                    phone: currentUser?.phone || currentUser?.phoneNumber || '',
                    province: 'Hồ Chí Minh',
                    district: '',
                    ward: '',
                    address: '',
                    label: 'Nhà riêng',
                    isDefault: false
                  });
                  setNewAddrErrors({});
                  setIsAddNewModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                <Plus size={16} />
                <span>Thêm Địa Chỉ Mới</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelectAddress}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Xác Nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THÊM NHANH ĐỊA CHỈ MỚI TẠI CHECKOUT ── */}
      {isAddNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md p-6 sm:p-7 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Thêm Địa Chỉ Mới</h3>
              <button
                onClick={() => setIsAddNewModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNewAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={newAddrForm.fullName}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, fullName: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${newAddrErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0359490221"
                  value={newAddrForm.phone}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${newAddrErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỉnh / TP</label>
                  <select
                    value={newAddrForm.province}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, province: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Hồ Chí Minh">TP.HCM</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    placeholder="VD: Tân Phú"
                    value={newAddrForm.district}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, district: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phường/Xã</label>
                  <input
                    type="text"
                    placeholder="VD: Tây Thạnh"
                    value={newAddrForm.ward}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, ward: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Địa chỉ cụ thể (Số nhà, đường) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: 140 Lê Trọng Tấn"
                  value={newAddrForm.address}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, address: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${newAddrErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'}`}
                />
              </div>

              <div className="flex gap-4 pt-1">
                {(['Nhà riêng', 'Văn phòng'] as const).map(l => (
                  <label key={l} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="quickLabel"
                      checked={newAddrForm.label === l}
                      onChange={() => setNewAddrForm({ ...newAddrForm, label: l })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Lưu & Chọn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
