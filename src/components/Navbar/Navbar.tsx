import { useState, useEffect, useContext } from "react";
import {
  Menu,
  Search,
  User,
  ShoppingBag,
  Heart,
  X,
  ChevronDown,
  LogOut,
  ChevronRight,
  Shield,
  Store,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import logo from "../../assets/img/Navbar/logo.png";
import NavbarMobileMenu from "./NavbarMobileMenu";

interface CartItem {
  quantity: number;
  [key: string]: any;
}
interface UserData {
  name: string;
  [key: string]: any;
}
interface CartContextType {
  cart: CartItem[];
  openCart: () => void;
  [key: string]: any;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { cart, openCart } = useContext(CartContext) as CartContextType;
  const totalItemsInCart = cart.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0,
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncUser = () => {
      try {
        const u = localStorage.getItem("currentUser");
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    return () => window.removeEventListener("storage", syncUser);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: "/", label: "TRANG CHỦ" },
    { to: "/products", label: "DANH MỤC SẢN PHẨM" },
    { to: "/skin-quiz", label: "CHẨN ĐOÁN DA (QUIZ)" },
    { to: "/order-tracking", label: "TRA CỨU ĐƠN HÀNG" },
    { to: "/contact", label: "LIÊN HỆ" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md shadow-rose-50"
          : "bg-white shadow-sm shadow-gray-100"
      }`}
    >
      {/* ── MAIN HEADER ── */}
      <div className="border-b border-pink-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 gap-4 md:gap-6">
            {/* Hamburger (mobile) */}
            <button
              className="lg:hidden text-rose-400 hover:text-rose-600 transition-colors p-1"
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                if (isMobileMenuOpen) setOpenDropdown(null);
              }}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src={logo}
                alt="logo"
                className="w-28 md:w-36 h-auto object-contain"
              />
            </Link>

            {/* Search (desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-lg relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                className="w-full border border-gray-300 bg-white rounded-md py-2 pl-4 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-rose-500 hover:bg-rose-600 text-white rounded-md w-8 h-8 flex items-center justify-center transition-colors shadow-sm"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Icons & Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Tài khoản (Desktop) */}
              {currentUser ? (
                <div className="relative group hidden lg:block z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-rose-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 overflow-hidden shrink-0">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="truncate max-w-[100px] hidden xl:block">
                      {currentUser.name}
                    </span>
                  </Link>
                  <div className="absolute hidden group-hover:block top-full right-0 pt-2 w-48 z-50">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                      <div className="px-4 py-3 bg-rose-50/50 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Xin chào,</p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {currentUser.name}
                        </p>
                      </div>
                      <ul className="p-1.5 space-y-0.5 text-sm">
                        {currentUser.role === "ADMIN" && (
                          <li className="border-b border-gray-100 pb-1">
                            <Link
                              to="/admin"
                              className="block px-3 py-2 text-rose-600 font-semibold hover:bg-rose-50 rounded-md transition-colors flex items-center gap-2"
                            >
                              <Shield size={14} /> Trang Quản Trị (Admin)
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link
                            to="/profile"
                            className="block px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
                          >
                            Tài khoản của tôi
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/order-tracking"
                            className="block px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
                          >
                            Đơn mua
                          </Link>
                        </li>
                        <li className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                          >
                            <LogOut size={14} /> Đăng xuất
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3 text-sm font-semibold">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-rose-600 transition-colors px-1"
                  >
                    ĐĂNG NHẬP
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/register"
                    className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors shadow-sm"
                  >
                    ĐĂNG KÝ
                  </Link>
                </div>
              )}

              {/* Wishlist */}
              <button
                className="text-rose-300 hover:text-rose-500 transition-colors p-1"
                aria-label="Wishlist"
              >
                <Heart size={22} />
              </button>

              {/* Giỏ hàng */}
              <button
                onClick={openCart}
                className="relative text-rose-400 hover:text-rose-600 transition-colors p-1"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={22} />
                {totalItemsInCart > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-400 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {totalItemsInCart}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search (mobile) */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full border border-gray-200 bg-white rounded-md py-2 pl-4 pr-10 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-pink-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-pink-500 text-white rounded-md w-7 h-7 flex items-center justify-center"
              >
                <Search size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── NAV LINKS DESKTOP ── */}
      <nav className="hidden lg:block bg-white border-b border-gray-100">
        <div className="container mx-auto px-8">
          <ul className="flex items-center justify-center gap-8 text-sm font-semibold text-gray-700">
            <li>
              <Link
                to="/"
                className={`block py-3.5 border-b-2 transition-colors ${isActive("/") ? "border-rose-500 text-rose-500" : "border-transparent text-gray-700 hover:text-rose-500"}`}
              >
                TRANG CHỦ
              </Link>
            </li>
            <li>
              <Link
                to="/sale"
                className={`block py-3.5 border-b-2 transition-colors text-rose-500 font-bold ${isActive("/sale") ? "border-rose-500" : "border-transparent hover:text-rose-600"}`}
              >
                ĐANG SALE
              </Link>
            </li>
            <li className="relative group py-3.5">
              <Link
                to="/products"
                className={`flex items-center gap-1 border-b-2 transition-colors ${
                  isActive("/products")
                    ? "border-rose-500 text-rose-500 font-bold"
                    : "border-transparent text-gray-700 hover:text-rose-500"
                }`}
              >
                <span>DANH MỤC SẢN PHẨM</span>
                <ChevronDown
                  size={14}
                  className="group-hover:rotate-180 transition-transform duration-150"
                />
              </Link>

              {/* Submenu cấp 1 dạng text tối giản */}
              <div className="absolute top-full left-0 w-60 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                {/* 1. Chăm sóc da */}
                <div className="relative group/sub">
                  <Link
                    to="/products?cat=Chăm sóc da"
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <span>Chăm sóc da</span>
                    <ChevronRight
                      size={14}
                      className="text-gray-400 group-hover/sub:text-rose-500"
                    />
                  </Link>

                  {/* Submenu cấp 2 */}
                  <div className="absolute top-0 left-full w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 ml-0.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150">
                    <Link
                      to="/products?cat=Chăm sóc da"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc da mặt
                    </Link>
                    <Link
                      to="/products?cat=Chăm sóc da & Cơ thể"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc da & Cơ thể
                    </Link>
                    <Link
                      to="/products?cat=Chăm sóc mắt"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc mắt
                    </Link>
                    <Link
                      to="/products?cat=Chăm sóc môi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc môi
                    </Link>
                  </div>
                </div>

                {/* 2. Tóc & Cơ thể */}
                <div className="relative group/sub">
                  <Link
                    to="/products?cat=Chăm sóc tóc"
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <span>Tóc & Cơ thể</span>
                    <ChevronRight
                      size={14}
                      className="text-gray-400 group-hover/sub:text-rose-500"
                    />
                  </Link>

                  {/* Submenu cấp 2 */}
                  <div className="absolute top-0 left-full w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 ml-0.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150">
                    <Link
                      to="/products?cat=Chăm sóc tóc"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc tóc
                    </Link>
                    <Link
                      to="/products?cat=Chăm sóc cơ thể"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Chăm sóc cơ thể
                    </Link>
                    <Link
                      to="/products?cat=Chăm sóc cá nhân & Trẻ em"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Cá nhân & Trẻ em
                    </Link>
                  </div>
                </div>

                {/* 3. Trang điểm & Mùi hương */}
                <div className="relative group/sub">
                  <Link
                    to="/products?cat=Trang điểm"
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <span>Trang điểm & Mùi hương</span>
                    <ChevronRight
                      size={14}
                      className="text-gray-400 group-hover/sub:text-rose-500"
                    />
                  </Link>

                  {/* Submenu cấp 2 */}
                  <div className="absolute top-0 left-full w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 ml-0.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-150">
                    <Link
                      to="/products?cat=Trang điểm"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Trang điểm
                    </Link>
                    <Link
                      to="/products?cat=Nước hoa"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Nước hoa
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-1"></div>

                <Link
                  to="/products"
                  className="block px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  Tất cả sản phẩm
                </Link>
              </div>
            </li>
            <li>
              <Link
                to="/skin-quiz"
                className={`block py-3.5 border-b-2 transition-colors ${isActive("/skin-quiz") ? "border-rose-500 text-rose-500 font-semibold" : "border-transparent text-gray-700 hover:text-rose-500"}`}
              >
                CHẨN ĐOÁN DA (QUIZ)
              </Link>
            </li>
            <li>
              <Link
                to="/order-tracking"
                className={`block py-3.5 border-b-2 transition-colors ${isActive("/order-tracking") ? "border-rose-500 text-rose-500 font-semibold" : "border-transparent text-gray-700 hover:text-rose-500"}`}
              >
                TRA CỨU ĐƠN HÀNG
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block py-3.5 border-b-2 border-transparent text-gray-700 hover:text-rose-500 transition-colors"
              >
                LIÊN HỆ
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── MOBILE MENU COMPONENT ── */}
      <NavbarMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        currentUser={currentUser}
        handleLogout={handleLogout}
        isActive={isActive}
        navLinks={navLinks}
      />
    </header>
  );
}
