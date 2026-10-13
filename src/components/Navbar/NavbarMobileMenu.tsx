import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, User, LogOut, Shield, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/Navbar/logo.png';

interface NavbarMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  openDropdown: string | null;
  setOpenDropdown: (dropdown: string | null) => void;
  currentUser: { name: string; [key: string]: any } | null;
  handleLogout: () => void;
  isActive: (path: string) => boolean;
  navLinks: Array<{ to: string; label: string }>;
}

export default function NavbarMobileMenu({
  isOpen,
  onClose,
  openDropdown,
  setOpenDropdown,
  currentUser,
  handleLogout,
  isActive,
  navLinks
}: NavbarMobileMenuProps) {

  // Khóa cuộn trang nền khi mở menu trên mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const menuContent = (
    <div className="lg:hidden">
      {/* Backdrop mờ che toàn màn hình */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer menu trượt từ bên trái */}
      <div
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-[9999] overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header menu mobile */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white">
          <Link to="/" onClick={onClose} className="block">
            <img src={logo} alt="logo" className="w-28 h-auto object-contain brightness-0 invert" />
          </Link>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-1 pb-24">
          {navLinks.map((link, i) => {
            if (link.to === '/products') {
              const isProductsOpen = openDropdown === 'products';
              return (
                <div key={i} className="rounded-md overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/products"
                      onClick={onClose}
                      className={`flex-1 py-2.5 px-3.5 rounded-md text-sm font-semibold transition-colors ${
                        isActive('/products') ? 'bg-rose-50 text-rose-600 font-bold' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isProductsOpen ? null : 'products')}
                      className="p-2.5 text-gray-500 hover:text-rose-600 cursor-pointer"
                      aria-label="Mở danh mục sản phẩm"
                    >
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180 text-rose-600' : ''}`} />
                    </button>
                  </div>

                  {/* Danh mục con dạng Accordion */}
                  <div className={`overflow-hidden transition-all duration-300 ${isProductsOpen ? 'max-h-[800px] mb-2' : 'max-h-0'}`}>
                    <div className="pl-4 pr-2 py-2.5 space-y-3 bg-gray-50 rounded-lg text-xs mt-1 border border-gray-100">
                      {/* Nhóm 1: Chăm sóc da */}
                      <div>
                        <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wider block mb-1">
                          Chăm sóc da
                        </span>
                        <div className="space-y-1 pl-2.5 border-l border-gray-200">
                          <Link to="/products?cat=Chăm sóc da" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc da mặt
                          </Link>
                          <Link to="/products?cat=Chăm sóc da & Cơ thể" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc da & Cơ thể
                          </Link>
                          <Link to="/products?cat=Chăm sóc mắt" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc mắt
                          </Link>
                          <Link to="/products?cat=Chăm sóc môi" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc môi
                          </Link>
                        </div>
                      </div>

                      {/* Nhóm 2: Tóc & Cơ thể */}
                      <div>
                        <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wider block mb-1">
                          Tóc & Cơ thể
                        </span>
                        <div className="space-y-1 pl-2.5 border-l border-gray-200">
                          <Link to="/products?cat=Chăm sóc tóc" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc tóc
                          </Link>
                          <Link to="/products?cat=Chăm sóc cơ thể" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Chăm sóc cơ thể
                          </Link>
                          <Link to="/products?cat=Chăm sóc cá nhân & Trẻ em" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Cá nhân & Trẻ em
                          </Link>
                        </div>
                      </div>

                      {/* Nhóm 3: Trang điểm & Mùi hương */}
                      <div>
                        <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wider block mb-1">
                          Trang điểm & Mùi hương
                        </span>
                        <div className="space-y-1 pl-2.5 border-l border-gray-200">
                          <Link to="/products?cat=Trang điểm" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Trang điểm
                          </Link>
                          <Link to="/products?cat=Nước hoa" onClick={onClose} className="block py-1 text-gray-600 hover:text-rose-600">
                            Nước hoa
                          </Link>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <Link to="/products" onClick={onClose} className="block font-semibold text-rose-600 hover:underline">
                          Xem tất cả sản phẩm →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link 
                key={i} 
                to={link.to}
                onClick={onClose}
                className={`flex items-center py-2.5 px-3.5 rounded-md text-sm font-semibold transition-colors ${
                  isActive(link.to) ? 'bg-rose-50 text-rose-600 font-bold' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link 
            to="/sale" 
            onClick={onClose} 
            className="flex items-center py-2.5 px-3.5 rounded-md text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            ĐANG SALE
          </Link>

          {/* Tài khoản Mobile */}
          <div className="border-t border-gray-100 pt-4 mt-3">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 py-2.5 px-3.5 bg-rose-50/70 border border-rose-100 rounded-md mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 overflow-hidden shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Xin chào,</p>
                    <p className="font-bold text-gray-800 text-sm">{currentUser.name}</p>
                  </div>
                </div>
                {currentUser.role === 'ADMIN' && (
                  <Link to="/admin" onClick={onClose} className="flex items-center gap-2 py-2 px-3.5 rounded-md text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 transition-colors text-sm mb-1.5">
                    <Shield size={16} /> Trang Quản Trị (Admin)
                  </Link>
                )}
                <Link to="/profile" onClick={onClose} className="flex items-center py-2.5 px-3.5 rounded-md text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm">
                  Tài khoản của tôi
                </Link>
                <button 
                  onClick={() => { handleLogout(); onClose(); }} 
                  className="w-full text-left flex items-center gap-2.5 py-2.5 px-3.5 text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm cursor-pointer"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1">
                <Link to="/login" onClick={onClose} className="text-center py-2.5 rounded-md border border-rose-300 text-rose-600 font-semibold hover:bg-rose-50 transition-colors text-sm">
                  ĐĂNG NHẬP
                </Link>
                <Link to="/register" onClick={onClose} className="text-center py-2.5 rounded-md bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors text-sm shadow-xs">
                  ĐĂNG KÝ
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}