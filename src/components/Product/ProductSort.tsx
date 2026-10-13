import { ChangeEvent } from 'react';

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  brands: string[];
}

export default function ProductSort({ 
  sortBy, 
  onSortChange, 
  selectedBrand, 
  onBrandChange, 
  brands 
}: ProductSortProps) {
  return (
    <div className="flex flex-wrap justify-between sm:justify-end items-center gap-4 sm:gap-6 mb-6 pb-4 border-b border-gray-200">
      {/* Bộ lọc Thương hiệu nhân bản theo định dạng của Sort */}
      <div className="flex items-center gap-2 sm:gap-3">
        <label htmlFor="brandSelect" className="text-gray-600 font-medium whitespace-nowrap text-sm">
          Thương hiệu:
        </label>
        <select
          id="brandSelect"
          value={selectedBrand}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onBrandChange(e.target.value)}
          className="border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-rose-500 focus:border-rose-500 block p-2 cursor-pointer outline-none bg-white min-w-[150px]"
        >
          <option value="all">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Bộ lọc Sắp xếp */}
      <div className="flex items-center gap-2 sm:gap-3">
        <label htmlFor="sortSelect" className="text-gray-600 font-medium whitespace-nowrap text-sm">
          Sắp xếp:
        </label>
        <select
          id="sortSelect"
          value={sortBy}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onSortChange(e.target.value)}
          className="border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-rose-500 focus:border-rose-500 block p-2 cursor-pointer outline-none bg-white"
        >
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
        </select>
      </div>
    </div>
  );
}