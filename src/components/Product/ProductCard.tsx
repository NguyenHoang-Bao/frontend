import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { BsCart } from 'react-icons/bs';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand?: string;
  sizes?: string[];
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
}

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

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
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
        <h3 
          className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-rose-600 transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-4 flex-wrap">
          <span className="text-rose-600 font-extrabold text-lg">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          <span className="text-gray-400 line-through text-xs font-medium">
            {origPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
        <button 
          className="mt-auto w-full bg-gray-900 hover:bg-rose-600 text-white font-bold py-2.5 rounded uppercase text-sm tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            onAddToCart(product, product.sizes?.[0] || '');
            alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
          }}
        >
          <BsCart /> Thêm
        </button>
      </div>
    </Link>
  );
}