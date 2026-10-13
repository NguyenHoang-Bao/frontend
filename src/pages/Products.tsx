import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CartContext } from '../context/CartContext';
import Pagination from '../components/Pagination/Pagination';

import Breadcrumb, { BreadcrumbItem } from '../components/Breadcrumb';
import ProductSidebar from '../components/Product/ProductSidebar';
import ProductSort from '../components/Product/ProductSort';
import ProductCard, { Product } from '../components/Product/ProductCard';

// ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC:
// Import hàm getProductsApi từ apiClient.ts để lấy sản phẩm từ backend
// Trước đây dùng: import productsData from '../data/products.json'  (dữ liệu tĩnh)
// Bây giờ dùng: getProductsApi() để lấy dữ liệu động từ database thật
import { getProductsApi, BackendProduct } from '../services/apiClient';

interface CartContextType {
  addToCart: (product: Product, size: string, quantity?: number) => void;
  [key: string]: any;
}

// Hàm chuyển đổi format từ BackendProduct (Java Spring) sang Product (React frontend)
// Vì tên field của backend (camelCase từ Java) đôi khi khác frontend
function mapBackendToProduct(p: BackendProduct): Product {
  return {
    id: p.idProduct,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice || p.price,
    thumbnail: p.thumbnail || '',
    images: p.images || [],
    inStock: p.inStock,
    sku: p.sku || '',
    capacity: p.capacity || '',
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    description: p.description || '',
    category: p.category?.name || '',
    brand: p.brand?.name || '',
    // Các field tùy chọn mà ProductCard cần
    image: p.thumbnail || '',
    benefits: [],
    keyIngredients: [],
    usage: '',
  } as unknown as Product;
}


export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC:
  // Dùng state để lưu danh sách sản phẩm lấy từ API (thay vì import JSON tĩnh)
  // isLoading: hiển thị spinner khi đang tải
  // error: hiển thị thông báo lỗi nếu API thất bại
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC:
  // useEffect chạy 1 lần khi component mount (tải trang)
  // Gọi getProductsApi() để lấy sản phẩm từ database backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gọi API: GET http://localhost:8080/api/products?size=100
        const pageData = await getProductsApi({ size: 100 });
        // pageData.content là mảng sản phẩm (pagination của Spring)
        // mapBackendToProduct() chuyển format backend → format frontend
        setAllProducts(pageData.content.map(mapBackendToProduct));
      } catch (err) {
        console.error('Không thể tải sản phẩm từ API:', err);
        setError('Không thể kết nối server. Hiển thị dữ liệu tĩnh...');
        // Fallback: nếu backend chưa chạy thì dùng dữ liệu JSON tĩnh
        try {
          const { default: productsData } = await import('../data/products.json');
          setAllProducts(productsData as unknown as Product[]);
        } catch {
          setAllProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []); // [] = chỉ chạy 1 lần khi trang load

  // Lọc danh sách các thương hiệu thực tế có trong sản phẩm
  const availableBrands = useMemo<string[]>(() => {
    const brandsSet = new Set<string>();
    allProducts.forEach(p => {
      if (p.brand && typeof p.brand === 'string') {
        const trimmed = p.brand.trim();
        if (trimmed) brandsSet.add(trimmed);
      }
    });
    return Array.from(brandsSet).sort();
  }, [allProducts]);

  // Đồng bộ danh mục và thương hiệu khi URL search params thay đổi
  useEffect(() => {
    const cat = searchParams.get('cat') || 'all';
    const brand = searchParams.get('brand') || 'all';
    setActiveCategory(cat);
    setSelectedBrand(brand);
    setCurrentPage(1);
  }, [searchParams]);
  
  const { addToCart } = useContext(CartContext) as CartContextType;
  const PRODUCTS_PER_PAGE = 12;


  const updateUrl = useCallback((cat: string, brand: string) => {
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('cat', cat);
    if (brand !== 'all') params.set('brand', brand);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    updateUrl(category, selectedBrand);
  }, [selectedBrand, updateUrl]);

  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
    updateUrl(activeCategory, brand);
  }, [activeCategory, updateUrl]);

  const handlePriceFilterChange = useCallback((price: string) => {
    setPriceFilter(price);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Lọc danh mục
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Lọc thương hiệu (chỉ các brand có trong products)
    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand?.trim() === selectedBrand);
    }

    // Lọc giá
    if (priceFilter === 'under200') {
      result = result.filter(p => p.price < 200000);
    } else if (priceFilter === '200to500') {
      result = result.filter(p => p.price >= 200000 && p.price <= 500000);
    } else if (priceFilter === 'above500') {
      result = result.filter(p => p.price > 500000);
    }

    // Sắp xếp
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allProducts, activeCategory, selectedBrand, priceFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', link: '/' },
    ];

    if (activeCategory === 'all' && selectedBrand === 'all') {
      items.push({ label: 'Sản phẩm' });
    } else {
      items.push({ 
        label: 'Sản phẩm', 
        link: '/products',
        onClick: () => {
          handleCategoryChange('all');
          handleBrandChange('all');
        }
      });

      if (activeCategory !== 'all') {
        items.push({ label: activeCategory });
      }
      if (selectedBrand !== 'all') {
        items.push({ label: `Thương hiệu: ${selectedBrand}` });
      }
    }

    return items;
  }, [activeCategory, selectedBrand, handleCategoryChange, handleBrandChange]);

  return (
    <main className="bg-gray-50 min-h-screen py-10 text-gray-900 pt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb điều hướng */}
        <Breadcrumb items={breadcrumbItems} />

        {/* ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC: Hiển thị trạng thái loading khi đang gọi API */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
            <span className="ml-3 text-slate-500">Đang tải sản phẩm từ server...</span>
          </div>
        )}

        {/* ĐÂY LÀ CHỖ M LÀM ĐỂ HỌC: Hiển thị cảnh báo nếu API lỗi (dùng dữ liệu tĩnh thay thế) */}
        {error && !isLoading && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {!isLoading && (
        <div className="flex flex-col lg:flex-row gap-8 mt-4">
          {/* Cột trái: Sidebar */}
          <ProductSidebar 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange}
            priceFilter={priceFilter}
            onPriceFilterChange={handlePriceFilterChange}
          />

          {/* Cột phải: Danh sách sản phẩm */}
          <div className="w-full lg:w-3/4">
            <ProductSort 
              sortBy={sortBy} 
              onSortChange={handleSortChange} 
              selectedBrand={selectedBrand}
              onBrandChange={handleBrandChange}
              brands={availableBrands}
            />


            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-20 w-full bg-white rounded-lg border border-gray-200">
                <h5 className="text-gray-500 text-xl font-medium">Không tìm thấy sản phẩm nào</h5>
                <button 
                  onClick={() => { 
                    handleCategoryChange('all'); 
                    handleBrandChange('all');
                    handlePriceFilterChange('all'); 
                  }} 
                  className="mt-4 text-rose-600 underline font-medium cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart} 
                  />
                ))}
              </div>
            )}

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        )}
      </div>
    </main>
  );
}
