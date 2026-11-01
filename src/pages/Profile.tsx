import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  UserCircle, 
  LogOut, 
  MapPin, 
  ShoppingBag, 
  Lock, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ChevronRight, 
  AlertCircle,
  X,
  ExternalLink,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { addressService, UserAddress } from '../services/addressService';
import { useCustomerProfile } from '../hooks/useCustomerProfile';

type ProfileTab = 'profile' | 'password' | 'addresses' | 'orders';

export default function Profile() {
  const navigate = useNavigate();

  // Custom hook tách biệt business logic & kết nối Backend API
  const {
    profile,
    orders,
    isLoadingProfile,
    isLoadingOrders,
    isUpdatingProfile,
    isChangingPassword,
    profileError,
    passwordError,
    ordersError,
    profileSuccess,
    passwordSuccess,
    updateProfile,
    changePassword,
    reloadProfile,
    reloadOrders,
  } = useCustomerProfile();

  // Tab đang kích hoạt
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  // State sổ địa chỉ nhận hàng
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
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

  // State Form thông tin cá nhân
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    avatar: ''
  });
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // State Form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Đồng bộ form khi profile thay đổi từ backend
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        avatar: profile.avatar || ''
      });

      // Khởi tạo sổ địa chỉ mẫu nếu chưa có
      const addrs = addressService.initSampleAddressesIfEmpty(profile);
      setAddresses(addrs);
    }
  }, [profile]);

  // Kiểm tra đăng nhập
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('currentUser');
  if (!token && !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản không?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    }
  };

  // ── XỬ LÝ UPLOAD ẢNH ĐẠI DIỆN ──
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Kiểm tra định dạng ảnh
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validExtensions.includes(file.type)) {
      setAvatarError('Định dạng tệp không hợp lệ! Vui lòng chọn ảnh .JPG, .PNG hoặc .WEBP');
      return;
    }

    // 2. Giới hạn dung lượng tối đa 1.5 MB
    if (file.size > 1.5 * 1024 * 1024) {
      setAvatarError('Dung lượng ảnh vượt quá 1.5 MB! Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      setProfileForm(prev => ({ ...prev, avatar: base64Url }));

      // Cập nhật ngay lên backend nếu muốn đồng bộ tức thì
      if (profile) {
        await updateProfile({
          fullName: profileForm.fullName || profile.fullName,
          phoneNumber: profileForm.phoneNumber || profile.phoneNumber,
          email: profileForm.email || profile.email,
          avatar: base64Url
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ── LƯU THÔNG TIN HỒ SƠ ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      alert('Vui lòng nhập họ và tên!');
      return;
    }

    await updateProfile({
      fullName: profileForm.fullName.trim(),
      phoneNumber: profileForm.phoneNumber.trim() || undefined,
      email: profileForm.email.trim() || undefined,
      avatar: profileForm.avatar || undefined
    });
  };

  // ── ĐỔI MẬT KHẨU ──
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.oldPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    const success = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    });

    if (success) {
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  // ── QUẢN LÝ SỔ ĐỊA CHỈ ──
  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setModalForm({
      fullName: profile?.fullName || '',
      phone: profile?.phoneNumber || '',
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
      addressService.updateAddress(profile, updated);
    } else {
      addressService.addAddress(profile, {
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

    setAddresses(addressService.getAddresses(profile));
    setIsModalOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      alert('Bạn phải giữ lại ít nhất 1 địa chỉ nhận hàng!');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
      addressService.deleteAddress(profile, id);
      setAddresses(addressService.getAddresses(profile));
    }
  };

  const handleSetDefault = (id: string) => {
    addressService.setDefault(profile, id);
    setAddresses(addressService.getAddresses(profile));
  };

  // Helper format ngày & trạng thái
  const formatOrderStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'WAITING':
        return { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'PROCESSING':
      case 'CONFIRMED':
        return { label: 'Đang chuẩn bị hàng', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'SHIPPING':
      case 'DELIVERING':
        return { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'COMPLETED':
      case 'DELIVERED':
        return { label: 'Giao thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: status || 'Đang xử lý', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 pt-6 sm:pt-8 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={12} />
          <span className="text-slate-700 font-semibold">Tài khoản của tôi</span>
        </div>

        {/* Bố cục chính: Cột trái (Sidebar User) + Cột phải (Nội dung) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ═══════════════════════════════════════════════════ */}
          {/* CỘT TRÁI: THÔNG TIN USER & MENU TABS                */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center flex flex-col items-center">
              
              {/* Avatar + Nút Camera Quick Click */}
              <div className="relative group mb-3">
                {profileForm.avatar || profile?.avatar ? (
                  <img
                    src={profileForm.avatar || profile?.avatar}
                    alt={profile?.fullName || 'HB'}
                    className="w-20 h-20 rounded-full object-cover border-2 border-rose-300 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {(profile?.fullName || 'HB').charAt(0).toUpperCase()}
                  </div>
                )}
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

              {/* Tên & Thông tin liên hệ */}
              <h3 className="font-black text-lg text-slate-900 tracking-tight">
                {profile?.fullName || 'Khách Hàng Hoàng Bảo'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile?.phoneNumber || profile?.email || profile?.username}
              </p>
              
              {/* Badge Hội Viên & Điểm Tích Lũy */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <Sparkles size={13} />
                <span>
                  Hội Viên {(profile?.loyaltyPoints ?? 0) >= 1000 ? 'Kim Cương' : (profile?.loyaltyPoints ?? 0) >= 500 ? 'Vàng' : 'Bạc'} ({profile?.loyaltyPoints ?? 0} điểm)
                </span>
              </div>

              {/* Danh sách Menu Tabs */}
              <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-1.5 text-left text-xs font-bold">
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
                  onClick={() => setActiveTab('password')}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                    activeTab === 'password'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Lock size={18} />
                  <span>Đổi Mật Khẩu</span>
                </button>

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
                  {orders.length > 0 && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === 'orders' ? 'bg-white text-rose-600' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {orders.length}
                    </span>
                  )}
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

            {/* Quick Banner chuyển sang thanh toán giỏ hàng */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-3xl border border-rose-100 text-center">
              <p className="text-xs text-rose-900 font-bold">Cần thanh toán các món đã chọn trong giỏ?</p>
              <Link
                to="/checkout"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Đến Trang Thanh Toán</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* CỘT PHẢI: NỘI DUNG TỪNG TAB                         */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="lg:col-span-8">
            
            {/* ─────────────────────────────────────────────────── */}
            {/* TAB 1: HỒ SƠ CỦA TÔI (API BACKEND + SHOPEE STYLE)    */}
            {/* ─────────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Hồ Sơ Của Tôi</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Quản lý và đồng bộ thông tin hồ sơ tài khoản</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => reloadProfile()}
                    disabled={isLoadingProfile}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Làm mới từ máy chủ"
                  >
                    <RefreshCw size={16} className={isLoadingProfile ? 'animate-spin text-rose-500' : ''} />
                  </button>
                </div>

                {/* Feedback Thành Công / Lỗi */}
                {profileSuccess && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <Check size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-8 lg:gap-12 pt-2">
                  
                  {/* Cột trái: Form thông tin cá nhân */}
                  <form onSubmit={handleSaveProfile} className="flex-1 space-y-4 sm:space-y-5 w-full">
                    
                    {/* Tên đăng nhập (Read-only) */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-500 sm:text-right">
                        Tên đăng nhập
                      </label>
                      <div className="sm:col-span-3 text-sm text-slate-900 font-bold">
                        {profile?.username || 'Chưa cập nhật'}
                      </div>
                    </div>

                    {/* Phương thức đăng nhập */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-500 sm:text-right">
                        Đăng nhập qua
                      </label>
                      <div className="sm:col-span-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {profile?.authProvider || 'LOCAL'}
                        </span>
                      </div>
                    </div>

                    {/* Họ và tên */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-semibold transition-all"
                          placeholder="Họ và tên của bạn"
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
                          placeholder="Nhập địa chỉ email"
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
                          value={profileForm.phoneNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all"
                          placeholder="Nhập số điện thoại (10 chữ số)"
                        />
                      </div>
                    </div>

                    {/* Nút submit */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 pt-3">
                      <div className="hidden sm:block" />
                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                          {isUpdatingProfile ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Đang Lưu...</span>
                            </>
                          ) : (
                            <span>Lưu Thay Đổi</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Vách ngăn */}
                  <div className="hidden md:block w-px bg-slate-200/80 self-stretch my-2" />

                  {/* Cột phải: Khung ảnh đại diện Shopee style */}
                  <div className="w-full md:w-72 flex flex-col items-center justify-center text-center shrink-0">
                    <div
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 border-2 border-rose-200 flex items-center justify-center my-3 cursor-pointer hover:opacity-90 transition-opacity shadow-inner relative group"
                      title="Bấm để chọn ảnh đại diện mới"
                    >
                      {profileForm.avatar || profile?.avatar ? (
                        <img
                          src={profileForm.avatar || profile?.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <UserCircle size={56} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera size={22} />
                      </div>
                    </div>

                    {/* Input file ẩn */}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />

                    {/* Nút Chọn ảnh */}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Chọn ảnh
                    </button>

                    <div className="text-slate-400 text-[11px] mt-3 space-y-1 text-center leading-relaxed">
                      <div>Dung lượng tối đa 1.5 MB</div>
                      <div>Định dạng: .JPEG, .PNG, .WEBP</div>
                    </div>

                    {avatarError && (
                      <p className="text-rose-500 text-xs mt-2 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                        {avatarError}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* TAB 2: ĐỔI MẬT KHẨU (BẢO MẬT TÀI KHOẢN)             */}
            {/* ─────────────────────────────────────────────────── */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="pb-5 mb-6 border-b border-slate-100">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Đổi Mật Khẩu</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                    <Check size={16} />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                {profile?.authProvider && profile.authProvider !== 'LOCAL' ? (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed space-y-2">
                    <p className="font-bold">Tài khoản này được đăng nhập thông qua {profile.authProvider}.</p>
                    <p className="text-amber-700">
                      Bạn không cần thiết lập mật khẩu hệ thống vì quá trình xác thực được quản lý trực tiếp bởi nhà cung cấp tài khoản của bạn.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5 max-w-xl">
                    {/* Mật khẩu cũ */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Mật khẩu cũ <span className="text-rose-500">*</span>
                      </label>
                      <div className="sm:col-span-3 relative">
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all pr-10"
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Mật khẩu mới <span className="text-rose-500">*</span>
                      </label>
                      <div className="sm:col-span-3 relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all pr-10"
                          placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Xác nhận mật khẩu mới */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <label className="text-xs font-bold text-slate-700 sm:text-right">
                        Xác nhận lại <span className="text-rose-500">*</span>
                      </label>
                      <div className="sm:col-span-3 relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-all pr-10"
                          placeholder="Nhập lại mật khẩu mới"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Nút Cập Nhật */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 pt-3">
                      <div className="hidden sm:block" />
                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>Đang Cập Nhật...</span>
                            </>
                          ) : (
                            <span>Cập Nhật Mật Khẩu</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* TAB 3: SỔ ĐỊA CHỈ NHẬN HÀNG (SHOPEE STYLE)           */}
            {/* ─────────────────────────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Địa Chỉ Của Tôi</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quản lý địa chỉ giao hàng để đặt mua mỹ phẩm nhanh chóng và tiện lợi
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

                {addresses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MapPin size={40} className="mx-auto mb-3 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-semibold">Bạn chưa lưu địa chỉ nào.</p>
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-4 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
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

                            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                              {fullAddr}
                            </p>
                          </div>

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

            {/* ─────────────────────────────────────────────────── */}
            {/* TAB 4: ĐƠN MUA / LỊCH SỬ ĐƠN HÀNG (API REAL DATA)   */}
            {/* ─────────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Lịch Sử Mua Hàng</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Quản lý và tra cứu tiến độ tất cả đơn hàng của bạn</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => reloadOrders()}
                      disabled={isLoadingOrders}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Làm mới đơn hàng"
                    >
                      <RefreshCw size={16} className={isLoadingOrders ? 'animate-spin text-rose-500' : ''} />
                    </button>
                    <Link
                      to="/order-tracking"
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <span>Tra cứu mã đơn</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>

                {ordersError && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    {ordersError}
                  </div>
                )}

                {isLoadingOrders ? (
                  <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-rose-500 mb-3" />
                    <p className="text-xs font-medium">Đang tải lịch sử đơn hàng...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingBag size={40} className="mx-auto mb-3 stroke-[1.5] text-slate-300" />
                    <p className="text-sm font-semibold">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/products" className="mt-4 inline-block text-xs font-bold text-rose-600 hover:underline">
                      Khám phá sản phẩm và mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord, idx) => {
                      const statusBadge = formatOrderStatus(ord.status);
                      const orderCode = ord.orderCode || `ORD-${ord.idOrder || idx}`;
                      const orderDate = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Vừa xong';
                      const finalTotal = ord.totalAmount ?? ord.total ?? 0;

                      return (
                        <div key={ord.idOrder || idx} className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900">#{orderCode}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{orderDate}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>

                          {/* Danh sách món */}
                          <div className="py-3 space-y-2">
                            {(ord.items || []).slice(0, 3).map((item, iIdx) => (
                              <div key={iIdx} className="flex items-center justify-between text-xs">
                                <span className="text-slate-800 line-clamp-1 max-w-sm">
                                  • {item.productName} (x{item.quantity})
                                </span>
                                <span className="font-bold text-slate-700">
                                  {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            ))}
                            {(ord.items || []).length > 3 && (
                              <p className="text-[11px] text-slate-400 italic">
                                + và {(ord.items || []).length - 3} sản phẩm khác trong đơn
                              </p>
                            )}
                          </div>

                          {/* Tổng tiền & Nút tra cứu */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-500">Tổng thanh toán: </span>
                              <span className="text-sm font-black text-rose-600">
                                {finalTotal.toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                            <Link
                              to={`/order-tracking?code=${encodeURIComponent(orderCode)}`}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>Chi tiết đơn</span>
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                        className="text-rose-600 focus:ring-rose-500 cursor-pointer"
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
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Trở Lại
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
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
