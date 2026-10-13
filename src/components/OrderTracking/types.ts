export interface OrderItem {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }
  
  export interface Order {
    id: string;
    date: string;
    status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
    statusText: string;
    total: number;
    shippingAddress: string;
    phone: string;
    customerName: string;
    paymentMethod: string;
    items: OrderItem[];
  }
  
  // Hàm tạo dữ liệu mẫu dùng chung
  export function getDefaultOrders(name = 'Quý khách', phone = '0359490221'): Order[] {
    return [
      {
        id: 'HBC-82914',
        date: '14/09/2026 - 10:30',
        status: 'shipping',
        statusText: 'Đang vận chuyển',
        total: 580000,
        customerName: name,
        phone: phone || '0359490221',
        shippingAddress: '140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP. HCM',
        paymentMethod: 'Thanh toán khi nhận hàng (COD)',
        items: [
          {
            id: 1,
            name: 'Son Kem Lì Mịn Mượt Môi Dưỡng Ẩm Hoàng Bảo',
            price: 290000,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 'HBC-71822',
        date: '02/09/2026 - 15:45',
        status: 'delivered',
        statusText: 'Đã giao hàng thành công',
        total: 850000,
        customerName: name,
        phone: phone || '0359490221',
        shippingAddress: '140 Lê Trọng Tấn, P. Tây Thạnh, Q. Tân Phú, TP. HCM',
        paymentMethod: 'Chuyển khoản ngân hàng',
        items: [
          {
            id: 2,
            name: 'Tinh Chất Serum Phục Hồi Và Làm Sáng Da Căng Bóng',
            price: 450000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80&auto=format&fit=crop'
          },
          {
            id: 3,
            name: 'Kem Chống Nắng Dịu Nhẹ Nâng Tone Kiềm Dầu SPF50+',
            price: 400000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80&auto=format&fit=crop'
          }
        ]
      }
    ];
  }