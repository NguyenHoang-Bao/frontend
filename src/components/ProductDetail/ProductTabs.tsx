import { useState } from 'react';
import { BsPatchCheck, BsStars, BsCheckCircleFill } from 'react-icons/bs';
import { Product } from '../../pages/ProductDetail';
import WarrantyPolicy from '../Policy/WarrantyPolicy';
import ReturnPolicy from '../Policy/ReturnPolicy';
import ShippingPolicy from '../Policy/ShippingPolicy';

export default function ProductTabs({ product }: { product: Product }) {
  const [activeInfoTab, setActiveInfoTab] = useState<'benefits' | 'ingredients' | 'usage' | 'policy'>('benefits');

  const tabClass = (tab: string) => `px-4 sm:px-6 py-3 font-bold uppercase tracking-wider text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
    activeInfoTab === tab ? 'border-rose-500 text-rose-600 bg-rose-50/40 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-900'
  }`;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 gap-2 sm:gap-4">
        <button onClick={() => setActiveInfoTab('benefits')} className={tabClass('benefits')}>Công dụng nổi bật</button>
        <button onClick={() => setActiveInfoTab('ingredients')} className={tabClass('ingredients')}>Thành phần chính</button>
        <button onClick={() => setActiveInfoTab('usage')} className={tabClass('usage')}>Hướng dẫn sử dụng</button>
        <button onClick={() => setActiveInfoTab('policy')} className={tabClass('policy')}>Chính sách & Bảo hành</button>
      </div>

      <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed">
        {activeInfoTab === 'benefits' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><BsPatchCheck className="text-rose-500" /> Mô tả sản phẩm</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/60 p-5 rounded-xl border border-gray-200">
                {product.description || 'Thông tin mô tả sản phẩm đang được cập nhật.'}
              </p>
            </div>
            {product.benefits && product.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><BsStars className="text-rose-500" /> Hiệu quả & Lợi ích</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
                      <BsCheckCircleFill className="text-rose-500 mt-1 shrink-0" size={16} />
                      <span className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeInfoTab === 'ingredients' && (
           <div className="space-y-6">
             <div>
               <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><BsStars className="text-rose-500" /> Thành phần hoạt chất nổi bật</h3>
               {product.keyIngredients && product.keyIngredients.length > 0 ? (
                 <div className="flex flex-wrap gap-2.5">
                   {product.keyIngredients.map((ingredient, idx) => (
                     <span key={idx} className="px-4 py-2 bg-pink-50 border border-pink-200 text-rose-700 text-xs sm:text-sm rounded-xl font-medium shadow-2xs">
                       ✦ {ingredient}
                     </span>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-gray-500 italic">Thành phần chi tiết đang được cập nhật.</p>
               )}
             </div>
           </div>
        )}

        {activeInfoTab === 'usage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><BsCheckCircleFill className="text-rose-500" /> Cách dùng chi tiết</h3>
              <div className="bg-rose-50/40 p-5 rounded-xl border border-rose-200/80 text-sm sm:text-base text-gray-800 leading-relaxed">
                {product.usage || 'Lấy một lượng vừa đủ sản phẩm, thoa đều lên da và mát-xa nhẹ nhàng.'}
              </div>
            </div>
          </div>
        )}

        {activeInfoTab === 'policy' && (
          <div className="space-y-6">
            <WarrantyPolicy />
            <ReturnPolicy />
            <ShippingPolicy />
          </div>
        )}
      </div>
    </div>
  );
}