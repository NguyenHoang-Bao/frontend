import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  UserCircle, 
  LogOut, 
  MapPin, 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  X,
  ExternalLink,
  Camera
} from 'lucide-react';
import { addressService, UserAddress } from '../services/addressService';
import { getImageUrl } from '../utils/imageHelper';

export default function Profile() {
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  // Tab đang chọn: 'profile' | 'addresses' | 'orders'
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('addresses');

  // Danh sách địa chỉ nhận hàng
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  // State Modal Thêm / Sửa địa chỉ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [modalForm, setModalForm] = useState({
    fullName: '',
    phone: '',
    province: 'Hồ Chí Minh',
    district: '',
    ward: '',
    address: '',
    label: 'Nhà riêng' as 'Nhà riêng' | 'Văn phòng',
    isDefault: false
  });
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  // Danh sách đơn hàng cá nhân
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Form cập nhật thông tin cá nhân
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthDay: '01',
    birthMonth: '01',
    birthYear: '2000'
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Xử lý upload ảnh đại diện chuẩn Shopee (Dung lượng <= 1MB, .jpg, .jpeg, .png)
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Kiểm tra định dạng
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validExtensions.includes(file.type)) {
      setAvatarError('Định dạng tệp không hợp lệ! Vui lòng chọn ảnh .JPEG hoặc .PNG');
      return;
    }

    // 2. Kiểm tra kích thước tối đa 1 MB
    if (file.size > 1024 * 1024) {
      setAvatarError('Dụng lượng file vượt quá 1 MB! Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const updatedUser = { ...user, avatar: base64Url };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  // Load dữ liệu khi vào trang
  useEffect(() => {
    if (user) {
      // 1. Khởi tạo sổ địa chỉ
      const addrs = addressService.initSampleAddressesIfEmpty(user);
      setAddresses(addrs);

      // 2. Điền form hồ sơ
      setProfileForm({
        name: user.name || user.fullName || '',
        phone: user.phone || user.phoneNumber || '',
        email: user.email || '',
        gender: user.gender || 'Nam',
        birthDay: user.birthDay || '01',
        birthMonth: user.birthMonth || '01',
        birthYear: user.birthYear || '2000'
      });

      // 3. Lấy danh sách đơn hàng đã mua
      try {
        const phone = user.phone || user.phoneNumber || '';
        const phoneOrders = localStorage.getItem(`orders_${phone}`);
        if (phoneOrders) {
          setMyOrders(JSON.parse(phoneOrders));
        } else {
          const all = localStorage.getItem('all_placed_orders');
          if (all) {
            const parsed = JSON.parse(all);
            const userOrders = parsed.filter((o: any) => o.phone === phone || o.customerName === user.name);
            setMyOrders(userOrders);
          }
        }
      } catch (e) {
        console.error('Lỗi khi đọc đơn hàng:', e);
      }
    }
  }, [user]);

  // Nếu không có user thì chuyển về trang login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản không?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  // Mở modal thêm địa chỉ mới
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setModalForm({
      fullName: user.name || user.fullName || '',
      phone: user.phone || user.phoneNumber || '',
      province: 'Hồ Chí Minh',
      district: '',
      ward: '',
      address: '',
      label: 'Nhà riêng',
      isDefault: addresses.length === 0
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  // Mở modal sửa địa chỉ
  const handleOpenEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setModalForm({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province || 'Hồ Chí Minh',
      district: addr.district || '',
      ward: addr.ward || '',
      address: addr.address || '',
      label: addr.label || 'Nhà riêng',
      isDefault: Boolean(addr.isDefault)
    });
    setModalErrors({});
    setIsModalOpen(true);
  };

  // Lưu địa chỉ (Thêm mới hoặc Cập nhật)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!modalForm.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
    const phoneClean = modalForm.phone.trim().replace(/\s+/g, '');
    if (!phoneClean) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(phoneClean)) {
      errors.phone = 'Số điện thoại không hợp lệ (cần 10 chữ số)';
    }
    if (!modalForm.address.trim()) errors.address = 'Vui lòng nhập địa chỉ cụ thể';

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    if (editingAddress) {
      // Cập nhật địa chỉ cũ
      const updated: UserAddress = {
        ...editingAddress,
        fullName: modalForm.fullName.trim(),
        phone: phoneClean,
        province: modalForm.province,
        district: modalForm.district.trim(),
        ward: modalForm.ward.trim(),
        address: modalForm.address.trim(),
        label: modalForm.label,
        isDefault: modalForm.isDefault
      };
      addressService.updateAddress(user, updated);
    } else {
      // Thêm mới địa chỉ
      addressService.addAddress(user, {
        fullName: modalForm.fullName.trim(),
        phone: phoneClean,
        province: modalForm.province,
        district: modalForm.district.trim(),
        ward: modalForm.ward.trim(),
        address: modalForm.address.trim(),
        label: modalForm.label,
        isDefault: modalForm.isDefault
      });
    }

    // Refresh lại danh sách
    const updatedList = addressService.getAddresses(user);
    setAddresses(updatedList);
    setIsModalOpen(false);
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 địa chỉ nhận hàng!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
      addressService.deleteAddress(user, id);
      setAddresses(addressService.getAddresses(user));
    }
  };

  // Đặt làm mặc định
  const handleSetDefault = (id: string) => {
    addressService.setDefault(user, id);
    setAddresses(addressService.getAddresses(user));
  };

  // Cập nhật thông tin hồ sơ
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: profileForm.name.trim(),
      fullName: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      phoneNumber: profileForm.phone.trim(),
      email: profileForm.email.trim(),
      gender: profileForm.gender,
      birthDay: profileForm.birthDay,
      birthMonth: profileForm.birthMonth,
      birthYear: profileForm.birthYear
    };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('storage'));
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 pt-6 sm:pt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Tài khoản của tôi</span>
        </div>

        {/* Bố cục chính: Sidebar trái + Content phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: THÔNG TIN USER & MENU TABS */}
          <div className="lg:col-span-4 space-y-5">
            {/* Card thông tin User tóm tắt */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
              <div className="relative group mb-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || user.fullName || 'HB'}
                    className="w-20 h-20 rounded-full object-cover border-2 border-rose-300 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {(user.name || user.fullName || 'HB').charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Nút đổi ảnh nhanh trên sidebar */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setTimeout(() => avatarInputRef.current?.click(), 100);
                  }}
                  title="Thay đổi ảnh đại diện"
                  className="absolute bottom-0 right-0 p-1.5 bg-white text-slate-700 hover:text-rose-600 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 cursor-pointer"
                >
                  <Camera size={13} />
                </button>
              </div>
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                {user.name || user.fullName || 'Khách Hàng'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{user.phone || user.phoneNumber || user.email}</p>
              
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <Sparkles size={13} />
                <span>Hội Viên Kim Cương (350 điểm)</span>
              </div>

              {/* Menu Tabs */}
              <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-1.5 text-left text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'addresses'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <MapPin size={18} />
                  <span>Sổ Địa Chỉ Nhận Hàng</span>
                  {addresses.length > 0 && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'addresses' ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {addresses.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag size={18} />
                  <span>Đơn Mua / Lịch Sử</span>
                  {myOrders.length > 0 && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'orders' ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {myOrders.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <UserCircle size={18} />
                  <span>Hồ Sơ Của Tôi</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer pt-3 border-t border-slate-100 mt-2"
                >
                  <LogOut size={18} />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>

            {/* Quick Link sang Giỏ Hàng & Checkout */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-3xl border border-rose-100 text-center">
              <p className="text-xs text-rose-900 font-bold">Cần thanh toán các món đã chọn?</p>
              <Link
                to="/checkout"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Đến Trang Thanh Toán</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG TỪNG TAB */}
          <div className="lg:col-span-8">
            
            {/* ── TAB 1: SỔ ĐỊA CHỈ NHẬN HÀNG (SHOPEE STYLE) ── */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Địa Chỉ Của Tôi</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quản lý danh sách địa chỉ nhận hàng để thanh toán nhanh như trên Shopee
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                    <span>Thêm Địa Chỉ Mới</span>
                  </button>
                </div>

                {/* Danh sách địa chỉ đã lưu */}
                {addresses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MapPin size={40} className="mx-auto mb-3 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-semibold">Bạn chưa lưu địa chỉ nào.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-4 text-xs font-bold text-rose-600 hover:underline"
                    >
                      + Thêm địa chỉ nhận hàng đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {addresses.map((addr) => {
                      const fullAddr = [addr.address, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
                      return (
                        <div key={addr.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-grow">
                            {/* Họ tên + SĐT + Badge */}
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-black text-sm text-slate-900">{addr.fullName}</span>
                              <span className="text-slate-300">|</span>
                              <span className="text-xs text-slate-600 font-semibold">{addr.phone}</span>
                              
                              {addr.label && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                  {addr.label}
                                </span>
                              )}
                              {addr.isDefault && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                                  Mặc định
                                </span>
                              )}
                            </div>

                            {/* Địa chỉ chi tiết */}
                            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                              {fullAddr}
                            </p>
                          </div>

                          {/* Hành động: Sửa, Xóa, Thiết lập mặc định */}
                          <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(addr)}
                                className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                              >
                                Cập nhật
                              </button>
                              {!addr.isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="text-slate-400 hover:text-rose-600 font-medium hover:underline cursor-pointer"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>

                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: ĐƠN MUA / LỊCH SỬ ĐƠN HÀNG ── */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Lịch Sử Mua Hàng</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Theo dõi và quản lý tất cả các đơn hàng đã đặt</p>
                  </div>
                  <Link
                    to="/order-tracking"
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>Tra cứu chi tiết</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>

                {myOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingBag size={40} className="mx-auto mb-3 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-semibold">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/products" className="mt-4 inline-block text-xs font-bold text-rose-600 hover:underline">
                      Khám phá sản phẩm và mua ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((ord: any, idx: number) => (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-rose-200 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">#{ord.id || ord.orderCode}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{ord.date || 'Gần đây'}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'completed' || ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ord.status === 'shipping'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}>
                            {ord.statusText || ord.status || 'Chờ xử lý'}
                          </span>
                        </div>

                        {/* Danh sách món thu gọn */}
                        <div className="py-3 space-y-2">
                          {(ord.items || []).slice(0, 2).map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-800 line-clamp-1 max-w-sm">
                                • {item.name || item.productName} (x{item.quantity})
                              </span>
                              <span className="font-bold text-slate-700">
                                {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          ))}
                          {(ord.items || []).length > 2 && (
                            <p className="text-[11px] text-slate-400 italic">
                              + và {(ord.items || []).length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>

                        {/* Tổng tiền & Nút tra cứu */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-500">Tổng thanh toán: </span>
                            <span className="text-sm font-black text-rose-600">
                              {(ord.total || 0).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                          <Link
                            to={`/order-tracking?code=${encodeURIComponent(ord.id || ord.orderCode)}`}
                            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                          >
                            Chi tiết hành trình
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: HỒ SƠ CỦA TÔI (CHUẨN GIAO DIỆN SHOPEE) ── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="pb-5 mb-6 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Hồ Sơ Của Tôi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>

                {profileSaveSuccess && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <Check size={16} />
                    <span>Cập nhật thông tin tài khoản thành công!</span>
                  </div>
                )}

                {/* Bố cục 2 cột chuẩn Shopee: Form bên trái, Upload Avatar bên phải */}
                <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-8 lg:gap-12 pt-2">
                  
                  {/* CỘT TRÁI: FORM THÔNG TIN CÁ NHÂN */}
                  <form onSubmit={handleSaveProfile} className="flex-1 space-y-4 sm:space-y-5 w-full">
                    {/* Tên đăng nhập */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-500 sm:text-right">
                        Tên đăng nhập
                      </label>
                      <div className="sm:col-span-3 text-sm text-slate-800 font-semibold">
                        {user.username || user.email?.split('@')[0] || 'hb_' + (user.phone || 'customer')}
                      </div>
                    </div>

                    {/* Tên */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Tên <span className="text-rose-500">*</span>
                      </label>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-semibold transition-all"
                          placeholder="Họ và tên"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Email
                      </label>
                      <div className="sm:col-span-3">
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all"
                          placeholder="nhập email của bạn"
                        />
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Số điện thoại
                      </label>
                      <div className="sm:col-span-3">
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all"
                          placeholder="nhập số điện thoại"
                        />
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Giới tính
                      </label>
                      <div className="sm:col-span-3 flex items-center gap-6">
                        {(['Nam', 'Nữ', 'Khác'] as const).map((genderOption) => (
                          <label key={genderOption} className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={genderOption}
                              checked={profileForm.gender === genderOption}
                              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as any })}
                              className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                            <span>{genderOption}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Ngày sinh
                      </label>
                      <div className="sm:col-span-3 grid grid-cols-3 gap-2">
                        <select
                          value={profileForm.birthDay}
                          onChange={(e) => setProfileForm({ ...profileForm, birthDay: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                            <option key={d} value={d}>Ngày {d}</option>
                          ))}
                        </select>
                        <select
                          value={profileForm.birthMonth}
                          onChange={(e) => setProfileForm({ ...profileForm, birthMonth: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                          ))}
                        </select>
                        <select
                          value={profileForm.birthYear}
                          onChange={(e) => setProfileForm({ ...profileForm, birthYear: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          {Array.from({ length: 80 }, (_, i) => String(2025 - i)).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Nút submit */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 pt-3">
                      <div className="hidden sm:block" />
                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* ĐƯỜNG KẺ NGĂN CÁCH GIỮA 2 CỘT */}
                  <div className="hidden md:block w-px bg-slate-200/80 self-stretch my-2" />

                  {/* CỘT PHẢI: KHUNG CHỌN ẢNH ĐẠI DIỆN CHUẨN SHOPEE (Ảnh 1) */}
                  <div className="w-full md:w-72 flex flex-col items-center justify-center text-center shrink-0">
                    <div className="RTUhW8 flex flex-col items-center w-full">
                      {/* Avatar preview */}
                      <div
                        role="header"
                        onClick={() => avatarInputRef.current?.click()}
                        className="GJI0e0 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center my-3 cursor-pointer hover:opacity-90 transition-opacity shadow-inner relative group"
                        title="Bấm để chọn ảnh đại diện"
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="evnNTv flex items-center justify-center">
                            {/* Shopee icon headshot SVG chuẩn */}
                            <svg
                              enableBackground="new 0 0 15 15"
                              viewBox="0 0 15 15"
                              x="0"
                              y="0"
                              className="shopee-svg-icon QMPvKB icon-headshot w-12 h-12 text-slate-300 stroke-[#c6c6c6] fill-none stroke-[1.2]"
                            >
                              <g>
                                <circle cx="7.5" cy="4.5" r="2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
                                <path d="m1.5 14.2c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" />
                              </g>
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Camera size={20} />
                        </div>
                      </div>

                      {/* Input file ẩn */}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleAvatarSelect}
                        className="wPg0yr hidden"
                      />

                      {/* Nút Chọn ảnh */}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="btn btn-light btn--m btn--inline px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Chọn ảnh
                      </button>

                      {/* Chú thích giới hạn kích thước và định dạng */}
                      <div className="rEBE_2 text-slate-400 text-xs mt-3.5 space-y-1 text-center leading-relaxed font-normal">
                        <div>Dụng lượng file tối đa 1 MB</div>
                        <div>Định dạng:.JPEG, .PNG</div>
                      </div>

                      {/* Hiển thị lỗi nếu có */}
                      {avatarError && (
                        <p className="text-rose-500 text-xs mt-2.5 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                          {avatarError}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── MODAL THÊM / CẬP NHẬT ĐỊA CHỈ (SHOPEE STYLE) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingAddress ? 'Cập Nhật Địa Chỉ' : 'Địa Chỉ Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={modalForm.fullName}
                    onChange={(e) => setModalForm({ ...modalForm, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      modalErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'
                    }`}
                  />
                  {modalErrors.fullName && <p className="text-rose-500 text-[11px] mt-1">{modalErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0359490221"
                    value={modalForm.phone}
                    onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                      modalErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'
                    }`}
                  />
                  {modalErrors.phone && <p className="text-rose-500 text-[11px] mt-1">{modalErrors.phone}</p>}
                </div>
              </div>

              {/* Tỉnh / Quận / Phường */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tỉnh / TP <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={modalForm.province}
                    onChange={(e) => setModalForm({ ...modalForm, province: e.target.value })}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Khác">Tỉnh khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Tân Phú"
                    value={modalForm.district}
                    onChange={(e) => setModalForm({ ...modalForm, district: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phường / Xã
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Tây Thạnh"
                    value={modalForm.ward}
                    onChange={(e) => setModalForm({ ...modalForm, ward: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Địa chỉ chi tiết */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Số 140 Lê Trọng Tấn"
                  value={modalForm.address}
                  onChange={(e) => setModalForm({ ...modalForm, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none ${
                    modalErrors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-rose-500'
                  }`}
                />
                {modalErrors.address && <p className="text-rose-500 text-[11px] mt-1">{modalErrors.address}</p>}
              </div>

              {/* Loại địa chỉ: Nhà riêng / Văn phòng */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Loại địa chỉ
                </label>
                <div className="flex gap-4">
                  {(['Nhà riêng', 'Văn phòng'] as const).map(l => (
                    <label key={l} className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addressLabel"
                        checked={modalForm.label === l}
                        onChange={() => setModalForm({ ...modalForm, label: l })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkbox Đặt làm mặc định */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={modalForm.isDefault}
                    onChange={(e) => setModalForm({ ...modalForm, isDefault: e.target.checked })}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>

              {/* Nút hành động */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                >
                  Trở Lại
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                >
                  Hoàn Thành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}