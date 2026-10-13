import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BsFacebook, 
  BsInstagram, 
  BsYoutube, 
  BsTiktok,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt
} from 'react-icons/bs';
import logo from '../../assets/img/Navbar/logo.png'; 

// Import các component con vừa tách
import PaymentMethods from './PaymentMethods';
import FooterModals, { ModalType } from './FooterModals';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  return (
    <>
      <footer className="bg-pink-50 text-gray-800 border-t border-pink-200">
        <div className="container mx-auto px-6 py-10 lg:py-14">

          {/* MAIN SECTION: 5 Cột thông tin */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            
            {/* Cột 1: Logo */}
            <div className="lg:col-span-2 flex justify-center lg:justify-start items-start">
              <Link to="/">
                <img src={logo} alt="Hoàng Bảo Cosmetics" className="w-32 h-auto object-contain" />
              </Link>
            </div>

            {/* Cột 2: Danh sách chi nhánh & Mạng xã hội */}
            <div className="lg:col-span-3">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-4">HOÀNG BẢO COSMETICS</h5>
              <div className="space-y-4 text-sm text-gray-600 mb-6">
                <p className="flex items-start gap-2">
                  <BsGeoAlt className="text-pink-500 mt-1 flex-shrink-0" />
                  <span>Chi nhánh Tân Phú: 140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.Hồ Chí Minh</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-pink-500">
                <a href="#" className="hover:text-pink-700 transition-colors bg-white p-2 rounded-md border border-gray-200 shadow-sm"><BsFacebook size={16} /></a>
                <a href="#" className="hover:text-pink-700 transition-colors bg-white p-2 rounded-md border border-gray-200 shadow-sm"><BsInstagram size={16} /></a>
                <a href="#" className="hover:text-pink-700 transition-colors bg-white p-2 rounded-md border border-gray-200 shadow-sm"><BsTiktok size={16} /></a>
                <a href="#" className="hover:text-pink-700 transition-colors bg-white p-2 rounded-md border border-gray-200 shadow-sm"><BsYoutube size={16} /></a>
              </div>
            </div>

            {/* Cột 3: Chăm sóc khách hàng */}
            <div className="lg:col-span-2">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-4">Chăm sóc khách hàng</h5>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><button onClick={() => openModal('return')} className="hover:text-pink-600 transition-colors text-left">Chính sách đổi trả</button></li>
                <li><button onClick={() => openModal('warranty')} className="hover:text-pink-600 transition-colors text-left">Chính sách bảo hành</button></li>
                <li><button onClick={() => openModal('privacy')} className="hover:text-pink-600 transition-colors text-left">Chính sách bảo mật</button></li>
                <li><button onClick={() => openModal('shipping')} className="hover:text-pink-600 transition-colors text-left">Chính sách giao hàng</button></li>
                <li><Link to="/products" className="hover:text-pink-600 transition-colors text-left">Hướng dẫn mua hàng</Link></li>
              </ul>
            </div>

            {/* Cột 4: Giờ mở cửa & Góp ý */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Giờ mở cửa</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Từ 9:00 - 22:00 tất cả các ngày trong tuần (bao gồm cả các ngày lễ, ngày Tết).
                </p>
              </div>
              <div>
                <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-3">Góp ý - Khiếu nại</h5>
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <BsTelephone className="text-pink-500" />
                  <strong>0359 490 221</strong>
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <BsEnvelope className="text-pink-500" />
                  hbao4142@gmail.com
                </p>
                <Link to="/contact" className="text-pink-600 hover:text-pink-700 text-sm font-semibold flex items-center gap-1">
                  <BsGeoAlt /> HỆ THỐNG CỬA HÀNG
                </Link>
              </div>
            </div>

            {/* Cột 5: Về Hoàng Bảo Cosmetics */}
            <div className="lg:col-span-2">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider mb-4">Về Hoàng Bảo Cosmetics</h5>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to="/about" className="hover:text-pink-600 transition-colors">Giới thiệu</Link></li>
                <li><Link to="/contact" className="hover:text-pink-600 transition-colors">Liên hệ góp ý</Link></li>
                <li><Link to="/skin-quiz" className="hover:text-pink-600 transition-colors">Trắc nghiệm da & Routine</Link></li>
                <li><Link to="#" className="hover:text-pink-600 transition-colors">Tuyển dụng</Link></li>
              </ul>
            </div>

          </div>

          {/* BOTTOM SECTION: Company Info & Badges */}
          <div className="mt-12 pt-8 border-t border-pink-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-sm text-gray-600 max-w-2xl">
              <p className="font-bold text-gray-900 mb-1">Thiên đường Mỹ phẩm Chính hãng giá tốt. Với hơn 100+ Thương hiệu đồng hành. Là chuỗi cửa hàng uy tín hàng đầu của các bạn trẻ tại TP.HCM.</p>
              <p className="mb-1">Công ty TNHH Hoàng Bảo Cosmetics - Giấy phép kinh doanh số 0123456789, cấp ngày 01/01/2026 bởi Sở Kế Hoạch và Đầu Tư TP.HCM.</p>
              <p>© {new Date().getFullYear()} Hoàng Bảo Cosmetics. All rights reserved.</p>
            </div>
            
            <div className="flex flex-col items-start gap-4">
              <div>
                <span className="text-pink-600 hover:text-pink-700 text-sm font-semibold flex items-center gap-1">PHƯƠNG THỨC THANH TOÁN</span>
              </div>
              {/* Gọi component hiển thị phương thức thanh toán */}
              <PaymentMethods />
            </div>
          </div>

        </div>
      </footer>

      {/* Gọi component quản lý các Modal chính sách */}
      <FooterModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}