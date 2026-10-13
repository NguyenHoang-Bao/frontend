import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Import all product data
import productsData from '../../data/products.json';

// 1. Định nghĩa Interface cho Product
interface Product {
  id: number | string;
  name: string;
  category?: string;
  price: number;
  originalPrice?: number;
  image: string;
  thumbnail?: string;
  images?: string[];
  description?: string;
  stock?: number;
  sizes?: string[];
  [key: string]: any;
}

// 2. Gán kiểu Record<string, Product[]> để TypeScript hiểu cấu trúc Object
const allProductsByCategory: Record<string, Product[]> = productsData.reduce((acc: Record<string, Product[]>, p) => {
  const cat = (p as any).category as string;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push(p as unknown as Product);
  return acc;
}, {});

// 3. Khai báo kiểu string cho path
const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/hb22fnuq/image/upload';
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop';

const getImageUrl = (path?: string) => {
  if (!path) return DEFAULT_PLACEHOLDER;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.includes('assets/')) {
    try {
      return new URL(path, import.meta.url).href;
    } catch {
      return DEFAULT_PLACEHOLDER;
    }
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CLOUDINARY_BASE_URL}/${cleanPath}`;
};

// 4. Khai báo kiểu cho props của ProductCard
const ProductCard = ({ product }: { product: Product }) => {
  const origPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : Math.round((product.price * 1.25) / 1000) * 1000;
  const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);

  const primaryImg = getImageUrl(product.image || product.thumbnail || (product.images && product.images[0]) || '');
  const secondImg = product.images && product.images.length > 1 && product.images[1] !== (product.image || product.thumbnail)
    ? getImageUrl(product.images[1])
    : null;

  return (
    <Link to={`/product/${product.id}`} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group flex flex-col relative">
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 shrink-0">
        {secondImg ? (
          <>
            {/* Ảnh chính (mặt trước) */}
            <img
              src={primaryImg}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = DEFAULT_PLACEHOLDER;
              }}
            />
            {/* Ảnh khi hover (mặt sau) */}
            <img
              src={secondImg}
              alt={`${product.name} (back view)`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = DEFAULT_PLACEHOLDER;
              }}
            />
          </>
        ) : (
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = DEFAULT_PLACEHOLDER;
            }}
          />
        )}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10">
            -{discountPercent}%
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-2 truncate text-sm uppercase tracking-wide">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-auto flex-wrap">
          <span className="text-rose-600 font-extrabold text-lg">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <span className="text-gray-400 line-through text-xs font-medium">
            {origPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>
    </Link>
  );
};

// 5. Khai báo kiểu cho props của RelatedProducts
const RelatedProducts = ({ currentProduct }: { currentProduct: Product | null }) => {
  // 6. Khai báo state là mảng chứa Product
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (currentProduct) {
      const productCategory = currentProduct.category;
      if (productCategory && allProductsByCategory[productCategory]) {
        const categoryProducts = allProductsByCategory[productCategory];
        // 7. Ép kiểu 'p' là Product và thêm .toString() để so sánh an toàn tuyệt đối
        const filteredProducts = categoryProducts.filter((p: Product) => p.id.toString() !== currentProduct.id.toString())
                                                 .sort(() => 0.5 - Math.random()); // Xáo trộn mảng
        setRelated(filteredProducts.slice(0, 4));
      }
    }
  }, [currentProduct]);

  if (related.length === 0) {
    return null;
  }

  return (
    <div className="mt-20 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wider">Có thể bạn cũng thích</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;