import {Link} from 'react-router-dom';
//import data
import categoriesData from '../../data/categories.json';
import brandsData from '../../data/brands.json';
// Hàm helper để tạo URL ảnh từ Cloudinary
// Khai báo kiểu string cho tham số path
const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/hb22fnuq/image/upload';
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${CLOUDINARY_BASE_URL}/${path}`;
};

export default function FeaturedCategoriesAndBrand(){
    return(
        
        <>
        {/* Danh muc noi bat cua categories */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <span className="text-rose-500">✿</span> DANH MỤC NỔI BẬT
          </h2>
          <Link to="/products" className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">Xem tất cả »</Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {categoriesData.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?cat=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2.5 group py-3 px-1 rounded-2xl hover:bg-rose-50/50 transition-colors"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-rose-200 group-hover:shadow-md transition-all">
                <img
                  src={getImageUrl(cat.banner)}
                  alt={cat.name}
                  className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-semibold text-center text-gray-800 group-hover:text-rose-600 transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Danh muc noi bat cua brand */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800 flex items-center gap-2">
            <span className="text-orange-500">⊞</span> THƯƠNG HIỆU NỔI BẬT
          </h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">Xem tất cả »</Link>
        </div>

        <div className="flex gap-3 border border-pink-100 rounded-2xl overflow-hidden p-3 bg-white">
          {/* Card banner bên trái */}
          <div className="hidden md:flex w-44 flex-shrink-0 flex-col justify-between bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-3 border border-pink-100">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cam kết hàng chính hãng</p>
              <p className="text-sm font-bold text-gray-800 leading-tight">Thương hiệu mỹ phẩm uy tín toàn cầu</p>
            </div>
            <div className="grid grid-cols-3 gap-1 my-3">
              {brandsData.slice(0, 9).map(b => (
                <div key={b.id} className="bg-white rounded p-1 flex items-center justify-center h-8">
                  <img src={getImageUrl(b.logo)} alt={b.name} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
            <p className="text-xs text-rose-600 font-semibold text-center">BASE MAKE UP</p>
          </div>

          {/* Grid brand logos bên phải */}
          <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {brandsData.map((brand) => (
              <Link
                key={brand.id}
                to={`/products`}
                className="flex flex-col items-center justify-center bg-white hover:bg-rose-50 hover:shadow-md hover:shadow-pink-100 border border-pink-100 rounded-xl p-2 aspect-square group transition-all duration-200"
                title={brand.name}
              >
                <img
                  src={getImageUrl(brand.logo)}
                  alt={brand.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
        </>
    )
}