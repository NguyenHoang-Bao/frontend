import { BsGeoAlt, BsTelephone, BsEnvelope, BsClock, BsGlobe, BsFacebook, BsInstagram, BsTiktok } from 'react-icons/bs';

export default function ContactInfo() {
  return (
    <div className="lg:w-5/12">
      <h3 className="text-2xl font-bold mb-8 text-gray-900 uppercase">
        Thông tin liên hệ
      </h3>

      <div className="flex items-start mb-6">
        <BsGeoAlt className="text-3xl md:text-4xl mr-5 text-pink-500 shrink-0" />
        <div>
          <h5 className="font-semibold text-lg text-gray-900 mb-1">Địa chỉ cửa hàng</h5>
          <p className="text-gray-600 mb-0 leading-relaxed">
            140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM
          </p>
        </div>
      </div>

      <div className="flex items-start mb-6">
        <BsTelephone className="text-3xl md:text-4xl mr-5 text-pink-500 shrink-0" />
        <div>
          <h5 className="font-semibold text-lg text-gray-900 mb-1">Hotline & Zalo</h5>
          <p className="text-gray-600 mb-0 font-medium">
            <a href="tel:0359490221" className="hover:text-pink-600 transition-colors">
              0359 490 221
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-start mb-6">
        <BsEnvelope className="text-3xl md:text-4xl mr-5 text-pink-500 shrink-0" />
        <div>
          <h5 className="font-semibold text-lg text-gray-900 mb-1">Email</h5>
          <p className="text-gray-600 mb-0">
            <a href="mailto:hbao4142@gmail.com" className="hover:text-pink-600 transition-colors">
              hbao4142@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-start mb-6">
        <BsClock className="text-3xl md:text-4xl mr-5 text-pink-500 shrink-0" />
        <div>
          <h5 className="font-semibold text-lg text-gray-900 mb-1">Giờ mở cửa</h5>
          <p className="text-gray-600 mb-0">Thứ 2 - Chủ Nhật: 9:00 - 22:00</p>
        </div>
      </div>

      <div className="flex items-start mb-6">
        <BsGlobe className="text-3xl md:text-4xl mr-5 text-pink-500 shrink-0" />
        <div>
          <h5 className="font-semibold text-lg text-gray-900 mb-4">Mạng Xã Hội</h5>
          <div className="flex gap-2.5">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:border-pink-500 hover:bg-pink-500 hover:text-white rounded-md flex items-center justify-center w-9 h-9 transition-colors shadow-sm bg-white" title="Facebook">
              <BsFacebook className="text-base" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:border-pink-500 hover:bg-pink-500 hover:text-white rounded-md flex items-center justify-center w-9 h-9 transition-colors shadow-sm bg-white" title="Instagram">
              <BsInstagram className="text-base" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="border border-gray-300 text-gray-700 hover:border-pink-500 hover:bg-pink-500 hover:text-white rounded-md flex items-center justify-center w-9 h-9 transition-colors shadow-sm bg-white" title="TikTok">
              <BsTiktok className="text-base" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}