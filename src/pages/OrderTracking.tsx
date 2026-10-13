import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GuestTracking from '../components/OrderTracking/GuestTracking';
import UserTracking from '../components/OrderTracking/UserTracking';

export default function OrderTracking() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('currentUser');
      if (u) {
        setCurrentUser(JSON.parse(u));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header Banner dùng chung */}
      <section className="bg-white border-b border-gray-200 py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <nav className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <Link to="/" className="hover:text-rose-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Tra cứu đơn hàng</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Tra Cứu Đơn Hàng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Theo dõi hành trình và cập nhật tình trạng giao nhận đơn hàng của bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tách nhánh logic hiển thị dựa trên trạng thái đăng nhập */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl">
        {!currentUser ? (
          <GuestTracking />
        ) : (
          <UserTracking currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}