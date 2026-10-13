import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Barcode, Filter, Layers, Search } from 'lucide-react';
import { ProductVariantItem } from '../../types';
import ProductCard from './ProductCard';

interface ProductCatalogProps {
  products: ProductVariantItem[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onBarcodeSubmit: (e: React.FormEvent) => void;
  onAddToCart: (product: ProductVariantItem) => void;
  onReportOutOfStock?: (product: ProductVariantItem) => void;
  reportedIds?: Set<number>;
}

export default function ProductCatalog({
  products,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onBarcodeSubmit,
  onAddToCart,
  onReportOutOfStock,
  reportedIds = new Set()
}: ProductCatalogProps) {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Lắng nghe phím tắt F2 và F3 để tự động trỏ chuột vào ô quét barcode
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === 'F2' || e.key === 'F3') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Danh mục sản phẩm từ dữ liệu thực tế
  const categories = useMemo(() => {
    return ['Tất cả', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];
  }, [products]);

  // Thương hiệu từ dữ liệu thực tế
  const brands = useMemo(() => {
    return ['ALL', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch =
        !term ||
        p.productName.toLowerCase().includes(term) ||
        p.barcode.includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term);

      const matchCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;

      return matchSearch && matchCategory && matchBrand;
    });
  }, [products, search, selectedCategory, selectedBrand]);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full border-r border-[#d2d6de] bg-white font-sans">
      {/* Thanh quét Barcode, Lọc danh mục, Thương hiệu & Tìm kiếm */}
      <div className="p-2 bg-[#f4f6f9] border-b border-[#d2d6de] flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Bộ lọc danh mục (Dropdown) */}
        <div className="relative w-full sm:w-44">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-9 pl-7 pr-3 text-xs font-semibold bg-white border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none text-gray-700 cursor-pointer truncate"
            title="Lọc theo danh mục sản phẩm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'Tất cả' ? `Tất cả danh mục (${categories.length - 1})` : c}
              </option>
            ))}
          </select>
          <Layers size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Bộ lọc thương hiệu (Dropdown) */}
        <div className="relative w-full sm:w-44">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full h-9 pl-7 pr-3 text-xs font-semibold bg-white border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:outline-none text-gray-700 cursor-pointer truncate"
            title="Lọc theo thương hiệu"
          >
            <option value="ALL">Tất cả thương hiệu ({brands.length - 1})</option>
            {brands.filter((b) => b !== 'ALL').map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Ô tìm kiếm / Quét barcode */}
        <form onSubmit={onBarcodeSubmit} className="relative flex-1 min-w-[150px]">
          <input
            ref={barcodeInputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Quét mã vạch [F2] hoặc nhập tên, mã SKU, thương hiệu..."
            className="w-full h-9 pl-9 pr-3 text-xs font-medium border border-[#d2d6de] rounded focus:border-[#1b3b6f] focus:ring-1 focus:ring-[#1b3b6f] focus:outline-none bg-white transition-colors"
            autoFocus
          />
          <Barcode size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1b3b6f]" />
        </form>

        <button
          type="button"
          onClick={() => {
            barcodeInputRef.current?.focus();
            barcodeInputRef.current?.select();
          }}
          className="h-9 px-2.5 sm:px-3 bg-[#ecf0f5] text-[#1b3b6f] font-bold text-xs rounded border border-[#d2d6de] hover:bg-gray-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
          title="Nhấn hoặc bấm [F2] / [F3] để trỏ nhanh vào ô quét mã vạch"
        >
          <Barcode size={15} />
          <span>Quét [F2]</span>
        </button>

        <div className="text-[11px] text-gray-500 font-mono whitespace-nowrap hidden xl:block px-1">
          <strong>{filteredProducts.length}</strong>/{products.length} SP
        </div>
      </div>

      {/* Lưới sản phẩm - cuộn mặc định mượt mà */}
      <div className="flex-1 min-h-0 p-2.5 overflow-y-auto bg-[#ecf0f5]">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 content-start">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.idVariant}
              product={product}
              onAddToCart={onAddToCart}
              onReportOutOfStock={onReportOutOfStock}
              isReported={reportedIds.has(product.idVariant)}
            />
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400">
              <Search size={36} className="mx-auto mb-2 text-gray-300 stroke-1" />
              <p className="text-xs font-semibold">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Thử xóa từ khóa tìm kiếm hoặc chọn lại bộ lọc thương hiệu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
