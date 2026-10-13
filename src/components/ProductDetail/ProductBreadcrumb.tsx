import { Link } from 'react-router-dom';
import { Product } from '../../pages/ProductDetail'; // Import type

export default function ProductBreadcrumb({ product }: { product: Product }) {
  return (
    <nav className="mb-6 text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5">
      <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
      <span>/</span>
      <Link to="/products" className="hover:text-rose-600 transition-colors">Sản phẩm</Link>
      {product.category && (
        <>
          <span>/</span>
          <span className="text-gray-600">{product.category}</span>
        </>
      )}
      {product.subCategory && (
        <>
          <span>/</span>
          <span className="text-gray-600">{product.subCategory}</span>
        </>
      )}
      <span>/</span>
      <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">
        {product.name}
      </span>
    </nav>
  );
}