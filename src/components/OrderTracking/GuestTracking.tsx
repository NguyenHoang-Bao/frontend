import { useState, useEffect, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, LogIn, Phone, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Order, getDefaultOrders } from './types';
import OrderStatusBadge from './OrderStatusBadge';

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/hb22fnuq/image/upload';
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop';

const getImageUrl = (path?: string) => {
  if (!path) return DEFAULT_PLACEHOLDER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.includes('assets/')) {
    try {
      return new URL(path, import.meta.url).href;
    } catch {
      return DEFAULT_PLACEHOLDER;
    }
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CLOUDINARY_BASE_URL}/${cleanPath}`;
};

export default function GuestTracking() {
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrderFromApi = async (code: string, phoneFilter?: string) => {
    setLoading(true);
    setSearchError('');
    setSearchedOrder(null);
    try {
      const queryParam = phoneFilter ? `?phoneNumber=${encodeURIComponent(phoneFilter.trim())}` : '';
      const res = await fetch(`http://localhost:8080/api/orders/${encodeURIComponent(code)}${queryParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const statusMap: Record<string, { status: Order['status']; text: string }> = {
            PENDING: { status: 'pending', text: 'Chờ xác nhận' },
            CONFIRMED: { status: 'processing', text: 'Đã xác nhận' },
            PROCESSING: { status: 'processing', text: 'Đang chuẩn bị hàng' },
            SHIPPING: { status: 'shipping', text: 'Đang vận chuyển' },
            DELIVERED: { status: 'delivered', text: 'Đã giao hàng thành công' },
            CANCELLED: { status: 'cancelled', text: 'Đã hủy đơn' },
          };
          const st = statusMap[d.status] || { status: 'pending', text: d.status };

          const mapped: Order = {
            id: d.orderCode,
            date: d.createdAt ? d.createdAt.replace('T', ' ').slice(0, 16) : 'Vừa xong',
            status: st.status,
            statusText: st.text,
            total: d.totalAmount || 0,
            customerName: d.customerName || 'Quý khách',
            phone: d.phoneNumber || '',
            shippingAddress: d.deliveryAddress || '',
            paymentMethod: d.paymentMethod || 'COD',
            items: (d.items || []).map((it: any) => ({
              id: it.idOrderDetail || it.idVariant,
              name: it.productName || 'Sản phẩm mỹ phẩm',
              price: it.price || 0,
              quantity: it.quantity || 1,
              image: it.thumbnail || '',
            })),
          };
          setSearchedOrder(mapped);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Bỏ qua lỗi mạng để fallback qua dữ liệu mẫu
    }

    // Fallback: Tìm trong dữ liệu mẫu nếu API backend không có
    const sampleGuestOrders: Order[] = [
      ...getDefaultOrders('Nguyễn Văn A', phoneFilter || '0987654321'),
      {
        id: 'HBC-99999',
        date: '15/09/2026 - 09:15',
        status: 'processing',
        statusText: 'Đang chuẩn bị hàng',
        total: 350000,
        customerName: 'Khách hàng',
        phone: phoneFilter || '0901234567',
        shippingAddress: 'Tân Bình, TP. Hồ Chí Minh',
        paymentMethod: 'COD',
        items: [{ id: 4, name: 'Nước Hoa Hồng Cân Bằng Cấp Ẩm Chuyên Sâu', price: 350000, quantity: 1, image: 'https://images.unsplash.com/photo-1608248597359-593645b23d53?w=400&q=80&auto=format&fit=crop' }]
      }
    ];

    const found = sampleGuestOrders.find(
      o => o.id.toUpperCase() === code || o.id.replace('HBC-', '') === code.replace('HBC-', '')
    );

    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchError(`Không tìm thấy đơn hàng "${code}". Vui lòng kiểm tra lại mã hoặc số điện thoại.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    const codeParam = searchParams.get('code') || searchParams.get('orderCode');
    if (codeParam) {
      const clean = codeParam.trim().toUpperCase();
      setSearchCode(clean);
      fetchOrderFromApi(clean);
    }
  }, [searchParams]);

  const handleGuestSearch = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = searchCode.trim().toUpperCase();
    const cleanPhone = searchPhone.trim();

    if (!cleanCode) {
      setSearchError('Vui lòng nhập mã đơn hàng.');
      return;
    }

    fetchOrderFromApi(cleanCode, cleanPhone);
  };

  return (
    <div className="space-y-6">
      {/* Card thông báo Mua sắm để theo dõi */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide bg-rose-50 text-rose-600 border border-rose-200 mb-3">
            <ShoppingBag size={13} /> Theo dõi đơn hàng
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Mua sắm để theo dõi</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Bạn chưa đăng nhập vào hệ thống. Đăng nhập tài khoản giúp bạn dễ dàng theo dõi chi tiết quá trình giao hàng, kiểm tra lịch sử đặt hàng và quản lý thông tin thuận tiện hơn.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors shadow-sm">
              <LogIn size={16} /> Đăng Nhập
            </Link>
            <Link to="/products" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-sm transition-colors shadow-sm">
              <ShoppingBag size={16} /> Mua Sắm Ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Mục Tra cứu nhanh qua Mã đơn hàng */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Hoặc tra cứu nhanh bằng mã đơn hàng</h3>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">Dành cho khách hàng chưa đăng nhập hoặc đặt hàng nhanh</p>
        </div>

        <form onSubmit={handleGuestSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Mã đơn hàng <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input type="text" value={searchCode} onChange={e => setSearchCode(e.target.value)} placeholder="VD: HBC-82914" className="w-full pl-3.5 pr-10 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm uppercase transition-colors" required />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">Số điện thoại nhận hàng</label>
              <div className="relative">
                <input type="tel" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} placeholder="VD: 0359490221" className="w-full pl-3.5 pr-10 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm transition-colors" />
                <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="pt-1">
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-gray-900 hover:bg-black text-white font-semibold text-sm transition-colors">
              <Search size={15} /> Tra Cứu Đơn Hàng
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mt-6 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
            <div>
              <p className="font-semibold">{searchError}</p>
              <p className="text-xs text-gray-600 mt-1">Cần hỗ trợ? Vui lòng liên hệ hotline: <a href="tel:0359490221" className="font-semibold text-rose-600 underline">0359 490 221</a></p>
            </div>
          </div>
        )}

        {searchedOrder && (
          <div className="mt-6 border border-gray-200 rounded-md p-5 bg-gray-50/50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-4">
              <div>
                <span className="text-xs text-gray-500 block">Mã đơn hàng</span>
                <strong className="text-base text-gray-900 font-bold">{searchedOrder.id}</strong>
              </div>
              <OrderStatusBadge status={searchedOrder.status} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs text-gray-600">
              <p className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400 shrink-0" /><span>Ngày đặt: <strong>{searchedOrder.date}</strong></span></p>
              <p className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400 shrink-0" /><span>Số điện thoại: <strong>{searchedOrder.phone}</strong></span></p>
              <p className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400 shrink-0" /><span className="truncate">Địa chỉ: <strong>{searchedOrder.shippingAddress}</strong></span></p>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Chi tiết sản phẩm</h4>
              <div className="space-y-2">
                {searchedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 py-1.5 bg-white p-2.5 rounded border border-gray-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded border border-gray-200 shrink-0 bg-slate-50"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = DEFAULT_PLACEHOLDER;
                          }}
                        />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        <span className="text-[11px] text-gray-500">Số lượng: x{item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">Tổng thanh toán:</span>
              <span className="text-base font-bold text-rose-600">{searchedOrder.total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}