import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
// Xóa đuôi .jsx ở dòng import
import { CartContext } from '../context/CartContext';

// 1. Định nghĩa kiểu dữ liệu cho 1 item trong giỏ hàng
interface CartItem {
  cartItemId: string;
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  [key: string]: any; // Dành cho các thuộc tính dư thừa khác nếu có
}

// 2. Định nghĩa kiểu dữ liệu cho Context
interface CartContextType {
  isCartOpen: boolean;
  cart: CartItem[];
  closeCart: () => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/hb22fnuq/image/upload';
const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop';

const getImageUrl = (path: string) => {
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

export default function CartPanel() {
  // Ép kiểu Context để TypeScript hiểu các hàm và biến được lấy ra
  const { isCartOpen, closeCart, cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext) as CartContextType;

  // Khai báo kiểu cho sum và item trong hàm reduce
  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  
  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?')) {
        clearCart();
    }
  }

  if (!isCartOpen) return null;

  return (
    <div className="fixed top-0 right-0 z-[100] h-full" aria-modal="true">
      {/* Cart Panel - chỉ chiếm bên phải, không có overlay đen */}
      <div className="flex flex-col w-full max-w-md bg-white text-black shadow-2xl h-full border-l border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold uppercase tracking-wider">Giỏ Hàng</h2>
          <button onClick={closeCart} className="text-gray-500 hover:text-black p-1">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
            {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Giỏ hàng trống</p>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    {cart.map(item => (
                        <div key={item.cartItemId} className="flex gap-4">
                        <div className="w-24 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={getImageUrl(item.image)} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = DEFAULT_PLACEHOLDER;
                              }}
                            />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                            {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                            <p className="text-sm font-semibold text-orange-600 mt-1">{item.price.toLocaleString('vi-VN')}₫</p>
                            <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center border border-gray-300 rounded">
                                <button 
                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                className="px-2 py-1 text-lg leading-none"
                                >-</button>
                                <span className="px-3 py-1 text-sm">{item.quantity}</span>
                                <button 
                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                className="px-2 py-1 text-lg leading-none"
                                >+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.cartItemId)} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 size={18} />
                            </button>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
            <span className="font-bold">Tổng cộng:</span>
            <span className="font-bold text-xl text-orange-600">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <Link
                to="/checkout"
                onClick={closeCart}
                className={`w-full block text-center py-3 font-bold text-uppercase tracking-wider transition-colors ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                aria-disabled={cart.length === 0}
                tabIndex={cart.length === 0 ? -1 : undefined}
                style={{ pointerEvents: cart.length === 0 ? 'none' : 'auto' }}
            >
                Thanh Toán
            </Link>
            <button
                onClick={handleClearCart}
                className="w-full mt-2 py-3 font-bold text-uppercase tracking-wider border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cart.length === 0}
            >
                Xóa Giỏ Hàng
            </button>
        </div>
      </div>
    </div>
  );
}