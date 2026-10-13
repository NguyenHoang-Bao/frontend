import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, ChevronRight, MapPin } from 'lucide-react';
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

export default function UserTracking({ currentUser }: { currentUser: any }) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem(`orders_${currentUser.phone || currentUser.email || currentUser.id || 'default'}`);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        setOrders(getDefaultOrders(currentUser.name, currentUser.phone));
      }
    } else {
      setOrders(getDefaultOrders(currentUser.name, currentUser.phone));
    }
  }, [currentUser]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header chào mừng */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Khách hàng thành viên</span>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">Xin chào, {currentUser.name || 'Quý khách'}!</h2>
          <p className="text-gray-500 text-xs mt-0.5">Quản lý và tra cứu trạng thái đơn hàng của bạn</p>
        </div>
        <Link to="/products" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-sm">
          <ShoppingBag size={14} /> Mua Sắm Thêm
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
        {[
          { id: 'all', label: 'Tất cả đơn' },
          { id: 'pending', label: 'Chờ xác nhận' },
          { id: 'processing', label: 'Đang chuẩn bị' },
          { id: 'shipping', label: 'Đang vận chuyển' },
          { id: 'delivered', label: 'Đã hoàn thành' },
          { id: 'cancelled', label: 'Đã hủy' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Danh sách đơn hàng */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-md bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <Package size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Chưa có đơn hàng nào</h3>
          <p className="text-gray-500 text-xs mb-4 max-w-sm mx-auto">
            Bạn hiện chưa có đơn hàng nào trong mục này. Hãy ghé xem các sản phẩm mỹ phẩm chính hãng của chúng tôi!
          </p>
          <Link to="/products" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs uppercase tracking-wider transition-colors">
            Khám Phá Sản Phẩm <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Header đơn */}
              <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                    <Package size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-500">{order.date}</span>
                    </div>
                    <span className="text-[11px] text-gray-500">PTTT: {order.paymentMethod}</span>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Danh sách món hàng */}
              <div className="p-4 divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border border-gray-200 shrink-0 bg-slate-50"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = DEFAULT_PLACEHOLDER;
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-xs md:text-sm truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Số lượng: x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-xs md:text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer đơn */}
              <div className="p-4 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate max-w-md">{order.shippingAddress}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-[11px] text-gray-500 block">Tổng thanh toán:</span>
                    <span className="text-base font-bold text-rose-600">{order.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <Link to="/contact" className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs transition-colors">
                    Hỗ trợ
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}