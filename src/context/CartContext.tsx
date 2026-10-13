import { createContext, useState, useEffect, ReactNode } from 'react';

// 1. Định nghĩa kiểu cho Product truyền vào
export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  [key: string]: any; // Hỗ trợ thêm các thuộc tính khác
}

// 2. Định nghĩa kiểu cho một Item nằm trong Giỏ hàng
export interface CartItem extends Product {
  cartItemId: string; // ID duy nhất trong giỏ hàng (chứa cả size)
  quantity: number;
  size?: string;
}

// 3. Định nghĩa kiểu cho toàn bộ Context
interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
}

// 4. Khởi tạo Context với kiểu dữ liệu
export const CartContext = createContext<CartContextType>({} as CartContextType);

// 5. Khai báo kiểu cho Props của Provider
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Khai báo rõ ràng đây là mảng CartItem[]
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Thêm kiểu cho các tham số
  const addToCart = (product: Product, size?: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        const newItem: CartItem = {
          ...product,
          quantity,
          size,
          cartItemId: `${product.id}-${size || ''}-${Date.now()}` // Tạo ID duy nhất
        };
        return [...prevCart, newItem];
      }
    });
    openCart(); // Tự động mở giỏ hàng khi thêm thành công
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        isCartOpen, 
        openCart, 
        closeCart, 
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};