import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsTelephone } from 'react-icons/bs';

// Import các Component và Pages
import Navbar from './components/Navbar/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer/Footer';
import CartPanel from './components/CartPanel';
import Contact from './pages/Contact';
import SkinQuiz from './pages/SkinQuiz';
import About from './pages/About';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Sale from './pages/Sale';
import Admin from './pages/Admin';
import OrderTracking from './pages/OrderTracking';
import Checkout from './pages/Checkout';

function AppContent() {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authRoutes.includes(location.pathname.toLowerCase().replace(/\/$/, '')) || authRoutes.includes(location.pathname);
  const isAdminPage = location.pathname.toLowerCase().startsWith('/admin');

  // Khóa thanh cuộn trang khi ở các trang xác thực (login, register, forgot-password)
  useEffect(() => {
    if (isAuthPage) {
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
  }, [isAuthPage]);

  // Nếu là trang Admin, render layout riêng biệt toàn màn hình
  if (isAdminPage) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#ecf0f5] font-sans">
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isAuthPage ? 'h-screen overflow-hidden bg-white' : 'min-h-screen bg-black'}`}>
      {/* Navbar luôn hiển thị ở trên cùng (ngoại trừ trang auth) */}
      {!isAuthPage && <Navbar />}
      
      {/* Cart Panel sẽ được render ở đây */}
      {!isAuthPage && <CartPanel />}

      {/* Nơi chứa ruột của trang (sẽ thay đổi tùy theo link) */}
      <main className={`flex-grow ${isAuthPage ? 'h-full overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sale" element={<Sale />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/skin-quiz" element={<SkinQuiz />} />
          <Route path="/quiz" element={<SkinQuiz />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/tracking" element={<OrderTracking />} />
        </Routes>
      </main>

      {/* Footer luôn hiển thị ở dưới cùng (ngoại trừ trang auth) */}
      {!isAuthPage && <Footer />}

      {/* Floating Contact Icons (ẩn ở trang auth để tập trung vào form và banner) */}
      {!isAuthPage && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          <a
            href="tel:0359490221"
            className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
            aria-label="Call us"
          >
            <BsTelephone size={18} />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
            aria-label="Facebook"
          >
            <BsFacebook size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            aria-label="Instagram"
          >
            <BsInstagram size={18} />
          </a>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* Component này sẽ tự động cuộn lên đầu trang khi chuyển route */}
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;