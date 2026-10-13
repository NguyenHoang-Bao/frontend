import { useState, useCallback, ChangeEvent } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

type AccordionSection = 'csd' | 'toc' | 'trangdiem' | 'price';

interface ProductSidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  priceFilter: string;
  onPriceFilterChange: (price: string) => void;
}

export default function ProductSidebar({ 
  activeCategory, 
  onCategoryChange, 
  priceFilter, 
  onPriceFilterChange 
}: ProductSidebarProps) {
  // Đưa state quản lý đóng mở Accordion vào đây để không làm re-render toàn trang
  const [openAccordion, setOpenAccordion] = useState<Record<AccordionSection, boolean>>({
    csd: true,
    toc: false,
    trangdiem: false,
    price: true
  });

  const toggleAccordion = useCallback((section: AccordionSection) => {
    setOpenAccordion(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  return (
    <aside className="w-full lg:w-1/4 lg:sticky lg:top-[90px] self-start">
      <h5 className="font-bold uppercase mb-4 tracking-wide text-gray-900">DANH MỤC SẢN PHẨM</h5>
      
      <button 
        onClick={() => onCategoryChange('all')}
        className={`w-full text-left font-bold mb-4 py-2 border-b transition-colors cursor-pointer ${
          activeCategory === 'all' 
            ? 'text-rose-600 border-rose-600' 
            : 'text-gray-900 border-gray-200 hover:text-rose-600'
        }`}
      >
        TẤT CẢ SẢN PHẨM
      </button>

      <div className="mb-8 border border-gray-200 bg-white rounded-md">
        {/* Nhóm Chăm Sóc Da */}
        <div className="border-b border-gray-200">
          <button 
            onClick={() => toggleAccordion('csd')} 
            className="w-full flex justify-between items-center py-3 px-4 font-bold uppercase text-gray-900 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Chăm Sóc Da {openAccordion.csd ? <BsChevronUp /> : <BsChevronDown />}
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openAccordion.csd ? 'max-h-60' : 'max-h-0'}`}>
            <ul className="px-4 pb-3 space-y-2">
              {['Chăm sóc da|Chăm sóc da', 'Chăm sóc da & Cơ thể|Chăm sóc da & Cơ thể', 'Chăm sóc mắt|Chăm sóc mắt', 'Chăm sóc môi|Chăm sóc môi'].map(item => {
                const [val, label] = item.split('|');
                return (
                  <li key={val}>
                    <button 
                      onClick={() => onCategoryChange(val)}
                      className={`font-medium transition-colors cursor-pointer text-left ${
                        activeCategory === val ? 'text-rose-600 font-bold' : 'text-gray-600 hover:text-rose-600'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Nhóm Tóc & Cơ Thể */}
        <div className="border-b border-gray-200">
          <button 
            onClick={() => toggleAccordion('toc')} 
            className="w-full flex justify-between items-center py-3 px-4 font-bold uppercase text-gray-900 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Tóc & Cơ Thể {openAccordion.toc ? <BsChevronUp /> : <BsChevronDown />}
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openAccordion.toc ? 'max-h-60' : 'max-h-0'}`}>
            <ul className="px-4 pb-3 space-y-2">
              {['Chăm sóc tóc|Chăm sóc tóc', 'Chăm sóc cơ thể|Chăm sóc cơ thể', 'Chăm sóc cơ thể & Đa năng|Cơ thể & Đa năng', 'Chăm sóc cá nhân & Trẻ em|Cá nhân & Trẻ em'].map(item => {
                const [val, label] = item.split('|');
                return (
                  <li key={val}>
                    <button 
                      onClick={() => onCategoryChange(val)}
                      className={`font-medium transition-colors cursor-pointer text-left ${
                        activeCategory === val ? 'text-rose-600 font-bold' : 'text-gray-600 hover:text-rose-600'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Nhóm Trang Điểm & Hương */}
        <div>
          <button 
            onClick={() => toggleAccordion('trangdiem')} 
            className="w-full flex justify-between items-center py-3 px-4 font-bold uppercase text-gray-900 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Trang Điểm & Hương {openAccordion.trangdiem ? <BsChevronUp /> : <BsChevronDown />}
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openAccordion.trangdiem ? 'max-h-60' : 'max-h-0'}`}>
            <ul className="px-4 pb-3 space-y-2">
              {['Trang điểm|Trang điểm', 'Nước hoa|Nước hoa'].map(item => {
                const [val, label] = item.split('|');
                return (
                  <li key={val}>
                    <button 
                      onClick={() => onCategoryChange(val)}
                      className={`font-medium transition-colors cursor-pointer text-left ${
                        activeCategory === val ? 'text-rose-600 font-bold' : 'text-gray-600 hover:text-rose-600'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <h5 className="font-bold uppercase mb-4 tracking-wide text-gray-900">Lọc Thêm</h5>
      <div className="border border-gray-200 bg-white rounded-md">
        <button 
          onClick={() => toggleAccordion('price')} 
          className="w-full flex justify-between items-center py-3 px-4 font-bold uppercase text-gray-900 hover:text-rose-600 transition-colors cursor-pointer"
        >
          Mức Giá {openAccordion.price ? <BsChevronUp /> : <BsChevronDown />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${openAccordion.price ? 'max-h-60' : 'max-h-0'}`}>
          <div className="px-4 pb-4 space-y-3">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'under200', label: 'Dưới 200.000₫' },
              { id: '200to500', label: '200.000₫ - 500.000₫' },
              { id: 'above500', label: 'Trên 500.000₫' }
            ].map(price => (
              <div key={price.id} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${price.id}`}
                  name="priceFilter"
                  value={price.id}
                  checked={priceFilter === price.id}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onPriceFilterChange(e.target.value)}
                  className="w-4 h-4 text-rose-600 accent-rose-600 border-gray-300 focus:ring-rose-500 cursor-pointer"
                />
                <label 
                  htmlFor={`price-${price.id}`} 
                  className={`ml-2 cursor-pointer transition-colors ${
                    priceFilter === price.id ? 'text-rose-600 font-bold' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {price.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}