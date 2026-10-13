import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BsCheckCircleFill } from 'react-icons/bs';

import { CartContext } from '../context/CartContext';
import productsData from '../data/products.json';

// Import Component Breadcrumb dùng chung
import Breadcrumb from '../components/Breadcrumb';

// Import các sub-components
import ProductGallery from '../components/ProductDetail/ProductGallery';
import ProductInfo from '../components/ProductDetail/ProductInfo';
import ProductTabs from '../components/ProductDetail/ProductTabs';
import RelatedProducts from '../components/ProductDetail/RelatedProducts';

// Đưa Interface ra xuất chung
export interface Product {
  id: string;
  sku?: string;
  slug?: string;
  name: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  capacity?: string;
  description?: string;
  benefits?: string[];
  keyIngredients?: string[];
  usage?: string;
  image: string;
  thumbnail?: string;
  images?: string[];
  inStock?: boolean;
  [key: string]: any;
}

interface CartContextType {
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  openCart: () => void;
  [key: string]: any;
}

const allProductsWithCategory: Product[] = productsData.map(p => ({
  ...p,
  id: p.id.toString()
})) as Product[];

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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addSuccessToast, setAddSuccessToast] = useState<boolean>(false);
  
  const { addToCart, openCart } = useContext(CartContext) as CartContextType;

  useEffect(() => {
    setLoading(true);
    const foundProduct = allProductsWithCategory.find(p => p.id === id || p.slug === id);
    if (foundProduct) {
      const imageList: string[] = [];
      if (foundProduct.images && Array.isArray(foundProduct.images)) {
        foundProduct.images.forEach(img => {
          const url = getImageUrl(img);
          if (url && !imageList.includes(url)) imageList.push(url);
        });
      }
      if (imageList.length === 0 && foundProduct.image) {
        const url = getImageUrl(foundProduct.image);
        if (url) imageList.push(url);
      }
      if (imageList.length === 0 && foundProduct.thumbnail) {
        const url = getImageUrl(foundProduct.thumbnail);
        if (url) imageList.push(url);
      }
      if (imageList.length === 0) {
        imageList.push(DEFAULT_PLACEHOLDER);
      }
      setProduct({ ...foundProduct, images: imageList });
    } else {
      setProduct(null);
    }
    setLoading(false);
  }, [id]);

  const handleAddToCart = (qty: number) => {
    if (!product) return;
    addToCart(product, product.capacity || 'Tiêu chuẩn', qty);
    setAddSuccessToast(true);
    setTimeout(() => setAddSuccessToast(false), 3000);
  };

  const handleBuyNow = (qty: number) => {
    if (!product) return;
    addToCart(product, product.capacity || 'Tiêu chuẩn', qty);
    if (openCart) openCart();
  };

  if (loading) {
    return (
      <div className="bg-white text-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center text-center py-12 pt-28">
        <h2 className="text-2xl font-bold mb-4">404 - Không tìm thấy sản phẩm</h2>
        <p className="text-gray-600 mb-6">Sản phẩm mỹ phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.</p>
        <Link to="/products" className="bg-rose-500 text-white px-6 py-3 font-bold uppercase rounded-lg hover:bg-rose-600 transition-colors">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const origPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : Math.round((product.price * 1.25) / 1000) * 1000;

  const discountPercent = Math.round(((origPrice - product.price) / origPrice) * 100);

  // Xây dựng mảng breadcrumb động dựa trên thông tin sản phẩm
  const breadcrumbItems: Array<{ label: string; link?: string }> = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Sản phẩm', link: '/products' }
  ];
  
  if (product.category) {
    breadcrumbItems.push({ label: product.category });
  }
  if (product.subCategory) {
    breadcrumbItems.push({ label: product.subCategory });
  }
  // Thêm tên sản phẩm làm item cuối cùng (không có link)
  breadcrumbItems.push({ label: product.name });

  return (
    <main className="bg-white text-gray-900 min-h-screen py-10 pt-[100px] md:pt-[120px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Sử dụng Breadcrumb dùng chung */}
        <Breadcrumb items={breadcrumbItems} />

        {addSuccessToast && (
          <div className="fixed top-24 right-4 sm:right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-neutral-700 animate-bounce">
            <BsCheckCircleFill className="text-emerald-400" size={18} />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Đã thêm vào giỏ hàng!</p>
            </div>
          </div>
        )}

        {/* Khối Chi tiết chính (2 Cột) */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          <ProductGallery 
            images={product.images || []} 
            name={product.name} 
            discountPercent={discountPercent} 
            inStock={product.inStock} 
          />
          
          <ProductInfo 
            product={product} 
            discountPercent={discountPercent} 
            onAddToCart={handleAddToCart} 
            onBuyNow={handleBuyNow} 
          />
        </div>

        <ProductTabs product={product} />

        <div className="mt-16">
          <RelatedProducts currentProduct={product} />
        </div>

      </div>
    </main>
  );
}