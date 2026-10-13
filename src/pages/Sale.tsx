import { useState, useEffect, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  Zap, 
  Ticket, 
  Copy, 
  Check, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Percent, 
  Eye, 
  Star,
  ChevronRight,
  Gift,
  ArrowDown,
  CheckCircle2
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import Breadcrumb from '../components/Breadcrumb';
import heroVideo from '../assets/video/bannerSale.mp4';
import productsData from '../data/products.json';

// Định nghĩa Interface cho sản phẩm Sale
export interface SaleProduct {
  id: string | number;
  name: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  image: string;
  category: string;
  subCategory?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  soldCount: number;
  totalStock: number;
  soldPercent: number;
  [key: string]: any;
}

const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/hb22fnuq/image/upload';
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

// Danh sách mã giảm giá độc quyền
const VOUCHERS = [
  {
    code: 'MEGA30K',
    discount: '30.000₫',
    minOrder: 'Đơn từ 299K',
    desc: 'Áp dụng toàn sàn mỹ phẩm',
    tag: 'HOT DEAL',
    tagColor: 'bg-pink-500 text-white',
    expires: 'Còn 3 ngày'
  },
  {
    code: 'BEAUTY50K',
    discount: '50.000₫',
    minOrder: 'Đơn từ 499K',
    desc: 'Cho combo skincare & serum',
    tag: 'BÁN CHẠY',
    tagColor: 'bg-rose-400 text-white',
    expires: 'Còn 2 ngày'
  },
  {
    code: 'VIP100K',
    discount: '100.000₫',
    minOrder: 'Đơn từ 899K',
    desc: 'Ưu đãi dành cho thành viên VIP',
    tag: 'SIÊU TIẾT KIỆM',
    tagColor: 'bg-fuchsia-500 text-white',
    expires: 'Còn 1 ngày'
  },
  {
    code: 'FREESHIP',
    discount: 'FREESHIP',
    minOrder: 'Đơn từ 199K',
    desc: 'Miễn phí giao hàng toàn quốc',
    tag: 'TOÀN QUỐC',
    tagColor: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
    expires: 'Còn 3 ngày'
  }
];

// Danh mục lọc
const CATEGORY_TABS = [
  { id: 'all', label: '🔥 Tất Cả Deal' },
  { id: 'duong-am', label: 'Dưỡng Ẩm & Phục Hồi' },
  { id: 'cham-soc-da', label: 'Chăm Sóc Da & Cơ Thể' },
  { id: 'tre-em', label: 'Dịu Nhẹ Trẻ Em' },
  { id: 'combo', label: 'Combo Tiết Kiệm' }
];

export default function Sale() {
  const { addToCart, openCart } = useContext(CartContext) || {};

  // 1. Logic Countdown Timer (3 ngày đếm lùi thời gian thực)
  const [timeLeft, setTimeLeft] = useState({
    days: '03',
    hours: '14',
    minutes: '45',
    seconds: '20'
  });

  useEffect(() => {
    const storageKey = 'hb_mega_sale_end_time';
    let endTime = localStorage.getItem(storageKey);

    if (!endTime || isNaN(Number(endTime))) {
      const target = Date.now() + (3 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000);
      localStorage.setItem(storageKey, target.toString());
      endTime = target.toString();
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = Math.max(0, Number(endTime) - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Chuẩn bị và làm giàu dữ liệu sản phẩm Sale
  const allSaleProducts: SaleProduct[] = useMemo(() => {
    const raw = (productsData as any[]) || [];
    return raw.slice(0, 30).map((p, index) => {
      const baseOldPrice = p.originalPrice && p.originalPrice > p.price
        ? p.originalPrice
        : Math.round(p.price * (1.3 + (index % 4) * 0.1));
      
      const discount = Math.round(((baseOldPrice - p.price) / baseOldPrice) * 100);
      const soldCount = 50 + (index * 13) % 180;
      const totalStock = soldCount + 5 + (index % 8);
      const soldPercent = Math.min(96, Math.round((soldCount / totalStock) * 100));

      return {
        ...p,
        oldPrice: baseOldPrice,
        discountPercent: discount > 0 ? discount : 35,
        soldCount,
        totalStock,
        soldPercent
      };
    });
  }, []);

  // 3-4 Sản phẩm Flash Sale Tâm Điểm
  const flashSaleHighlights = useMemo(() => {
    return allSaleProducts.slice(0, 4);
  }, [allSaleProducts]);

  // Tab lọc danh mục
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return allSaleProducts.slice(4);
    if (activeTab === 'duong-am') {
      return allSaleProducts.filter(p => 
        (p.name?.toLowerCase().includes('ẩm') || p.subCategory?.toLowerCase().includes('ẩm') || p.category?.toLowerCase().includes('ẩm'))
      );
    }
    if (activeTab === 'cham-soc-da') {
      return allSaleProducts.filter(p => 
        p.category?.toLowerCase().includes('chăm sóc') || p.category?.toLowerCase().includes('cơ thể')
      );
    }
    if (activeTab === 'tre-em') {
      return allSaleProducts.filter(p => 
        p.name?.toLowerCase().includes('bé') || p.category?.toLowerCase().includes('trẻ em')
      );
    }
    if (activeTab === 'combo') {
      return allSaleProducts.filter(p => p.price > 350000);
    }
    return allSaleProducts.slice(4);
  }, [activeTab, allSaleProducts]);

  // Copy mã voucher
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  // Toast giỏ hàng
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handleAddProduct = (product: SaleProduct, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (addToCart) {
      addToCart(product, 'Mặc định', 1);
    }
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3000);
  };


  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="bg-rose-50 text-slate-800 min-h-screen relative selection:bg-pink-500 selection:text-white font-sans">
      
      {/* ── 1. STICKY COUNTDOWN BAR (Dính sát ngay dưới Navbar khi cuộn) ── */}
      <aside 
        aria-label="Thanh đếm ngược khuyến mãi"
        className="sticky top-[58px] sm:top-[68px] lg:top-[74px] z-40 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white shadow-md py-2 px-3 sm:px-6 backdrop-blur-md border-b border-pink-300/50"
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
            </span>
            <span className="text-white uppercase flex items-center gap-1.5 font-extrabold text-[11px] sm:text-sm drop-shadow-sm">
              <Flame size={16} className="text-yellow-300 animate-bounce shrink-0" />
              ĐẠI TIỆC MEGA SALE - KẾT THÚC SAU:
            </span>
          </div>

          {/* Bộ đếm thời gian thực */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono">
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/40 text-center min-w-[36px] sm:min-w-[42px] shadow-sm">
              <span className="font-extrabold text-sm sm:text-base text-white">{timeLeft.days}</span>
              <span className="block text-[9px] uppercase tracking-wider text-pink-100 font-sans">Ngày</span>
            </div>
            <span className="font-black text-white text-sm">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/40 text-center min-w-[36px] sm:min-w-[42px] shadow-sm">
              <span className="font-extrabold text-sm sm:text-base text-white">{timeLeft.hours}</span>
              <span className="block text-[9px] uppercase tracking-wider text-pink-100 font-sans">Giờ</span>
            </div>
            <span className="font-black text-white text-sm">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/40 text-center min-w-[36px] sm:min-w-[42px] shadow-sm">
              <span className="font-extrabold text-sm sm:text-base text-white">{timeLeft.minutes}</span>
              <span className="block text-[9px] uppercase tracking-wider text-pink-100 font-sans">Phút</span>
            </div>
            <span className="font-black text-white text-sm">:</span>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md border border-white/40 text-center min-w-[36px] sm:min-w-[42px] shadow-sm">
              <span className="font-extrabold text-sm sm:text-base text-yellow-300 animate-pulse">{timeLeft.seconds}</span>
              <span className="block text-[9px] uppercase tracking-wider text-pink-100 font-sans">Giây</span>
            </div>

            <button 
              onClick={() => scrollToSection('flash-sale')}
              className="hidden md:inline-flex items-center gap-1 ml-3 px-4 py-1.5 bg-yellow-300 hover:bg-yellow-400 text-pink-900 font-extrabold text-xs uppercase tracking-wider rounded-full transition-transform active:scale-95 shadow-md"
            >
              <Zap size={13} fill="currentColor" /> Săn Ngay
            </button>
          </div>
        </div>
      </aside>

      {/* ── 2. HERO BANNER CÓ VIDEO VÀ TYPOGRAPHY ĐỈNH CAO ── */}
      <section className="relative min-h-[72vh] md:min-h-[82vh] flex items-center justify-center overflow-hidden">
        {/* Video nền */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover scale-105 filter blur-[1px]"
          poster="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80&auto=format&fit=crop"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Lớp overlay gradient Pink/Rose chuyển xuống sáng dần */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/70 via-pink-900/50 to-rose-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.3)_0,transparent_70%)]"></div>

        {/* Nội dung chính giữa Hero */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl py-14">
          
          <Breadcrumb 
            items={[
              { label: 'Trang chủ', link: '/' },
              { label: 'Săn Sale Khủng' }
            ]} 
            className="justify-center text-pink-100 mb-6 drop-shadow-md"
          />

          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-pink-500/30 border border-pink-300/50 text-white text-xs sm:text-sm font-bold uppercase tracking-[2px] sm:tracking-[3px] mb-5 backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(236,72,153,0.5)]"> SIÊU ĐẠI HỘI LÀM ĐẸP CHÍNH HÃNG 2026
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none mb-4 drop-shadow-[0_4px_15px_rgba(190,24,93,0.6)]">
            MEGA BEAUTY <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-pink-300 via-white to-pink-200 bg-clip-text text-transparent drop-shadow-lg">
              SALE UP TO 70%
            </span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-pink-50 max-w-2xl mx-auto font-medium leading-relaxed mb-8 sm:mb-10 text-balance drop-shadow-md">
            Cơn lốc giảm giá nghìn deal sốc cho toàn bộ mỹ phẩm nhập khẩu, serum dưỡng da và các dòng cấp ẩm độc quyền. Cơ hội duy nhất chỉ trong đợt Sale này!
          </p>

          {/* CTA Nút Bấm Phát Sáng Tone Hồng */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('flash-sale')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-base sm:text-lg uppercase tracking-wider rounded-full shadow-[0_0_25px_rgba(236,72,153,0.6)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 group cursor-pointer border border-pink-400"
            >
              <Flame size={22} className="animate-bounce text-yellow-300" />
              <span>SĂN SALE NGAY</span>
              <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('vouchers-zone')}
              className="w-full sm:w-auto px-7 py-4 bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-full border border-pink-200/50 backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Ticket size={18} />
              <span>Lấy Voucher 100K</span>
            </button>
          </div>

          {/* Cam kết uy tín */}
          <div className="mt-12 pt-8 border-t border-pink-300/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-pink-900 font-semibold max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck size={18} className="text-pink-600 shrink-0" />
              <span>100% Chính Hãng</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck size={18} className="text-pink-600 shrink-0" />
              <span>Freeship Từ 199K</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <RotateCcw size={18} className="text-pink-600 shrink-0" />
              <span>Đổi Trả 7 Ngày</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Gift size={18} className="text-pink-600 shrink-0" />
              <span>Quà Tặng Mọi Đơn</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. VOUCHERS & COUPONS ZONE (Vé viền răng cưa) ── */}
      <section id="vouchers-zone" className="py-14 sm:py-20 bg-white border-y border-pink-100 relative overflow-hidden">
        {/* Background blobs cho sinh động */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 text-pink-500 font-extrabold uppercase text-xs tracking-widest mb-2 bg-pink-50 px-4 py-1.5 rounded-full border border-pink-200">
              <Ticket size={15} /> KHO VOUCHER ĐỘC QUYỀN
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-rose-950 uppercase tracking-tight">
              Lưu Mã Giảm Giá Liền Tay
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-3 max-w-lg mx-auto font-medium">
              Thu thập tất cả mã giảm giá bên dưới trước khi thanh toán để được áp dụng ưu đãi tối đa. Số lượng có hạn!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VOUCHERS.map((voucher) => (
              <div 
                key={voucher.code}
                className="relative bg-gradient-to-br from-white to-pink-50 rounded-2xl p-5 border-2 border-pink-100 hover:border-pink-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(244,114,182,0.15)] transition-all duration-300 group flex flex-col justify-between overflow-hidden"
              >
                {/* Vết cắt nửa hình tròn phong cách vé voucher */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r-2 border-pink-100 group-hover:border-pink-300 transition-colors"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l-2 border-pink-100 group-hover:border-pink-300 transition-colors"></div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${voucher.tagColor}`}>
                      {voucher.tag}
                    </span>
                    <span className="text-[11px] text-pink-600 font-bold bg-pink-100 px-2 py-0.5 rounded-full">
                      {voucher.expires}
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight drop-shadow-sm">
                      {voucher.discount}
                    </span>
                    <p className="text-slate-800 font-bold text-sm mt-1">{voucher.minOrder}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{voucher.desc}</p>
                  </div>
                </div>

                {/* Đường viền đứt đoạn kiểu vé cào */}
                <div className="border-t-2 border-dashed border-pink-200 my-4"></div>

                <div className="flex items-center justify-between gap-2">
                  <div className="bg-white border border-pink-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-pink-600 tracking-wider shadow-inner">
                    {voucher.code}
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                      copiedCode === voucher.code
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-200 active:scale-95'
                    }`}
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <Check size={14} /> Đã Lưu!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Lưu Mã
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. FLASH SALE HIGHLIGHT (SẢN PHẨM TÂM ĐIỂM SẮP CHÁY HÀNG) ── */}
      <section id="flash-sale" className="py-16 sm:py-24 bg-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wider mb-3">
                <Flame size={15} className="text-red-500 animate-pulse" /> SỐ LƯỢNG CÓ HẠN
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-rose-950 uppercase tracking-tight flex items-center gap-3">
                ⚡ DEAL TÂM ĐIỂM CHÁY HÀNG
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm font-medium">
              Giá giảm độc quyền chỉ áp dụng trong phiên flash sale hiện tại. Đơn hàng tự động hủy nếu không kịp thanh toán!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleHighlights.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-300 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(244,114,182,0.2)] group flex flex-col justify-between"
              >
                <div>
                  {/* Ảnh sản phẩm */}
                  <div className="relative aspect-square overflow-hidden bg-white p-2">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = DEFAULT_PLACEHOLDER;
                      }}
                    />
                    
                    {/* Badge Giảm Giá */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-md shadow-lg shadow-pink-500/30 flex items-center gap-1">
                      <Flame size={13} fill="currentColor" />
                      -{product.discountPercent}%
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-amber-500 text-xs font-bold px-2 py-1 rounded-md shadow flex items-center gap-1 border border-amber-100">
                      <Star size={12} fill="currentColor" /> {product.rating || 4.9}
                    </div>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-4 sm:p-5">
                    <span className="text-[11px] font-extrabold text-pink-500 uppercase tracking-wider block mb-1.5 bg-pink-50 w-fit px-2 py-0.5 rounded">
                      {product.brand || 'CHÍNH HÃNG'}
                    </span>

                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="text-slate-800 font-bold text-sm sm:text-base line-clamp-2 hover:text-pink-600 transition-colors mb-3 leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Giá bán */}
                    <div className="flex items-baseline gap-2.5 mb-4">
                      <span className="text-rose-600 font-black text-xl sm:text-2xl drop-shadow-sm">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-slate-400 line-through text-xs sm:text-sm font-medium">
                        {product.oldPrice.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    {/* THANH TIẾN ĐỘ SỐ LƯỢNG ĐÃ BÁN (FOMO Progress bar) */}
                    <div className="mb-2 bg-rose-50 p-3 rounded-xl border border-pink-100">
                      <div className="flex justify-between items-center text-xs font-semibold mb-2">
                        <span className="flex items-center gap-1 text-rose-600 font-bold">
                          <Flame size={14} className="text-rose-500 animate-bounce" /> Đã bán {product.soldPercent}%
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Còn {product.totalStock - product.soldCount} suất
                        </span>
                      </div>
                      <div className="w-full bg-pink-200/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 h-full rounded-full transition-all duration-1000 relative"
                          style={{ width: `${product.soldPercent}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-[pulse_1.5s_infinite]"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Nút thêm giỏ hàng */}
                <div className="p-4 sm:p-5 pt-0">
                  <button
                    onClick={(e) => handleAddProduct(product, e)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold uppercase text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-pink-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart size={16} /> Thêm Vào Giỏ Hàng
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. DYNAMIC CATEGORY TABS (Tab lọc danh mục mượt mà) ── */}
      <section id="sale-products" className="py-6 bg-white/80 backdrop-blur-lg sticky top-[106px] sm:top-[116px] lg:top-[122px] z-30 border-y border-pink-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-300/50 scale-105'
                    : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-pink-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. MAIN PRODUCT GRID (Lưới sản phẩm Sale) ── */}
      <section className="py-14 sm:py-20 bg-rose-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-rose-950 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={22} className="text-pink-500" />
              Danh Sách Ưu Đãi Đang Áp Dụng ({filteredProducts.length})
            </h3>
            <span className="text-xs text-pink-600 font-semibold bg-pink-100 px-3 py-1 rounded-full hidden sm:inline">
              Giá đã tự động giảm
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-pink-100 hover:border-pink-300 transition-all duration-300 shadow-sm hover:shadow-[0_8px_25px_rgba(244,114,182,0.15)] group flex flex-col justify-between"
              >
                <div>
                  {/* Khung ảnh */}
                  <div className="relative aspect-square overflow-hidden bg-white p-2">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = DEFAULT_PLACEHOLDER;
                      }}
                    />

                    {/* Huy hiệu giảm giá */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] sm:text-xs font-black px-2 py-0.5 rounded shadow-sm">
                      -{product.discountPercent}%
                    </div>

                    {/* Nút thêm giỏ hàng trượt lên trên desktop khi hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                      <button
                        onClick={(e) => handleAddProduct(product, e)}
                        className="w-full py-2.5 bg-white text-pink-600 hover:bg-pink-50 hover:text-rose-600 border border-pink-200 font-bold uppercase text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <ShoppingCart size={14} /> Thêm vào giỏ
                      </button>
                    </div>
                  </div>

                  {/* Nội dung card */}
                  <div className="p-3 sm:p-4">
                    <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider block mb-1 truncate bg-pink-50 w-fit px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>

                    <Link to={`/product/${product.id}`} className="block">
                      <h4 className="text-slate-800 text-xs sm:text-sm font-semibold line-clamp-2 hover:text-pink-600 transition-colors mb-2 leading-snug">
                        {product.name}
                      </h4>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="text-rose-600 font-black text-sm sm:text-base">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-slate-400 line-through text-[11px] sm:text-xs">
                        {product.oldPrice.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-pink-50 text-[10px] text-slate-500 flex items-center justify-between font-medium">
                      <span>Đã bán {product.soldCount}</span>
                      <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                        <Star size={10} fill="currentColor" /> {product.rating || 4.8}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nút giỏ hàng dành riêng cho thiết bị Mobile */}
                <div className="p-3 pt-0 md:hidden">
                  <button
                    onClick={(e) => handleAddProduct(product, e)}
                    className="w-full py-2 bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white font-bold text-xs rounded-lg transition-colors border border-pink-200 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <ShoppingCart size={13} /> Thêm giỏ
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ── 8. TOAST THÊM VÀO GIỎ HÀNG THÀNH CÔNG ── */}
      {toastMessage && (
        <aside 
          aria-live="assertive"
          className="fixed top-28 right-4 sm:right-8 z-50 bg-white border border-pink-200 text-slate-800 px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(244,114,182,0.2)] flex items-center gap-3 animate-in slide-in-from-top-3 duration-200"
        >
          <div className="bg-emerald-100 p-1.5 rounded-full">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
          </div>
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-emerald-600 mb-0.5">Thành công!</p>
            <p className="text-slate-600 line-clamp-1 font-medium">{toastMessage}</p>
          </div>
          {openCart && (
            <button
              onClick={() => openCart()}
              className="ml-2 pl-2 border-l border-pink-100 text-xs font-bold text-pink-600 hover:text-pink-500 whitespace-nowrap"
            >
              Xem giỏ
            </button>
          )}
        </aside>
      )}

    </main>
  );
}